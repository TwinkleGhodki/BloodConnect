const mongoose = require('mongoose');

const HospitalInventorySchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalName: { type: String },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsAvailable: { type: Number, required: true, default: 0 },
  minimumRequired: { type: Number, default: 5 },
  isLow: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('HospitalInventory', HospitalInventorySchema);