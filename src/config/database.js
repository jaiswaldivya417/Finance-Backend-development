// const path = require('path');
// const fs = require('fs');
// const initSqlJs = require('sql.js');

// const DB_PATH = path.join(__dirname, '../../finance.db');

// let db = null;

// // sql.js works in memory — we load from file on startup and save to file on writes
// async function getDb() {
//   if (db) return db;

//   const SQL = await initSqlJs();

//   if (fs.existsSync(DB_PATH)) {
//     const fileBuffer = fs.readFileSync(DB_PATH);
//     db = new SQL.Database(fileBuffer);
//   } else {
//     db = new SQL.Database();
//   }

//   return db;
// }

// // Call this after every write operation to persist changes to disk
// function saveDb() {
//   if (!db) return;
//   const data = db.export();
//   fs.writeFileSync(DB_PATH, Buffer.from(data));
// }

// async function initializeDatabase() {
//   const db = await getDb();

//   db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('viewer', 'analyst', 'admin')),
//       status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     )
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS financial_records (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       amount REAL NOT NULL,
//       type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
//       category TEXT NOT NULL,
//       date TEXT NOT NULL,
//       notes TEXT,
//       created_by INTEGER NOT NULL,
//       is_deleted INTEGER NOT NULL DEFAULT 0,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (created_by) REFERENCES users(id)
//     )
//   `);

//   // Check if admin user exists
//   const result = db.exec("SELECT COUNT(*) as count FROM users");
//   const count = result[0]?.values[0][0] || 0;

//   if (count === 0) {
//     const bcrypt = require('bcryptjs');
//     const hashedPassword = bcrypt.hashSync('admin123', 10);
//     db.run(
//       `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
//       ['Admin User', 'admin@finance.com', hashedPassword, 'admin']
//     );
//     saveDb();
//     console.log('Default admin created: admin@finance.com / admin123');
//   }

//   console.log('Database initialized successfully');
// }

// // Helper: run a SELECT and return array of row objects
// async function dbAll(sql, params = []) {
//   const database = await getDb();
//   const stmt = database.prepare(sql);
//   stmt.bind(params);
//   const rows = [];
//   while (stmt.step()) {
//     rows.push(stmt.getAsObject());
//   }
//   stmt.free();
//   return rows;
// }

// // Helper: run a SELECT and return a single row object
// async function dbGet(sql, params = []) {
//   const rows = await dbAll(sql, params);
//   return rows[0] || null;
// }

// // Helper: run INSERT / UPDATE / DELETE and return { lastInsertRowid, changes }
// async function dbRun(sql, params = []) {
//   const database = await getDb();
//   database.run(sql, params);
//   saveDb();
//   return {
//     lastInsertRowid: database.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0],
//     changes: database.exec("SELECT changes() as c")[0]?.values[0][0],
//   };
// }

// module.exports = { getDb, saveDb, initializeDatabase, dbAll, dbGet, dbRun };





const path = require('path');
const fs   = require('fs');

const DB_PATH = path.join(__dirname, '../../finance.db');
let db = null;

async function getDb() {
  if (db) return db;
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch(e) {
    console.error('Failed to save DB:', e);
  }
}

async function initializeDatabase() {
  await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'viewer',
      status     TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS financial_records (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      amount     REAL NOT NULL,
      type       TEXT NOT NULL,
      category   TEXT NOT NULL,
      date       TEXT NOT NULL,
      notes      TEXT,
      created_by INTEGER NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDb();

  const countRow = dbGet('SELECT COUNT(*) as count FROM users');
  const count = countRow ? Number(countRow.count) : 0;

  if (count === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    dbRun(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      ['Admin User', 'admin@finance.com', hashedPassword, 'admin', 'active']
    );
    console.log('✅ Admin seeded: admin@finance.com / admin123');
  }

  console.log('✅ Database initialized');
}

// Run SELECT — returns array of plain objects
function dbAll(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  try {
    const result = db.exec(sql, params);
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  } catch(e) {
    console.error('dbAll error:', e.message, '| SQL:', sql);
    throw e;
  }
}

// Run SELECT — returns single plain object or null
function dbGet(sql, params = []) {
  const rows = dbAll(sql, params);
  return rows[0] || null;
}

// Run INSERT/UPDATE/DELETE — returns lastInsertRowid and changes
function dbRun(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  try {
    db.run(sql, params);

    // Read rowid DIRECTLY from the db instance — most reliable way in sql.js
    let lastInsertRowid = null;
    let changes = 0;

    const stmt1 = db.prepare('SELECT last_insert_rowid() as id');
    if (stmt1.step()) {
      const row = stmt1.getAsObject();
      lastInsertRowid = row.id ? Number(row.id) : null;
    }
    stmt1.free();

    const stmt2 = db.prepare('SELECT changes() as c');
    if (stmt2.step()) {
      const row = stmt2.getAsObject();
      changes = row.c ? Number(row.c) : 0;
    }
    stmt2.free();

    saveDb();

    return { lastInsertRowid, changes };
  } catch(e) {
    console.error('dbRun error:', e.message, '| SQL:', sql);
    throw e;
  }
}

module.exports = { getDb, saveDb, initializeDatabase, dbAll, dbGet, dbRun };


