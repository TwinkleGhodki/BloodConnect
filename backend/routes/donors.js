const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { rankDonors } = require('../ml/donorPredictor');

// GET ALL DONORS - Search by blood type and city
router.get('/search', async (req, res) => {
  try {
    const { bloodType, city, state } = req.query;
    let filter = { role: 'donor', isAvailable: true };
    if (bloodType) filter.bloodType = bloodType;
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');

    const eligibleDate = new Date();
    eligibleDate.setDate(eligibleDate.getDate() - 56);
    filter.$or = [
      { lastDonationDate: { $lte: eligibleDate } },
      { lastDonationDate: null }
    ];

    const donors = await User.find(filter).select('-password').sort({ donationCount: -1 });
    res.json({ count: donors.length, donors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ML RANKED DONOR SEARCH
router.get('/ranked', async (req, res) => {
  try {
    const { bloodType, city } = req.query;
    let filter = { role: 'donor' };
    if (bloodType) filter.bloodType = bloodType;
    if (city) filter.city = new RegExp(city, 'i');

    const donors = await User.find(filter).select('-password');
    const ranked = rankDonors(donors);
    res.json({ count: ranked.length, donors: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET DONOR PROFILE
router.get('/:id', async (req, res) => {
  try {
    const donor = await User.findById(req.params.id).select('-password');
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    res.json(donor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE DONOR PROFILE
router.put('/profile', auth, async (req, res) => {
  try {
    const { bloodType, city, state, isAvailable, lastDonationDate, phone, location } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { bloodType, city, state, isAvailable, lastDonationDate, phone, location },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// TOGGLE AVAILABILITY
router.patch('/availability', auth, async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    donor.isAvailable = !donor.isAvailable;
    await donor.save();
    res.json({ isAvailable: donor.isAvailable, message: `You are now ${donor.isAvailable ? 'Available' : 'Unavailable'}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;