const express = require('express')
const { Login, Logout, ChangePassword, Verify, User } = require('../services/AuthService')

const router = express.Router()

router.post('/login', (...args) => Login(...args))
router.post('/logout', (...args) => Logout(...args))
router.post('/change-password', (...args) => ChangePassword(...args))
router.post('/verify', (...args) => Verify(...args))
router.get('/user', (...args) => User(...args))

module.exports = { path: '/auth', router, auth: false }
