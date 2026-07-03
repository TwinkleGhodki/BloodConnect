const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const DonorResponse = require('../models/DonorResponse');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorize');

// GET SYSTEM STATS
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalHospitals = await User.countDocuments({ role: 'hospital' });
    const totalRequests = await DonationRequest.countDocuments();
    const openRequests = await DonationRequest.countDocuments({ status: 'open' });
    const sosRequests = await DonationRequest.countDocuments({ isSOS: true });
    const verifiedDonors = await User.countDocuments({ role: 'donor', isVerified: true });
    const totalResponses = await DonorResponse.countDocuments({ response: 'accepted' });

    // Blood type distribution
    const bloodTypeStats = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // City distribution
    const cityStats = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalDonors,
      totalHospitals,
      totalRequests,
      openRequests,
      sosRequests,
      verifiedDonors,
      totalResponses,
      bloodTypeStats,
      cityStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL DONORS
router.get('/donors', auth, requireAdmin, async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL HOSPITALS
router.get('/hospitals', auth, requireAdmin, async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL REQUESTS
router.get('/requests', auth, requireAdmin, async (req, res) => {
  try {
    const requests = await DonationRequest.find()
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// VERIFY DONOR
router.patch('/verify/:id', auth, requireAdmin, async (req, res) => {
  try {
    const donor = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    res.json({ message: 'Donor verified successfully', donor });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE USER
router.delete('/user/:id', auth, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
