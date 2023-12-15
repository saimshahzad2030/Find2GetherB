const express = require('express');
const authController = require('D:/Useful codes/bookLibB/MidTermBookLib/controller/authorController');
const { verifyUser} = require('D:/Useful codes/bookLibB/MidTermBookLib/middleware/jwt');
const router = express.Router()

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/newBook',verifyUser,authController.newBook)

module.exports = router;