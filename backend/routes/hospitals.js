const express = require('express');
const router = express.Router();
const HospitalInventory = require('../models/HospitalInventory');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireHospital } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { validateInventory } = require('../middleware/validators');

// UPDATE BLOOD INVENTORY
router.post('/inventory', auth, requireHospital, validateInventory, validate, async (req, res) => {
  try {
    const { bloodType, unitsAvailable, minimumRequired } = req.body;
    const hospital = await User.findById(req.user.id);

    let inventory = await HospitalInventory.findOne({
      hospital: req.user.id,
      bloodType
    });

    if (inventory) {
      inventory.unitsAvailable = unitsAvailable;
      inventory.minimumRequired = minimumRequired || 5;
      inventory.isLow = unitsAvailable <= (minimumRequired || 5);
      inventory.lastUpdated = new Date();
      await inventory.save();
    } else {
      inventory = new HospitalInventory({
        hospital: req.user.id,
        hospitalName: hospital.hospitalName || hospital.name,
        bloodType,
        unitsAvailable,
        minimumRequired: minimumRequired || 5,
        isLow: unitsAvailable <= (minimumRequired || 5)
      });
      await inventory.save();
    }

    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET HOSPITAL INVENTORY
router.get('/inventory', auth, requireHospital, async (req, res) => {
  try {
    const inventory = await HospitalInventory.find({ hospital: req.user.id });

    // Check for low stock alerts
    const lowStock = inventory.filter(i => i.isLow);

    res.json({
      inventory,
      alerts: lowStock.map(i => ({
        bloodType: i.bloodType,
        unitsAvailable: i.unitsAvailable,
        minimumRequired: i.minimumRequired,
        message: ` Low stock alert: ${i.bloodType} only ${i.unitsAvailable} units left!`
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL HOSPITALS
router.get('/', async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital' })
      .select('-password');
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
