const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  name: { type: String, trim: true },
  businessName: { type: String, trim: true },
  email: { type: String, lowercase: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);