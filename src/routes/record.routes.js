const router = require('express').Router();
const { getRecords, getRecordById, createRecord, updateRecord, deleteRecord } = require('../controllers/record.controller');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { recordRules, validate } = require('../validators/record.validator');

// All routes require authentication
router.use(authenticate);

// Read: all roles can access
router.get('/', roleGuard('viewer', 'analyst', 'admin'), (req, res, next) => {
  // Convert query params to numbers
  req.query.page = parseInt(req.query.page) || 1;
  req.query.limit = parseInt(req.query.limit) || 10;
  next();
}, getRecords);

router.get('/:id', roleGuard('viewer', 'analyst', 'admin'), getRecordById);

// Write: only admin and analyst
router.post('/', roleGuard('admin', 'analyst'), recordRules, validate, createRecord);
router.patch('/:id', roleGuard('admin', 'analyst'),  recordRules,validate,updateRecord);

// Delete: only admin
router.delete('/:id', roleGuard('admin'), deleteRecord);

module.exports = router;
