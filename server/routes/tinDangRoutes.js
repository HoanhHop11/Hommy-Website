const express = require('express');
const router = express.Router();
const tinController = require('../controllers/tinDangController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', tinController.getAll);
router.get('/:id', tinController.getById);
router.post('/', authenticate, requireRole('ChuDuAn'), tinController.create);
router.put('/:id', authenticate, requireRole('ChuDuAn'), tinController.update);
router.delete('/:id', authenticate, requireRole('ChuDuAn'), tinController.delete);

// approve/reject
router.post('/:id/approve', authenticate, requireRole('Operator'), tinController.approve);

module.exports = router;