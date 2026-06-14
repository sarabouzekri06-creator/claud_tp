const express = require('express')
const { MongoClient } = require('mongodb')
const { login, verifierToken } = require('./auth')

const app = express()
app.use(express.json())


const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(MONGO_URL)
// const client = new MongoClient('mongodb://127.0.0.1:27017')
let db

client.connect().then(() => {
    db = client.db('bdmonapi')
    console.log('MongoDB connecté !')
}).catch(err => {
    console.log('Erreur MongoDB :', err)
})


app.post('/login', login)


app.get('/equipes', verifierToken, async (req, res) => {
    try {
        const equipes = await db.collection('equipe').find({}).toArray()
        res.status(200).json(equipes)
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' })
    }
})


app.get('/equipes/:id', verifierToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const equipe = await db.collection('equipe').findOne({ id })

        if (!equipe) {
            return res.status(404).json({ message: 'Équipe non trouvée' })
        }

        res.status(200).json(equipe)
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' })
    }
})


app.post('/equipes', verifierToken, async (req, res) => {
    try {
        const nouvelleEquipe = req.body
        await db.collection('equipe').insertOne(nouvelleEquipe)
        res.status(200).json({
            message: 'Équipe ajoutée !',
            equipe: nouvelleEquipe
        })
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' })
    }
})


app.put('/equipes/:id', verifierToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const modification = req.body

        const result = await db.collection('equipe').updateOne(
            { id: id },
            { $set: modification }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Équipe non trouvée' })
        }

        res.status(200).json({ message: 'Équipe modifiée !' })
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' })
    }
})


app.delete('/equipes/:id', verifierToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const result = await db.collection('equipe').deleteOne({ id })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Équipe non trouvée' })
        }

        res.status(200).json({ message: `Équipe ${id} supprimée !` })
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' })
    }
})


app.listen(3000, () => {
    console.log('Serveur lancé sur http://127.0.0.1:3000')
})