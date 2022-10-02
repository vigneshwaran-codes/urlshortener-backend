const express = require('express')
const service = require('../service/userService.js')

const router = express.Router()

router.post('/register', service.register)
router.post('/login', service.login)

module.exports = router
