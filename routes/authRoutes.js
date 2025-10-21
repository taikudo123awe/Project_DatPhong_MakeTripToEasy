const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminAuth = require('../middlewares/adminAuth');


router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

//Đăng ký customer
router.get('/register', authController.showCustomerRegisterForm);
router.post('/register', authController.registerCustomer);

// CUSTOMMER
router.get('/customer/login', authController.showCustomerLoginForm);
router.post('/customer/login', authController.loginCustomer);
router.get('/customer/logout', authController.logoutCustomer);

// PROVIDER
router.get('/provider/login', authController.showProviderLoginForm);
router.post('/provider/login', authController.loginProvider);
router.get('/provider/logout', authController.logoutProvider);

// ADMIN
router.get('/admin/login', authController.showAdminLoginForm);
router.post('/admin/login', authController.loginAdmin);
router.get('/admin/logout', authController.logoutAdmin);
// // Dashboard chỉ dành cho admin đã đăng nhập
// router.get('/admin/dashboard', adminAuth, (req, res) => {
//   res.render('admin/dashboard', {
//     admin: req.session.admin
//   });
// });

module.exports = router;
