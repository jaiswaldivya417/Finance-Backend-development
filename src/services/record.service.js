// const { dbAll, dbGet, dbRun } = require('../config/database');

// // GET RECORD BY ID
// async function getRecordById(id) {
//   const record = await dbGet(
//     'SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0',
//     [id]
//   );

//   if (!record) {
//     const error = new Error('Record not found');
//     error.status = 404;
//     throw error;
//   }

//   return record;
// }

// // GET RECORDS (FILTER + PAGINATION)
// async function getRecords({ type, category, startDate, endDate, page = 1, limit = 10 }) {
//   const offset = (page - 1) * limit;

//   let where = 'WHERE is_deleted = 0';
//   const params = [];

//   if (type) {
//     where += ' AND type = ?';
//     params.push(type);
//   }

//   if (category) {
//     where += ' AND category LIKE ?';
//     params.push(`%${category}%`);
//   }

//   if (startDate) {
//     where += ' AND date >= ?';
//     params.push(startDate);
//   }

//   if (endDate) {
//     where += ' AND date <= ?';
//     params.push(endDate);
//   }

//   const records = await dbAll(
//     `SELECT * FROM financial_records 
//      ${where} 
//      ORDER BY date DESC 
//      LIMIT ? OFFSET ?`,
//     [...params, limit, offset]
//   );

//   const row = await dbGet(
//     `SELECT COUNT(*) as count FROM financial_records ${where}`,
//     params
//   );

//   return {
//     records,
//     total: row.count,
//     page,
//     limit
//   };
// }

// // CREATE RECORD
// async function createRecord({ amount, type, category, date, notes }, userId) {
//   const result = await dbRun(
//     `INSERT INTO financial_records 
//      (amount, type, category, date, notes, created_by, created_at, is_deleted)
//      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)`,
//     [amount, type, category, date, notes || null, userId]
//   );

//   return getRecordById(result.lastInsertRowid);
// }

// // UPDATE RECORD
// async function updateRecord(id, { amount, type, category, date, notes }) {
//   await getRecordById(id); // ensure exists

//   await dbRun(
//     `UPDATE financial_records
//      SET amount = COALESCE(?, amount),
//          type = COALESCE(?, type),
//          category = COALESCE(?, category),
//          date = COALESCE(?, date),
//          notes = COALESCE(?, notes),
//          updated_at = CURRENT_TIMESTAMP
//      WHERE id = ? AND is_deleted = 0`,
//     [amount || null, type || null, category || null, date || null, notes || null, id]
//   );

//   return getRecordById(id);
// }

// // SOFT DELETE RECORD
// async function deleteRecord(id) {
//   const result = await dbRun(
//     `UPDATE financial_records 
//      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP 
//      WHERE id = ? AND is_deleted = 0`,
//     [id]
//   );

//   if (result.changes === 0) {
//     const error = new Error('Record not found');
//     error.status = 404;
//     throw error;
//   }

//   return { message: 'Record deleted successfully' };
// }

// // DASHBOARD SUMMARY 
// async function getSummary() {
//   const incomeRow = await dbGet(
//     `SELECT COALESCE(SUM(amount), 0) as total FROM financial_records 
//      WHERE type = 'income' AND is_deleted = 0`
//   );

//   const expenseRow = await dbGet(
//     `SELECT COALESCE(SUM(amount), 0) as total FROM financial_records 
//      WHERE type = 'expense' AND is_deleted = 0`
//   );

//   return {
//     totalIncome: incomeRow.total,
//     totalExpense: expenseRow.total,
//     netBalance: incomeRow.total - expenseRow.total
//   };
// }

// // CATEGORY-WISE BREAKDOWN
// async function getCategoryBreakdown() {
//   return dbAll(
//     `SELECT category, SUM(amount) as total 
//      FROM financial_records 
//      WHERE is_deleted = 0 
//      GROUP BY category`
//   );
// }

