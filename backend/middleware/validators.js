const { body, param, query } = require('express-validator');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const USER_ROLES = ['donor', 'hospital'];
const URGENCY_LEVELS = ['critical', 'high', 'normal'];
const REQUEST_STATUSES = ['open', 'fulfilled', 'closed'];
const DONOR_RESPONSES = ['accepted', 'declined', 'pending'];

const phoneRule = body('phone')
  .trim()
  .matches(/^[0-9+\-\s()]{10,15}$/)
  .withMessage('Phone must be a valid 10 to 15 digit contact number');

const cityRule = body('city')
  .trim()
  .notEmpty()
  .withMessage('City is required')
  .isLength({ max: 80 })
  .withMessage('City must be under 80 characters');

const optionalStateRule = body('state')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 80 })
  .withMessage('State must be under 80 characters');

const validateMongoId = param('id')
  .isMongoId()
  .withMessage('Invalid id');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  phoneRule,
  body('role')
    .optional()
    .isIn(USER_ROLES)
    .withMessage('Role must be donor or hospital'),
  body('bloodType')
    .if((value, { req }) => !req.body.role || req.body.role === 'donor')
    .notEmpty()
    .withMessage('Blood type is required for donors')
    .isIn(BLOOD_TYPES)
    .withMessage('Invalid blood type'),
  cityRule,
  optionalStateRule,
  body('hospitalName')
    .if(body('role').equals('hospital'))
    .trim()
    .notEmpty()
    .withMessage('Hospital name is required')
    .isLength({ max: 120 })
    .withMessage('Hospital name must be under 120 characters'),
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be under 200 characters')
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateDonorSearch = [
  query('bloodType')
    .optional({ checkFalsy: true })
    .isIn(BLOOD_TYPES)
    .withMessage('Invalid blood type'),
  query('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('City must be under 80 characters'),
  query('state')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('State must be under 80 characters')
];

const validateRankedDonorSearch = [
  query('bloodType')
    .optional({ checkFalsy: true })
    .isIn(BLOOD_TYPES)
    .withMessage('Invalid blood type'),
  query('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('City must be under 80 characters')
];

const validateDonorProfile = [
  body('bloodType')
    .optional({ checkFalsy: true })
    .isIn(BLOOD_TYPES)
    .withMessage('Invalid blood type'),
  body('age')
    .optional({ checkFalsy: true })
    .isInt({ min: 18, max: 65 })
    .withMessage('Age must be between 18 and 65'),
  body('weight')
    .optional({ checkFalsy: true })
    .isFloat({ min: 45, max: 300 })
    .withMessage('Weight must be between 45 and 300 kg'),
  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('City must be under 80 characters'),
  optionalStateRule,
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Phone must be a valid 10 to 15 digit contact number'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('Availability must be true or false'),
  body('lastDonationDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Last donation date must be a valid date')
    .custom(value => {
      if (new Date(value) > new Date()) {
        throw new Error('Last donation date cannot be in the future');
      }
      return true;
    }),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

const validateCreateRequest = [
  body('bloodType')
    .notEmpty()
    .withMessage('Blood type is required')
    .isIn(BLOOD_TYPES)
    .withMessage('Invalid blood type'),
  body('unitsNeeded')
    .isInt({ min: 1, max: 20 })
    .withMessage('Units needed must be between 1 and 20'),
  body('urgencyLevel')
    .optional()
    .isIn(URGENCY_LEVELS)
    .withMessage('Urgency level must be critical, high, or normal'),
  cityRule,
  optionalStateRule,
  body('patientDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Patient description must be under 500 characters')
];

const validateRequestStatus = [
  validateMongoId,
  body('status')
    .isIn(REQUEST_STATUSES)
    .withMessage('Status must be open, fulfilled, or closed')
];

const validateDonorResponse = [
  validateMongoId,
  body('response')
    .isIn(DONOR_RESPONSES)
    .withMessage('Response must be accepted, declined, or pending')
];

const validateInventory = [
  body('bloodType')
    .notEmpty()
    .withMessage('Blood type is required')
    .isIn(BLOOD_TYPES)
    .withMessage('Invalid blood type'),
  body('unitsAvailable')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Available units must be between 0 and 1000'),
  body('minimumRequired')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Minimum required units must be between 0 and 1000')
];

module.exports = {
  validateMongoId,
  validateRegister,
  validateLogin,
  validateDonorSearch,
  validateRankedDonorSearch,
  validateDonorProfile,
  validateCreateRequest,
  validateRequestStatus,
  validateDonorResponse,
  validateInventory
};
