// const { dbGet, dbAll } = require('../config/database');

// async function getSummary() {
//   const row = await dbGet(`
//     SELECT
//       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as total_income,
//       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
//       COUNT(*) as total_records
//     FROM financial_records WHERE is_deleted = 0
//   `, []);

//   return {
//     total_income:    row.total_income || 0,
//     total_expenses:  row.total_expenses || 0,
//     net_balance:     (row.total_income || 0) - (row.total_expenses || 0),
//     total_records:   row.total_records,
//   };
// }

// async function getCategoryTotals() {
//   return dbAll(`
//     SELECT category, type, SUM(amount) as total, COUNT(*) as count
//     FROM financial_records WHERE is_deleted = 0
//     GROUP BY category, type ORDER BY total DESC
//   `, []);
// }

// async function getMonthlyTrends() {
//   return dbAll(`
//     SELECT
//       strftime('%Y-%m', date) as month,
//       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as income,
//       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
//     FROM financial_records WHERE is_deleted = 0
//     GROUP BY month ORDER BY month DESC LIMIT 12
//   `, []);
// }

// async function getRecentActivity(limit = 10) {
//   return dbAll(`
//     SELECT r.*, u.name as created_by_name
//     FROM financial_records r
//     LEFT JOIN users u ON r.created_by = u.id
//     WHERE r.is_deleted = 0
//     ORDER BY r.created_at DESC LIMIT ?
//   `, [limit]);
// }

// module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity };






const { dbGet, dbAll } = require('../config/database');

function getSummary() {
  const row = dbGet(`
    SELECT
      SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(*) as total_records
    FROM financial_records WHERE is_deleted = 0
  `, []);
  return {
    total_income:   row.total_income   || 0,
    total_expenses: row.total_expenses || 0,
    net_balance:    (row.total_income || 0) - (row.total_expenses || 0),
    total_records:  row.total_records  || 0
  };
}

function getCategoryTotals() {
  return dbAll(`
    SELECT category, type, SUM(amount) as total, COUNT(*) as count
    FROM financial_records WHERE is_deleted = 0
    GROUP BY category, type ORDER BY total DESC
  `, []);
}

function getMonthlyTrends() {
  return dbAll(`
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM financial_records WHERE is_deleted = 0
    GROUP BY month ORDER BY month DESC LIMIT 12
  `, []);
}

function getRecentActivity(limit = 10) {
  return dbAll(`
    SELECT r.*, u.name as created_by_name
    FROM financial_records r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.is_deleted = 0
    ORDER BY r.created_at DESC LIMIT ?
  `, [limit]);
}

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity };