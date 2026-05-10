const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { requireRoles } = require('../middleware/role');

const adminOnly = [authenticate, requireRoles(['QuanTriVienHeThong'])];

router.get('/', ...adminOnly, userController.getUsers);
router.post('/', ...adminOnly, userController.createUser);
router.get('/:id', ...adminOnly, userController.getUserById);
router.put('/:id', ...adminOnly, userController.updateUser);
router.delete('/:id', ...adminOnly, userController.deleteUser);

module.exports = router;
