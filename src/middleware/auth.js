// const jwt = require('jsonwebtoken');
// const { dbGet } = require('../config/database');

// async function authenticate(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await dbGet(
//       'SELECT id, name, email, role, status FROM users WHERE id = ?',
//       [decoded.id]
//     );

//     if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
//     if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Account is inactive.' });

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
//   }
// }

// module.exports = { authenticate };

const jwt = require('jsonwebtoken');
const { dbGet } = require('../config/database');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = dbGet(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Account is inactive.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = { authenticate };