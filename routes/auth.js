const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const express = require('express');

const {
    register,
    login,
    forgotPassword,
    resetPassword
  } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');


router.post('/register', register)
router.post('/login', login)
router.post('/forgotpassword',forgotPassword)
router.put('/resetpassword/:resettoken',resetPassword)


module.exports = router