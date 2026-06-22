const express = require('express');
const Client = require('../models/client');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.userId });
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create client
router.post('/', auth, async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, user: req.user.userId });
    res.status(201).json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete client
router.delete('/:id', auth, async (req, res) => {
  try {
    await Client.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;