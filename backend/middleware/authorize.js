function requireRole(...roles) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
}

const requireAdmin = requireRole('admin');
const requireHospital = requireRole('hospital');
const requireDonor = requireRole('donor');

function requireRequestOwnerOrAdmin(RequestModel) {
  return async function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const request = await RequestModel.findById(req.params.id).select('hospital');

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const isAdmin = req.user.role === 'admin';
      const isOwner = request.hospital.toString() === req.user.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
}

module.exports = {
  requireRole,
  requireAdmin,
  requireHospital,
  requireDonor,
  requireRequestOwnerOrAdmin
};
