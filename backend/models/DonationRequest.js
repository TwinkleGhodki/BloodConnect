const mongoose = require('mongoose');

const DonationRequestSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalName: { type: String, required: true },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsNeeded: { type: Number, required: true },
  urgencyLevel: {
    type: String,
    enum: ['critical', 'high', 'normal'],
    default: 'normal'
  },
  city: { type: String, required: true },
  state: { type: String },
  patientDescription: { type: String },
  status: {
    type: String,
    enum: ['open', 'scheduled', 'partially_fulfilled', 'fulfilled', 'closed', 'cancelled', 'expired'],
    default: 'open'
  },
  unitsFulfilled: { type: Number, default: 0 },
  fulfilledAt: { type: Date },
  closedAt: { type: Date },
  respondedDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isSOS: { type: Boolean, default: false },
  sosTriggeredAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('DonationRequest', DonationRequestSchema);
