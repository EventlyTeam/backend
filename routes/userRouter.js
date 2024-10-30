const express = require('express')

const router = express.Router()

const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/google', userController.googleAuth)
router.get('/google/callback', userController.googleAuthCallback)
router.get('/auth', authMiddleware, userController.check)
router.post('/send-verification-email', authMiddleware, userController.sendVerificationEmail);
router.get('/verify-email', userController.verifyEmail);
router.post('/google/mobile', userController.verifyGoogleToken)

module.exports = router