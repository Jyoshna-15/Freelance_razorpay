const express = require('express');
const Invoice = require('../models/invoice');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.userId })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('client');
    if (!invoice) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = await Invoice.create({
      ...req.body,
      user: req.user.userId,
      invoiceNumber,
    });
    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;