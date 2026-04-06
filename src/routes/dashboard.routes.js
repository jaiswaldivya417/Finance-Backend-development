const router = require('express').Router();
const { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// All dashboard routes: any authenticated user can view
router.use(authenticate);

router.get('/summary',roleGuard('viewer', 'analyst', 'admin'), getSummary);
router.get('/categories',roleGuard('viewer', 'analyst', 'admin'), getCategoryTotals);
router.get('/trends',roleGuard('viewer', 'analyst', 'admin'), getMonthlyTrends);
router.get('/recent',roleGuard('viewer', 'analyst', 'admin'), getRecentActivity);

module.exports = router;