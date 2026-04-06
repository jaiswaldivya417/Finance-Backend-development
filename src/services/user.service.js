// const { dbAll, dbGet, dbRun } = require('../config/database');

// async function getAllUsers({ page = 1, limit = 10 }) {
//   const offset = (page - 1) * limit;
//   const users = await dbAll(
//     `SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
//     [limit, offset]
//   );
//   const row = await dbGet('SELECT COUNT(*) as count FROM users', []);
//   return { users, total: row.count, page, limit };
// }

// async function getUserById(id) {
//   const user = await dbGet(
//     'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
//     [id]
//   );
//   if (!user) {
//     const error = new Error('User not found');
//     error.status = 404;
//     throw error;
//   }
//   return user;
// }

// async function updateUser(id, { role, status }) {
//   await getUserById(id); // throws 404 if not found
//   await dbRun(
//     `UPDATE users SET role = COALESCE(?, role), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
//     [role || null, status || null, id]
//   );
//   return getUserById(id);
// }

// async function deleteUser(id) {
//   const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);
//   if (result.changes === 0) {
//     const error = new Error('User not found');
//     error.status = 404;
//     throw error;
//   }
// }

// module.exports = { getAllUsers, getUserById, updateUser, deleteUser };




const { dbAll, dbGet, dbRun } = require('../config/database');

function getAllUsers({ page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const users = dbAll(
    `SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const row = dbGet('SELECT COUNT(*) as count FROM users');
  return { users, total: row ? row.count : 0, page, limit };
}

function getUserById(id) {
  const user = dbGet(
    'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
    [id]
  );
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
}

function updateUser(id, updateData) {
  // Destructure into differently named variables to avoid 'name' global conflict
  const userName   = updateData.name   || null;
  const userEmail  = updateData.email  || null;
  const userRole   = updateData.role   || null;
  const userStatus = updateData.status || null;

  const existing = dbGet('SELECT id FROM users WHERE id = ?', [id]);
  if (!existing) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  dbRun(
    `UPDATE users SET
      name       = COALESCE(?, name),
      email      = COALESCE(?, email),
      role       = COALESCE(?, role),
      status     = COALESCE(?, status),
      updated_at = datetime('now')
    WHERE id = ?`,
    [userName, userEmail, userRole, userStatus, id]
  );

  return getUserById(id);
}

async function deleteUser(id) {
  // First verify user exists
  const existing =await dbGet('SELECT id FROM users WHERE id = ?', [id]);
  if (!existing) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  await dbRun('DELETE FROM users WHERE id = ?', [id]);
  return { deleted: true };
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };