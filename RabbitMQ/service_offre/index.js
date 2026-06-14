const express = require('express')
const amqp = require('amqplib')
const { MongoClient } = require('mongodb')

const app = express()
app.use(express.json())

const MONGO_URL    = 'mongodb://localhost:27017'
const RABBITMQ_URL = 'amqp://localhost'

const client = new MongoClient(MONGO_URL)
let db

async function ecouterRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL)
        const channel    = await connection.createChannel()

        await channel.assertQueue('nouvelle_candidature', { durable: true })
        channel.prefetch(1)

        console.log('offre-service écoute nouvelle_candidature...')

        channel.consume('nouvelle_candidature', async (msg) => {
            if (!msg) return

            const data = JSON.parse(msg.content.toString())
            console.log('[RABBITMQ] Message reçu :', data)

            try {
                await db.collection('offres').updateOne(
                    { id: data.idOffre },
                    { $inc: { nbCandidatures: 1 } }
                )
                console.log(`Offre ${data.idOffre} : nbCandidatures + 1`)
                channel.ack(msg)
            } catch (err) {
                console.log('Erreur:', err.message)
                channel.nack(msg, false, true)
            }
        })

    } catch (err) {
        console.log('RabbitMQ pas prêt, retry dans 5s...')
        setTimeout(ecouterRabbitMQ, 5000)
    }
}

async function demarrer() {
    await client.connect()
    db = client.db('rh_offres')
    console.log('offre-service connecté à MongoDB')

    await ecouterRabbitMQ()

    // GET 
    app.get('/offres', async (req, res) => {
        try {
            const offres = await db.collection('offres').find({}).toArray()
            res.status(200).json(offres)
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    // GET 
    app.get('/offres/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id)
            const offre = await db.collection('offres').findOne({ id })
            if (!offre) return res.status(404).json({ message: 'Offre non trouvée' })
            res.status(200).json(offre)
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    // POST 
    app.post('/offres', async (req, res) => {
        try {
            const tous = await db.collection('offres').find({}).toArray()
            const offre = {
                id: tous.length > 0 ? Math.max(...tous.map(o => o.id)) + 1 : 1,
                titre: req.body.titre,
                description: req.body.description,
                statut: req.body.statut || 'ouverte',
                nbCandidatures: 0
            }
            await db.collection('offres').insertOne(offre)
            res.status(201).json(offre)
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    // PUT 
    app.put('/offres/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id)
            const result = await db.collection('offres').replaceOne(
                { id },
                { id, ...req.body }
            )
            if (result.matchedCount === 0) return res.status(404).json({ message: 'Offre non trouvée' })
            res.status(200).json({ id, ...req.body })
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    // DELETE 
    app.delete('/offres/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id)
            const result = await db.collection('offres').deleteOne({ id })
            if (result.deletedCount === 0) return res.status(404).json({ message: 'Offre non trouvée' })
            res.status(200).json({ message: `Offre ${id} supprimée` })
        } catch (err) { res.status(500).json({ message: err.message }) }
    })

    app.listen(3001, () => console.log('offre-service démarré sur le port 3001'))
}

demarrer()