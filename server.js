const express=require('express')
const { MongoClient } = require('mongodb');

const app=express()

app.use(express.json())

const url = 'mongodb://localhost:27017';
const dbName = 'boutique';

let db;

MongoClient.connect(url)
  .then(client => {
    db = client.db(dbName);
    console.log(' Connecté à MongoDB');

    app.use('/api/products', require('./routes/products')(db));
    app.use('/api/users',    require('./routes/users')(db));
    app.use('/api/orders',   require('./routes/orders')(db));

    app.listen(3000, () => {
      console.log('Serveur sur http://localhost:3000');
    });
  })
  .catch(err => console.log('Erreur:', err));