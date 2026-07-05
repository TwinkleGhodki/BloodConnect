const express = require('express');
const router = express.Router();
const DonationRequest = require('../models/DonationRequest');
const DonorResponse = require('../models/DonorResponse');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireDonor, requireHospital, requireRequestOwnerOrAdmin } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  validateMongoId,
  validateCreateRequest,
  validateRequestStatus,
  validateDonorResponse,
  validateCompleteDonation
} = require('../middleware/validators');

const TERMINAL_RESPONSE_STATUSES = ['completed', 'cancelled', 'no_show'];
const CLOSED_REQUEST_STATUSES = ['fulfilled', 'closed', 'cancelled', 'expired'];

// CREATE BLOOD REQUEST (Hospital only)
router.post('/', auth, requireHospital, validateCreateRequest, validate, async (req, res) => {
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
router.get('/:id', validateMongoId, validate, async (req, res) => {
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
router.post('/:id/sos', auth, validateMongoId, validate, requireRequestOwnerOrAdmin(DonationRequest), async (req, res) => {
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
router.post('/:id/respond', auth, requireDonor, validateDonorResponse, validate, async (req, res) => {
  try {
    const { response } = req.body;
    const request = await DonationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (CLOSED_REQUEST_STATUSES.includes(request.status)) {
      return res.status(400).json({ message: 'Cannot respond to a request that is no longer active' });
    }

    let donorResponse = await DonorResponse.findOne({
      request: req.params.id,
      donor: req.user.id
    });

    if (donorResponse) {
      if (TERMINAL_RESPONSE_STATUSES.includes(donorResponse.response)) {
        return res.status(400).json({ message: `Cannot change a ${donorResponse.response} response` });
      }

      if (response === 'withdrawn' && !['accepted', 'scheduled'].includes(donorResponse.response)) {
        return res.status(400).json({ message: 'Only accepted or scheduled responses can be withdrawn' });
      }

      donorResponse.response = response;
      donorResponse.respondedAt = new Date();
      await donorResponse.save();
    } else {
      if (response === 'withdrawn') {
        return res.status(400).json({ message: 'Cannot withdraw before accepting a request' });
      }

      donorResponse = new DonorResponse({
        request: req.params.id,
        donor: req.user.id,
        response
      });
      await donorResponse.save();
    }

    const donorId = req.user.id;
    const alreadyResponded = request.respondedDonors.some(id => id.toString() === donorId);

    if (response === 'accepted' && !alreadyResponded) {
      request.respondedDonors.push(donorId);
      await request.save();
    } else if (['declined', 'withdrawn'].includes(response) && alreadyResponded) {
      request.respondedDonors = request.respondedDonors.filter(id => id.toString() !== donorId);
      await request.save();
    }

    res.json({ message: `Response recorded: ${response}`, donorResponse });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// HOSPITAL CONFIRMS COMPLETED DONATION
router.patch('/:id/responses/:responseId/complete', auth, validateCompleteDonation, validate, requireRequestOwnerOrAdmin(DonationRequest), async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (CLOSED_REQUEST_STATUSES.includes(request.status)) {
      return res.status(400).json({ message: 'Cannot complete donations for a request that is no longer active' });
    }

    const donorResponse = await DonorResponse.findOne({
      _id: req.params.responseId,
      request: req.params.id
    });

    if (!donorResponse) {
      return res.status(404).json({ message: 'Donor response not found' });
    }

    if (donorResponse.response === 'completed') {
      return res.status(400).json({ message: 'Donation has already been completed' });
    }

    if (!['accepted', 'scheduled'].includes(donorResponse.response)) {
      return res.status(400).json({ message: `Cannot complete a ${donorResponse.response} response` });
    }

    donorResponse.response = 'completed';
    donorResponse.completedAt = new Date();
    donorResponse.confirmedBy = req.user.id;
    await donorResponse.save();

    request.unitsFulfilled = (request.unitsFulfilled || 0) + 1;
    if (request.unitsFulfilled >= request.unitsNeeded) {
      request.status = 'fulfilled';
      request.fulfilledAt = request.fulfilledAt || new Date();
    } else {
      request.status = 'partially_fulfilled';
    }
    await request.save();

    res.json({
      message: 'Donation completed successfully',
      donorResponse,
      request
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CLOSE / FULFILL REQUEST
router.patch('/:id/status', auth, validateRequestStatus, validate, requireRequestOwnerOrAdmin(DonationRequest), async (req, res) => {
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
