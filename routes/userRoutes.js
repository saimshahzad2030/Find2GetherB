const express = require('express');
const {allMissings,signup,allSuspects,login,contact,sendVerificationToken,verifyToken,deleteToken,checkUsernameAvailability,addBlockedUser,addCaseFinder} = require('../controller/userController');
const { verifyUser} = require('../middleware/jwt');
const router = express.Router()
const multer = require('multer')
const path = require('path')
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

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

router.post('/Img', upload.single('image'),addCaseFinder);
// router.post('/Img',addCaseFinder);

router.get('/allSuspects',allSuspects)

router.get('/allMissings',allMissings)

module.exports = router;