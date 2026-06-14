const express = require('express')
const axios   = require('axios')
const amqp    = require('amqplib')
const { MongoClient } = require('mongodb')

const app = express()
app.use(express.json())

const MONGO_URL    = 'mongodb://localhost:27017'
const OFFRE_SERVICE = 'http://localhost:3001'
const RABBITMQ_URL = 'amqp://localhost'

const client = new MongoClient(MONGO_URL)
let db
let channel

async function connecterRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertQueue('nouvelle_candidature', { durable: true })
        console.log('candidature-service connecté à RabbitMQ')
    } catch (err) {
        console.log('RabbitMQ pas prêt, retry dans 5s...')
        setTimeout(connecterRabbitMQ, 5000)
    }
}

function envoyerMessage(nomFile, data) {
    channel.sendToQueue(
        nomFile,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    )
    console.log(`[RABBITMQ] Message envoyé dans ${nomFile} :`, data)
}

async function demarrer() {
    await client.connect()
    db = client.db('rh_candidatures')
    console.log('candidature-service connecté à MongoDB')

    await connecterRabbitMQ()

    // GET 
    app.get('/candidatures', async (req, res) => {
        try {
            const candidatures = await db.collection('candidatures').find({}).toArray()
            res.status(200).json(candidatures)
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    // GET 
    app.get('/candidatures/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id)
            const candidature = await db.collection('candidatures').findOne({ id })
            if (!candidature) return res.status(404).json({ message: 'Candidature non trouvée' })
            res.status(200).json(candidature)
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

   
    app.get('/candidatures/offre/:idOffre', async (req, res) => {
        try {
            const idOffre = parseInt(req.params.idOffre)
            const candidatures = await db.collection('candidatures').find({ idOffre }).toArray()
            res.status(200).json(candidatures)
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    // POST 
    app.post('/candidatures', async (req, res) => {
        try {
            const { idOffre, nomCandidat, email, cv } = req.body

            let offre
            try {
                const rep = await axios.get(`${OFFRE_SERVICE}/offres/${idOffre}`)
                offre = rep.data
            } catch (err) {
                return res.status(404).json({ message: 'Offre non trouvée' })
            }

            if (offre.statut !== 'ouverte') {
                return res.status(400).json({ message: 'Offre fermée' })
            }

            const tous = await db.collection('candidatures').find({}).toArray()
            const candidature = {
                id: tous.length > 0 ? Math.max(...tous.map(c => c.id)) + 1 : 1,
                idOffre,
                titreOffre: offre.titre,
                nomCandidat,
                email,
                cv,
                datePostulation: new Date().toISOString()
            }
            await db.collection('candidatures').insertOne(candidature)

            envoyerMessage('nouvelle_candidature', {
                idOffre,
                nomCandidat,
                email,
                action: 'NOUVELLE_CANDIDATURE'
            })

            res.status(201).json({
                message: 'Candidature enregistrée avec succès',
                candidature
            })

        } catch (err) {
            if (err.response?.status === 404) {
                return res.status(404).json({ message: 'Offre non trouvée' })
            }
            res.status(500).json({ message: err.message })
        }
    })

    app.listen(3002, () => console.log('candidature-service démarré sur le port 3002'))
}

demarrer()