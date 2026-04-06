const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../validators/auth.validator');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', authenticate, getMe);  // Protected: must be logged in

module.exports = router;