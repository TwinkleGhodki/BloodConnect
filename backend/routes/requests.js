const express = require('express');
const router = express.Router();
const DonationRequest = require('../models/DonationRequest');
const DonorResponse = require('../models/DonorResponse');
const User = require('../models/User');
const auth = require('../middleware/auth');

// CREATE BLOOD REQUEST (Hospital only)
router.post('/', auth, async (req, res) => {
  try {
    const { bloodType, unitsNeeded, urgencyLevel, city, state, patientDescription } = req.body;

    const hospital = await User.findById(req.user.id);

    const request = new DonationRequest({
      hospital: req.user.id,
      hospitalName: hospital.hospitalName || hospital.name,
      bloodType, unitsNeeded, urgencyLevel,
      city, state, patientDescription
    });

    await request.save();
    res.status(201).json(request);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL OPEN REQUESTS
router.get('/', async (req, res) => {
  try {
    const requests = await DonationRequest.find({ status: 'open' })
      .sort({ urgencyLevel: 1, createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SINGLE REQUEST
router.get('/:id', async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('respondedDonors', 'name bloodType phone city');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// SOS - TRIGGER EMERGENCY (finds all matching donors instantly)
router.post('/:id/sos', auth, async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Find all eligible matching donors in same city
    const eligibleDate = new Date();
    eligibleDate.setDate(eligibleDate.getDate() - 56);

    const matchingDonors = await User.find({
      role: 'donor',
      bloodType: request.bloodType,
      city: new RegExp(request.city, 'i'),
      isAvailable: true,
      $or: [
        { lastDonationDate: { $lte: eligibleDate } },
        { lastDonationDate: null }
      ]
    }).select('name phone email bloodType city');

    // Mark request as SOS
    request.isSOS = true;
    request.sosTriggeredAt = new Date();
    request.urgencyLevel = 'critical';
    await request.save();

    res.json({
      message: 'SOS triggered successfully',
      request,
      matchingDonors,
      donorsNotified: matchingDonors.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DONOR RESPONDS TO REQUEST
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body;
    const request = await DonationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Save response
    let donorResponse = await DonorResponse.findOne({
      request: req.params.id,
      donor: req.user.id
    });

    if (donorResponse) {
      donorResponse.response = response;
      await donorResponse.save();
    } else {
      donorResponse = new DonorResponse({
        request: req.params.id,
        donor: req.user.id,
        response
      });
      await donorResponse.save();

      if (response === 'accepted') {
        request.respondedDonors.push(req.user.id);
        await request.save();

        // Update donor count and check badges
        const donor = await User.findById(req.user.id);
        if (response === 'accepted') {
          donor.donationCount += 1;
          // Award badges
          if (donor.donationCount >= 1 && !donor.badges.includes('First Responder'))
            donor.badges.push('First Responder');
          if (donor.donationCount >= 5 && !donor.badges.includes('Life Saver'))
            donor.badges.push('Life Saver');
          if (donor.donationCount >= 10 && !donor.badges.includes('Hero Donor'))
            donor.badges.push('Hero Donor');
          await donor.save();
        }
      }
    }

    res.json({ message: `Response recorded: ${response}`, donorResponse });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CLOSE / FULFILL REQUEST
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;