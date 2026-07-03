const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Keep only safe, commonly needed identity fields on the request.
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodType: user.bloodType,
      city: user.city,
      state: user.state,
      isAvailable: user.isAvailable,
      isVerified: user.isVerified,
      hospitalName: user.hospitalName,
      address: user.address
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
