const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureCustomerLoggedIn } = require('../middlewares/authMiddleware');
const Customer = require('../models/Customer');
const validateCustomer = require('../middlewares/validateCustomer');


router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

//Đăng ký customer
router.get('/register', authController.showCustomerRegisterForm);
router.post('/register', validateCustomer, authController.registerCustomer);

// Đăng nhập, đăng xuất customer
router.get('/customer/login', authController.showCustomerLoginForm);
router.post('/customer/login', authController.loginCustomer);
router.get('/customer/logout', authController.logoutCustomer);

// Trang thông tin cá nhân
router.get('/customer/profile', ensureCustomerLoggedIn, async (req, res) => {
  const customer = await Customer.findByPk(req.session.customer.customerId);
  res.render('customer/profile', { customer });
});

module.exports = router;
