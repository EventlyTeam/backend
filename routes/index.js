const express = require('express')

const router = express.Router()

const userRouter = require('./userRouter')
const eventRouter = require('./eventRouter')
const countryRouter = require('./countryRouter')
const cityRouter = require('./cityRouter')
const locationRouter = require('./locationRouter')
const formatRouter = require('./formatRouter')
const categoryRouter = require('./categoryRouter')
const chatRouter = require('./chatRouter')

router.use('/user', userRouter)
router.use('/event', eventRouter)
router.use('/country', countryRouter)
router.use('/city', cityRouter)
router.use('/location', locationRouter)
router.use('/format', formatRouter)
router.use('/category', categoryRouter)
router.use('/chat', chatRouter)

module.exports = router