const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.get('/', async (req, res) => {
    try {
      const orders = await db.collection('orders').find({}).toArray();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await db.collection('orders').findOne({ id });
      res.status(200).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const orderData = req.body;
      const result = await db.collection('orders').insertMany(orderData);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newData = req.body;
      const result = await db.collection('orders').replaceOne({ id }, newData);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.collection('orders').deleteOne({ id });
      res.status(200).json({ message: 'Commande supprimée' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};