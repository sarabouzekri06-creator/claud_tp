const express = require('express')
const { MongoClient } = require('mongodb')

const app = express()
app.use(express.json())

const url = 'mongodb://mongodb:27017'
const dbName = 'db-membre'
let db

MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName)
        console.log('Connecte a MongoDB ')
    })
    .catch(err => console.log(err))


// GET /membres
app.get('/membres', async (req, res) => {
    try {
        const membres = await db.collection('membres').find({}).toArray()
        res.status(200).json(membres)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// GET /membres/:id
app.get('/membres/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const membre = await db.collection('membres').findOne({ id })

        if (!membre) return res.status(404).json({ message: 'Membre non trouvé' })

        res.status(200).json(membre)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// POST /membres
app.post('/membres', async (req, res) => {
    try {
        
        const { nom, email } = req.body

        const existant = await db.collection('membres').findOne({ email })
        if (existant) return res.status(400).json({ message: 'Email deja utilisé' })

        const tous = await db.collection('membres').find({}).toArray()

        const data = {
            id: tous.length > 0 ? Math.max(...tous.map(t => t.id)) + 1 : 1,
            nom,      
            email,    
            actif: true
        }

        await db.collection('membres').insertOne(data)
        res.status(201).json(data)  
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PUT /membres/:id
app.put('/membres/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const membre = await db.collection('membres').findOne({ id })

        if (!membre) return res.status(404).json({ message: 'Membre non trouva' })

        const { nom, email, actif } = req.body

        await db.collection('membres').replaceOne(
            { id },
            { id, nom, email, actif }
          
        )

        res.status(200).json({ id, nom, email, actif })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PATCH /membres/:id/statut  
app.patch('/membres/:id/statut', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { actif } = req.body

        const result = await db.collection('membres')
            .updateOne({ id }, { $set: { actif } })

    
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Membre non trouve' })

        res.status(200).json({ message: 'Statut mis à jour' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// DELETE /membres/:id
app.delete('/membres/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await db.collection('membres').deleteOne({ id })

        
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Membre non trouvé' })

        res.status(200).json({ message: 'Membre supprime !' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


app.listen(3002, () => {
    console.log('Serveur sur http://localhost:3002')
})