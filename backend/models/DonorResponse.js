const mongoose = require('mongoose');

const DonorResponseSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationRequest',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  response: {
    type: String,
    enum: ['accepted', 'declined', 'pending'],
    default: 'pending'
  },
  respondedAt: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('DonorResponse', DonorResponseSchema);