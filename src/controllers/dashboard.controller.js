// const dashboardService = require('../services/dashboard.service');

// async function getSummary(req, res, next) {
//   try {
//     const data = dashboardService.getSummary();
//     res.json({ success: true, data });
//   } catch (err) { next(err); }
// }

// async function getCategoryTotals(req, res, next) {
//   try {
//     const data = dashboardService.getCategoryTotals();
//     res.json({ success: true, data });
//   } catch (err) { next(err); }
// }

// async function getMonthlyTrends(req, res, next) {
//   try {
//     const data = dashboardService.getMonthlyTrends();
//     res.json({ success: true, data });
//   } catch (err) { next(err); }
// }

// async function getRecentActivity(req, res, next) {
//   try {
//     const data = dashboardService.getRecentActivity();
//     res.json({ success: true, data });
//   } catch (err) { next(err); }
// }

// module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity };





const dashboardService = require('../services/dashboard.service');

function getSummary(req, res, next) {
  try {
    res.json({ success: true, data: dashboardService.getSummary() });
  } catch(err) { next(err); }
}

function getCategoryTotals(req, res, next) {
  try {
    res.json({ success: true, data: dashboardService.getCategoryTotals() });
  } catch(err) { next(err); }
}

function getMonthlyTrends(req, res, next) {
  try {
    res.json({ success: true, data: dashboardService.getMonthlyTrends() });
  } catch(err) { next(err); }
}

function getRecentActivity(req, res, next) {
  try {
    res.json({ success: true, data: dashboardService.getRecentActivity() });
  } catch(err) { next(err); }
}

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity };