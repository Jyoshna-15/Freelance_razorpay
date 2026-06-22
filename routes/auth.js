const express = require('express');
const jwt = require('jsonwebtoken');
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');
const router = express.Router();

// Firebase Phone OTP → JWT
router.post('/firebase-login', async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    const decoded = await getAuth().verifyIdToken(firebaseToken);
    const { uid, phone_number } = decoded;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phone: phone_number,
      });
    }

    const token = jwt.sign(
      { userId: user._id, firebaseUid: uid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        businessName: user.businessName,
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Firebase token', error: error.message });
  }
});

// Update profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, businessName, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, businessName, email },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ONLY FOR TESTING — remove before production
router.post('/test-login', async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        firebaseUid: `test_${Date.now()}`,
        phone: phone,
        name: 'Test User',
        businessName: 'Test Business'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;