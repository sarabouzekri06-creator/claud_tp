const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.get('/', async (req, res) => {
    try {
      const users = await db.collection('users').find({}).toArray();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await db.collection('users').findOne({ id });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const userData = req.body;
      const result = await db.collection('users').insertMany(userData);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newData = req.body;
      const result = await db.collection('users').replaceOne({ id }, newData);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.collection('users').deleteOne({ id });
      res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};