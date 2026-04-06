// const userService = require('../services/user.service');

// // CREATE USER
// async function createUser(req, res, next) {
//   try {
//     const user = await userService.createUser(req.body);
//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       data: user
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// // GET ALL USERS
// async function getAllUsers(req, res, next) {
//   try {
//     const { page, limit } = req.query;

//     const result = await userService.getAllUsers({
//       page: Number(page) || 1,
//       limit: Number(limit) || 10
//     });

//     res.json({
//       success: true,
//       data: result
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// // GET USER BY ID
// async function getUserById(req, res, next) {
//   try {
//     const user = await userService.getUserById(req.params.id);

//     res.json({
//       success: true,
//       data: user
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// // UPDATE USER
// async function updateUser(req, res, next) {
//   try {
//     const user = await userService.updateUser(req.params.id, req.body);

//     res.json({
//       success: true,
//       message: 'User updated successfully',
//       data: user
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// // DELETE USER
// async function deleteUser(req, res, next) {
//   try {
//     await userService.deleteUser(req.params.id);

//     res.json({
//       success: true,
//       message: 'User deleted successfully'
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = {
//   createUser,   
//   getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser
// };






const userService = require('../services/user.service');

async function getAllUsers(req, res, next) {
  try {
    const result = await userService.getAllUsers({
      page:  Number(req.query.page)  || 1,
      limit: Number(req.query.limit) || 10
    });
    res.json({ success: true, data: result });
  } catch(err) { next(err); }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    res.json({ success: true, data: user });
  } catch(err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    res.json({ success: true, message: 'User updated', data: user });
  } catch(err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(Number(req.params.id));
    res.json({ success: true, message: 'User deleted' });
  } catch(err) { next(err); }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };