const express = require('express')
const app = express()

app.use(express.json())

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const dbName = 'bdmonapi'
let db

MongoClient.connect(url, function(err, client) {
    console.log("Connexion reussi")
    db = client.db(dbName)
})


//GET /equipes
app.get('/equipes', (req, res) => {
    db.collection('equipe').find({}).toArray(function(err, docs) {
        if (err) {
            console.log(err)
            throw err
        }
        res.status(200).json(docs)
    })
})


// GET /equipes/:id
app.get('/equipes/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const equipe = await db.collection('equipe').find({ id }).toArray()
        res.status(200).json(equipe)
    } catch (err) {
        console.log(err)
        throw err
    }
})


// POST /equipes
app.post('/equipes', async (req, res) => {
    try {
        const data = req.body
        const equipe = await db.collection('equipe').insertOne(data)
        res.status(200).json(equipe)
    } catch (err) {
        console.log(err)
        throw err
    }
})


// PUT /equipes/:id
app.put('/equipes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const edit = req.body
        const equipe = await db.collection('equipe').replaceOne({ id }, edit)
        res.status(200).json(equipe)
    } catch (err) {
        console.log(err)
        throw err
    }
})


// DELETE /equipes/:id
app.delete('/equipes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const equipe = await db.collection('equipe').deleteOne({ id })
        res.status(200).json(equipe)
    } catch (err) {
        console.log(err)
        throw err
    }
})


app.listen(82, () => {
    console.log('REST API via ExpressJS')
})