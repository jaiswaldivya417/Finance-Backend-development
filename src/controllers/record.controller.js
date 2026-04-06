// const recordService = require('../services/record.service');
// const { recordRules, validate } = require('../validators/record.validator');

// async function getRecords(req, res, next) {
//   try {
//     const { type, category, startDate, endDate, page, limit } = req.query;
//     const result = recordService.getRecords({ type, category, startDate, endDate, page: Number(page) || 1, limit: Number(limit) || 10 });
//     res.json({ success: true, data: result });
//   } catch (err) { next(err); }
// }

// async function getRecordById(req, res, next) {
//   try {
//     const record = recordService.getRecordById(req.params.id);
//     res.json({ success: true, data: record });
//   } catch (err) { next(err); }
// }

// async function createRecord(req, res, next) {
//   try {
//     const record = recordService.createRecord(req.body, req.user.id);
//     res.status(201).json({ success: true, message: 'Record created', data: record });
//   } catch (err) { next(err); }
// }

// async function updateRecord(req, res, next) {
//   try {
//     const record = recordService.updateRecord(req.params.id, req.body);
//     res.json({ success: true, message: 'Record updated', data: record });
//   } catch (err) { next(err); }
// }

// async function deleteRecord(req, res, next) {
//   try {
//     recordService.deleteRecord(req.params.id);
//     res.json({ success: true, message: 'Record deleted (soft)' });
//   } catch (err) { next(err); }
// }

// module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };








const recordService = require('../services/record.service');

function getRecords(req, res, next) {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const result = recordService.getRecords({
      type,
      category,
      startDate,
      endDate,
      page:  Number(page)  || 1,
      limit: Number(limit) || 10
    });
    res.json({ success: true, data: result });
  } catch(err) {
    console.error('GET /records error:', err.message);
    next(err);
  }
}

function getRecordById(req, res, next) {
  try {
    const record = recordService.getRecordById(Number(req.params.id));
    res.json({ success: true, data: record });
  } catch(err) {
    console.error('GET /records/:id error:', err.message);
    next(err);
  }
}

function createRecord(req, res, next) {
  try {
    const record = recordService.createRecord(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Record created', data: record });
  } catch(err) {
    console.error('POST /records error:', err.message);
    next(err);
  }
}

function updateRecord(req, res, next) {
  try {
    const record = recordService.updateRecord(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Record updated', data: record });
  } catch(err) {
    console.error('PATCH /records/:id error:', err.message);
    next(err);
  }
}

function deleteRecord(req, res, next) {
  try {
    recordService.deleteRecord(Number(req.params.id));
    res.json({ success: true, message: 'Record deleted' });
  } catch(err) {
    console.error('DELETE /records/:id error:', err.message);
    next(err);
  }
}

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };