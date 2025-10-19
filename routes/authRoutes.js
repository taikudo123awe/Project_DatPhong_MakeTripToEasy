const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
//Đăng ký customer
router.get('/register', authController.showCustomerRegisterForm);
router.post('/register', authController.registerCustomer);

// Đăng nhập, đăng xuất customer
router.get('/customer/login', authController.showCustomerLoginForm);
router.post('/customer/login', authController.loginCustomer);
router.get('/customer/logout', authController.logoutCustomer);

module.exports = router;
