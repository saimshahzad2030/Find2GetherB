const express = require('express');
const {signup,login,contact,sendVerificationToken,verifyToken,deleteToken,checkUsernameAvailability,addBlockedUser} = require('../controller/userController');
const { verifyUser} = require('../middleware/jwt');
const router = express.Router()

//when user tries to signup
router.post('/signup',signup)

//when user enter email then token will be provided to him on the provided email
router.post('/sendToken',sendVerificationToken)

//provided token will be matched that whether he entered the correct token taht is sent to him via email
router.get('/verifyToken',verifyToken)

//token will be deleted from database just after it got verified by user 
//to maxime performance of our database
router.delete('/deleteToken',deleteToken)

//during signing up this api will check whether the username user entering is available or not?
router.get('/checkUsernameAvailability',checkUsernameAvailability)


//when user tries to login
router.post('/login',login)

//when user fill the contact section form
router.post('/contact',contact)


//api to add someone to blocked user
router.post('/blockedUser',addBlockedUser)
// router.get('/getBook',verifyUser,userController.getBook)
// router.post('/returnBook',verifyUser,userController.returnBook)

module.exports = router;