const express = require('express')

const router = express.Router()

const userRouter = require('./userRouter')
const eventRouter = require('./eventRouter')

router.use('/user', userRouter)
router.use('/event', eventRouter)

module.exports = router