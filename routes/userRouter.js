const express = require('express')
const passport = require('passport')

const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const {emailValidator, passwordValidator} = require('../utils/Validation')

router.post('/registration', emailValidator, passwordValidator, userController.registration)
router.post('/login', passwordValidator, userController.login)
router.post('/logout', userController.logout)
router.get('/google',  passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/google/callback', passport.authenticate('google', { session: false }), userController.googleAuthCallback)
router.post('/send-verification-email', authMiddleware, userController.sendVerificationEmail);
router.get('/verify-email', userController.verifyEmail);
router.get('/refresh', userController.refresh);
router.get('/', authMiddleware, userController.getAllUsers);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router