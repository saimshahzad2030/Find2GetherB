const express = require('express');
const authController = require('D:/FYP Final/Find2GetherB/controller/authorController');
const { verifyUser} = require('D:/FYP Final/Find2GetherB/middleware/jwt');
const router = express.Router()

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/newBook',verifyUser,authController.newBook)

module.exports = router;