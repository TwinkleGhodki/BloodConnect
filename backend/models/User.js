const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'hospital', 'admin'],
    default: 'donor'
  },
  phone: {
    type: String,
    required: true
  },

  // DONOR FIELDS
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  city: { type: String },
  state: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  donationCount: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },

  // HOSPITAL FIELDS
  hospitalName: { type: String },
  address: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);