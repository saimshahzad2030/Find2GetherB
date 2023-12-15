const express = require('express');
const {signup,login,contact,sendVerificationToken,verifyToken} = require('../controller/userController');
const { verifyUser} = require('../middleware/jwt');
const router = express.Router()

router.post('/signup',signup)
router.post('/sendToken',sendVerificationToken)
router.get('/verifyToken',verifyToken)

router.post('/login',login)
router.post('/contact',contact)

// router.get('/getBook',verifyUser,userController.getBook)
// router.post('/returnBook',verifyUser,userController.returnBook)

module.exports = router;