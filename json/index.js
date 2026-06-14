const express = require('express')
const app = express()

app.use(express.json())

const equipes = require('./equipes.json')
const joueurs = require('./joueurs.json')


// GET /equipes 
app.get('/equipes', (req, res) => {
    res.status(200).json(equipes)
})

// GET /equipes/:id 
app.get('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const equipe = equipes.find(equipe => equipe.id === id)
    res.status(200).json(equipe)
})

// POST /equipes
app.post('/equipes', (req, res) => {
    equipes.push(req.body)
    res.status(200).json(equipes)
})

// PUT /equipes/:id 
app.put('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let equipe = equipes.find(equipe => equipe.id === id)
    equipe.name = req.body.name
    equipe.country = req.body.country
    res.status(200).json(equipe)
})

// DELETE /equipes/:id 
app.delete('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let equipe = equipes.find(equipe => equipe.id === id)
    equipes.splice(equipes.indexOf(equipe), 1)
    res.status(200).json(equipes)
})


// GET /joueurs 
app.get('/joueurs', (req, res) => {
    res.status(200).json(joueurs)
})

// GET /joueurs/:id 
app.get('/joueurs/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const joueur = joueurs.find(j => j.id === id)
    res.status(200).json(joueur)
})

// POST /joueurs 
app.post('/joueurs', (req, res) => {
    joueurs.push(req.body)
    res.status(200).json(joueurs)
})

// PUT /joueurs/:id 
app.put('/joueurs/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let joueur = joueurs.find(j => j.id === id)
    joueur.nom = req.body.nom
    joueur.numero = req.body.numero
    joueur.poste = req.body.poste
    joueur.idEquipe = req.body.idEquipe
    res.status(200).json(joueur)
})

// DELETE /joueurs/:id 
app.delete('/joueurs/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let joueur = joueurs.find(j => j.id === id)
    joueurs.splice(joueurs.indexOf(joueur), 1)
    res.status(200).json(joueurs)
})


// GET /equipes/:id/joueurs
app.get('/equipes/:id/joueurs', (req, res) => {
    const idEquipe = parseInt(req.params.id)
    const joueursEquipe = joueurs.filter(j => j.idEquipe === idEquipe)
    //                                   ↑
    res.status(200).json(joueursEquipe)
})


// GET /joueurs/:id/equipe
app.get('/joueurs/:id/equipe', (req, res) => {
    const id = parseInt(req.params.id)
    const joueur = joueurs.find(j => j.id === id)
    const equipe = equipes.find(e => e.id === joueur.idEquipe)
    res.status(200).json(equipe)
})


// GET /joueurs/search/:nom
app.get('/joueurs/search/:nom', (req, res) => {
    const nom = req.params.nom
    const joueur = joueurs.find(j => j.nom === nom)
    res.status(200).json(joueur)
})


app.listen(82, () => {
    console.log('REST API via ExpressJS')
})