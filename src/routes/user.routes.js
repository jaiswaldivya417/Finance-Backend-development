// const router = require('express').Router();
// const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
// const { authenticate } = require('../middleware/auth');
// const { roleGuard } = require('../middleware/roleGuard').default;
// const { registerRules, validate } = require('../validators/auth.validator');



// // All user management is admin-only
// router.use(authenticate);

// // Create User (Admin only)
// router.post('/', roleGuard('admin'), registerRules, validate, createUser);
// // Get all Users (Admin Only)
// router.get('/', roleGuard('admin', 'analyst'), getAllUsers);

// // Get User BY ID (Admin only)
// router.get('/:id', roleGuard('admin', 'analyst'), getUserById);

// // Update user (Admin only)
// router.patch('/:id', roleGuard('admin'), updateUser);

// // Delete User (Admin Only)
// router.delete('/:id', roleGuard('admin'), deleteUser);

// module.exports = router;


const router = require('express').Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

router.use(authenticate, roleGuard('admin'));

router.get('/',     getAllUsers);
router.get('/:id',  getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

