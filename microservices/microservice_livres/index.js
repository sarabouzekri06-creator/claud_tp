const express = require('express')
const { MongoClient } = require('mongodb')

const app = express()
app.use(express.json())

const url = 'mongodb://mongodb:27017'
const dbName = 'db-livre'
let db

MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName)
        console.log('Connecté à MongoDB !')
    })
    .catch(err => console.log(err))


// GET /livres
app.get('/livres', async (req, res) => {
    try {
        const livres = await db.collection('livres').find({}).toArray()
        res.status(200).json(livres)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// GET /livres/disponibles 
app.get('/livres/disponibles', async (req, res) => {
    try {
        const livres = await db.collection('livres').find({ disponible: true }).toArray()
        res.status(200).json(livres)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// GET /livres/:id
app.get('/livres/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const livre = await db.collection('livres').findOne({ id })

        if (!livre) return res.status(404).json({ message: 'Livre non trouvé' })

        res.status(200).json(livre)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// POST /livres
app.post('/livres', async (req, res) => {
    try {
       
        const { titre, auteur, isbn } = req.body

        const tous = await db.collection('livres').find({}).toArray()

        const data = {
            id: tous.length > 0 ? Math.max(...tous.map(t => t.id)) + 1 : 1,
            titre,
            auteur,
            isbn,
            disponible: true     
        }

        await db.collection('livres').insertOne(data)
        res.status(201).json(data)  
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PUT /livres/:id
app.put('/livres/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const livre = await db.collection('livres').findOne({ id })

        if (!livre) return res.status(404).json({ message: 'Livre non trouvé' })

        const { titre, auteur, isbn, disponible } = req.body

        await db.collection('livres').replaceOne(
            { id },
            { id, titre, auteur, isbn, disponible }
            
        )

        res.status(200).json({ id, titre, auteur, isbn, disponible })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// PATCH /livres/:id/disponibile  
app.patch('/livres/:id/disponibile', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { disponible } = req.body

        const result = await db.collection('livres')
            .updateOne({ id }, { $set: { disponible } })

        
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Livre non trouvé' })

        res.status(200).json({ message: 'disponibile mise à jour' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// DELETE /livres/:id
app.delete('/livres/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await db.collection('livres').deleteOne({ id })

       
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Livre non trouvé' })

        res.status(200).json({ message: 'Livre supprimé !' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


app.listen(3001, () => {
    console.log('Serveur sur http://localhost:3001')
})