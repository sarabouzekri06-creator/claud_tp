const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.get('/', async (req, res) => {
    try {
      const products = await db.collection('products').find({}).toArray();
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await db.collection('products').findOne({ id });
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const productData = req.body;
      const result = await db.collection('products').insertMany(productData);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newData = req.body;
      const result = await db.collection('products').replaceOne({ id }, newData);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db.collection('products').deleteOne({ id });
      res.status(200).json({ message: 'Produit supprimé' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};