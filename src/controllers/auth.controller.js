// const authService = require('../services/auth.service');

// async function register(req, res, next) {
//   try {
//     const user = authService.register(req.body);
//     res.status(201).json({ success: true, message: 'User registered successfully', data: user });
//   } catch (err) { next(err); }
// }

// async function login(req, res, next) {
//   try {
//     const result = authService.login(req.body);
//     res.json({ success: true, message: 'Login successful', data: result });
//   } catch (err) { next(err); }
// }

// async function getMe(req, res) {
//   res.json({ success: true, data: req.user });
// }

// module.exports = { register, login, getMe };


const authService = require('../services/auth.service');

function register(req, res, next) {
  try {
    const user = authService.register(req.body);
    res.status(201).json({ success: true, message: 'User registered', data: user });
  } catch(err) { next(err); }
}

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch(err) { next(err); }
}

function getMe(req, res) {
  res.json({ success: true, data: req.user });
}

module.exports = { register, login, getMe };