// // RECENT TRANSACTIONS
// async function getRecentRecords(limit = 5) {
//   return dbAll(
//     `SELECT * FROM financial_records 
//      WHERE is_deleted = 0 
//      ORDER BY created_at DESC 
//      LIMIT ?`,
//     [limit]
//   );
// }

// // MONTHLY TRENDS 
// async function getMonthlyTrends() {
//   return dbAll(
//     `SELECT 
//         strftime('%Y-%m', date) as month,
//         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
//         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
//      FROM financial_records
//      WHERE is_deleted = 0
//      GROUP BY month
//      ORDER BY month ASC`
//   );
// }

// module.exports = {
//   getRecords,
//   getRecordById,
//   createRecord,
//   updateRecord,
//   deleteRecord,
//   getSummary,
//   getCategoryBreakdown,
//   getRecentRecords,
//   getMonthlyTrends
// };


const { dbAll, dbGet, dbRun } = require('../config/database');

function getRecordById(id) {
  const record = dbGet(
    'SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0',
    [Number(id)]
  );
  if (!record) {
    const error = new Error('Record not found');
    error.status = 404;
    throw error;
  }
  return record;
}

function getRecords({ type, category, startDate, endDate, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  let where = 'WHERE is_deleted = 0';
  const params = [];

  if (type)      { where += ' AND type = ?';        params.push(type); }
  if (category)  { where += ' AND category LIKE ?'; params.push(`%${category}%`); }
  if (startDate) { where += ' AND date >= ?';        params.push(startDate); }
  if (endDate)   { where += ' AND date <= ?';        params.push(endDate); }

  const records  = dbAll(
    `SELECT * FROM financial_records ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const countRow = dbGet(
    `SELECT COUNT(*) as count FROM financial_records ${where}`,
    params
  );

  return {
    records: records || [],
    total:   countRow ? Number(countRow.count) : 0,
    page:    Number(page),
    limit:   Number(limit)
  };
}

function createRecord({ amount, type, category, date, notes }, userId) {
  // INSERT the record
  const result = dbRun(
    `INSERT INTO financial_records (amount, type, category, date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [Number(amount), type, category, date, notes || null, Number(userId)]
  );

  console.log('INSERT result:', result);

  // Use lastInsertRowid from dbRun
  const newId = result.lastInsertRowid;
  if (!newId) {
    throw new Error('Insert failed — no rowid returned');
  }

  // Fetch without is_deleted filter since it was just created
  const record = dbGet(
    'SELECT * FROM financial_records WHERE id = ?',
    [Number(newId)]
  );

  if (!record) {
    throw new Error('Insert succeeded but record could not be fetched');
  }

  return record;
}

function updateRecord(id, { amount, type, category, date, notes }) {
  const existing = dbGet(
    'SELECT id FROM financial_records WHERE id = ? AND is_deleted = 0',
    [Number(id)]
  );
  if (!existing) {
    const error = new Error('Record not found');
    error.status = 404;
    throw error;
  }

  dbRun(
    `UPDATE financial_records SET
      amount     = COALESCE(?, amount),
      type       = COALESCE(?, type),
      category   = COALESCE(?, category),
      date       = COALESCE(?, date),
      notes      = COALESCE(?, notes),
      updated_at = datetime('now')
    WHERE id = ?`,
    [
      amount   ? Number(amount) : null,
      type     || null,
      category || null,
      date     || null,
      notes    || null,
      Number(id)
    ]
  );

  return getRecordById(Number(id));
}

function deleteRecord(id) {
  const existing = dbGet(
    'SELECT id FROM financial_records WHERE id = ? AND is_deleted = 0',
    [Number(id)]
  );
  if (!existing) {
    const error = new Error('Record not found');
    error.status = 404;
    throw error;
  }

  dbRun(
    `UPDATE financial_records SET is_deleted = 1, updated_at = datetime('now')
     WHERE id = ?`,
    [Number(id)]
  );
}

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };