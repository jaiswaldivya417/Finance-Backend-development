// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { dbGet, dbRun } = require('../config/database');

// async function register({ name, email, password, role = 'viewer' }) {
//   const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
//   if (existing) {
//     const error = new Error('Email already in use');
//     error.status = 409;
//     throw error;
//   }

//   const hashedPassword = bcrypt.hashSync(password, 10);
//   const result = await dbRun(
//     `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
//     [name, email, hashedPassword, role]
//   );

//   return { id: result.lastInsertRowid, name, email, role };
// }

// async function login({ email, password }) {
//   const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
//   if (!user) {
//     const error = new Error('Invalid email or password');
//     error.status = 401;
//     throw error;
//   }

//   if (user.status === 'inactive') {
//     const error = new Error('Account is inactive');
//     error.status = 403;
//     throw error;
//   }

//   const passwordMatch = bcrypt.compareSync(password, user.password);
//   if (!passwordMatch) {
//     const error = new Error('Invalid email or password');
//     error.status = 401;
//     throw error;
//   }

//   const token = jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//   );

//   return {
//     token,
//     user: { id: user.id, name: user.name, email: user.email, role: user.role },
//   };
// }

// module.exports = { register, login };



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../config/database');

function register({ name, email, password, role = 'viewer' }) {
  const existing = dbGet('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = dbRun(
    `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'active')`,
    [name, email, hashedPassword, role]
  );
  return { id: result.lastInsertRowid, name, email, role };
}

function login({ email, password }) {
  const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
  
  // DEBUG — remove after fixing
  console.log('User found:', user);
  console.log('Password from DB:', user ? user.password : 'NO USER');
  console.log('Password provided:', password);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  if (user.status === 'inactive') {
    const error = new Error('Account is inactive');
    error.status = 403;
    throw error;
  }
  const passwordMatch = bcrypt.compareSync(password, user.password);
  console.log('Password match:', passwordMatch);
  
  if (!passwordMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
}

module.exports = { register, login };