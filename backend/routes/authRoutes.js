const express = require ('express');
const authController = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

const loginValidator=[
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),
    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

router.post('/login', loginValidator, authController.login);
router.post('/logout', authController.logout);
router.post('/is-user-logged-in', authController.isUserLoggedIn);
router.post('/register', authController.register);
router.post('/google-auth', authController.googleAuth);
// router.post('/refresh-token', authController.refreshAccessToken);
// router.post('/sendResetPasswordTkon', authController.sendResetPasswordToken);

module.exports= router;