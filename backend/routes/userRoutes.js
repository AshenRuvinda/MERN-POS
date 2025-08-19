const express = require('express');
const router = express.Router();
const { adminRegister, register, login, getUsers, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/admin-register', adminRegister);
router.post('/register', authMiddleware(['admin']), register);
router.post('/login', login);
router.get('/', authMiddleware(['admin']), getUsers);
router.put('/:id', authMiddleware(['admin']), updateUser);

module.exports = router;