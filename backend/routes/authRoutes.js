const router = require('express').Router();
const ctrl   = require('../controllers/authController');

// OTP
router.post('/send-otp',    ctrl.sendOTP);
router.post('/verify-otp',  ctrl.verifyOTP);

// Citizens
router.post('/register',        ctrl.register);
router.post('/login',           ctrl.login);
router.post('/reset-password',  ctrl.resetPassword);

// Admins
router.post('/admin/login',          ctrl.adminLogin);
router.post('/admin/register',       ctrl.adminRegister);
router.post('/admin/reset-password', ctrl.adminResetPassword);

module.exports = router;
