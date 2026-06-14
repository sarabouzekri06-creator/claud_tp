const express = require('express')
const { MongoClient } = require('mongodb')
const axios = require('axios')  

const app = express()
app.use(express.json())

const url = 'mongodb://mongodb:27017'
const dbName = 'db-emprunt'
let db

const LIVRE_SERVICE = 'http://livre-service:3001'
const MEMBRE_SERVICE = 'http://membre-service:3002'

MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName)
        console.log('Connecté à MongoDB !')
    })
    .catch(err => console.log(err))


// GET /emprunts
app.get('/emprunts', async (req, res) => {
    try {
        const emprunts = await db.collection('emprunts').find({}).toArray()
        res.status(200).json(emprunts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//  GET /emprunts/en-cours
app.get('/emprunts/en-cours', async (req, res) => {
    try {
        const emprunts = await db.collection('emprunts').find({ retourne: false }).toArray()
        res.status(200).json(emprunts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//  GET /emprunts/membre/:idMembre
app.get('/emprunts/membre/:idMembre', async (req, res) => {
    try {
        const idMembre = parseInt(req.params.idMembre)
        const emprunts = await db.collection('emprunts').find({ idMembre }).toArray()
        res.status(200).json(emprunts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// GET /emprunts/:id
app.get('/emprunts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const emprunt = await db.collection('emprunts').findOne({ id })

        if (!emprunt) return res.status(404).json({ message: 'Emprunt non trouvé' })

        res.status(200).json(emprunt)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// POST /emprunts
app.post('/emprunts', async (req, res) => {
    try {
        
        const { idMembre, idLivre } = req.body

        
        let membre
        try {
            const rep = await axios.get(`${MEMBRE_SERVICE}/membres/${idMembre}`)
            membre = rep.data
        } catch (err) {
            return res.status(404).json({ message: 'Membre non trouvé' })
        }
        if (!membre.actif) return res.status(400).json({ message: 'Membre inactif' })

        let livre
        try {
            const rep = await axios.get(`${LIVRE_SERVICE}/livres/${idLivre}`)
            livre = rep.data
        } catch (err) {
            return res.status(404).json({ message: 'Livre non trouvé' })
        }
        if (!livre.disponible) return res.status(400).json({ message: 'Livre non disponible' })

        const tous = await db.collection('emprunts').find({}).toArray()

        const data = {
            id: tous.length > 0 ? Math.max(...tous.map(t => t.id)) + 1 : 1,
            idMembre,
            idLivre,
            nomMembre: membre.nom,       
            titreLivre: livre.titre,      
            dateEmprunt: new Date().toISOString(),  
            dateRetour: null,             
            retourne: false               
        }

        await db.collection('emprunts').insertOne(data)

        await axios.patch(`${LIVRE_SERVICE}/livres/${idLivre}/disponibile`, { disponible: false })

        res.status(201).json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


app.patch('/emprunts/:id/retour', async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const emprunt = await db.collection('emprunts').findOne({ id })
        if (!emprunt) return res.status(404).json({ message: 'Emprunt non trouvé' })

        if (emprunt.retourne) return res.status(400).json({ message: 'Livre deja retourné' })

        await db.collection('emprunts').updateOne(
            { id },
            { $set: { retourne: true, dateRetour: new Date().toISOString() } }
        )

        await axios.patch(`${LIVRE_SERVICE}/livres/${emprunt.idLivre}/disponibile`, { disponible: true })

        res.status(200).json({ message: 'Livre !!!' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// DELETE /emprunts/:id
app.delete('/emprunts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await db.collection('emprunts').deleteOne({ id })


        if (result.deletedCount === 0) return res.status(404).json({ message: 'Emprunt non trouvé' })

        res.status(200).json({ message: 'Emprunt supprimé !' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


app.listen(3003, () => {
    console.log('Serveur sur http://localhost:3003')
})