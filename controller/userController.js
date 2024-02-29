
const User = require('../model/userModel');
const nodemailer = require('nodemailer');
// const Book = require('D:/Useful codes/bookLibB/MidTermBookLib/model/bookModel');
const jwt = require('../middleware/jwt')
const fs = require('fs'); // Import the fs module
const mongoose = require('mongoose')
// const borrowedBooksModel = require('D:/Useful codes/bookLibB/MidTermBookLib/model/borrowedBooksModel');
const BlockedUser = require('../model/blockedUserModel')
const Query = require('../model/ContactModel')
const Case = require('../model/caseModel')
const bcrypt = require('bcrypt');
const Token = require('../model/Token')
const CaseNo = require('../model/caseNumber')
const admin = require('firebase-admin');
require('dotenv').config({path:'D:/FYP Final/Find2GetherB/config.env'})
// const serviceAccount = JSON.parse(process.env.FIREBASE_AUTH)
const serviceAccount = require('../firebaseSDK.json')


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL
});



const generateToken = () => {
    // Generate a random number between 1000 and 9999
    const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return token;
}

const sendVerificationEmail = async (userEmail, verificationToken, req, res) => {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saimshehzad2040@gmail.com',
            pass: 'grtd dmvh rjdw vlbo', // Use an app-specific password or set up 2-factor authentication
        },
    });

    // Email content
    const mailOptions = {
        from: 'noreply@get2Gether.com',
        to: userEmail,
        subject: 'Account Verification',
        //   text: `Click the following link to verify your account: https://yourapp.com/verify?token=${verificationToken}`,
        text: `B-${verificationToken} is your verification Token`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    const newToken = new Token({
        email: userEmail,
        token: verificationToken,
    });
    try {

        await newToken.save();
        console.log('Email sent:', info.messageId + '\nToken:', verificationToken);

    }
    catch (error) {
        return error;

    }

}
const checkUsernameAvailability = async (req, res) => {
    try {
        const [username] = req.headers.authorization.split(" ");
        if (!username) {
            return res.status(409).json({ message: "Enter an username" });

        }
        const checkUsername = await User.findOne({ username });

        if (!checkUsername) {
            return res.status(200).json({ unique: true });
        }
        else {

            return res.status(200).json({ unique: false });
        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const sendVerificationToken = async (req, res) => {
    // Send verification email
    const verificationToken = generateToken();
    try {
        const { email, forgetPass } = req.body;

        if (!email) {
            return res.status(404).json({ message: "Email Required" });
        }

        const exitingUser = await User.findOne({ email });
        const existingBlockedUser = await BlockedUser.findOne({ email });

        if (forgetPass === false && exitingUser) {
            return res.status(409).json({ message: "email already exist" });
        }
        if (forgetPass === false && existingBlockedUser) {
            return res.status(410).json({ message: "You are a blocked user" });
        }


        else {
            await sendVerificationEmail(email, verificationToken)
                .catch(error => console.error('Error sending email:', error));
            return res.status(200).json({ verificationToken });
        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }


}
const deleteToken = async (req, res) => {
    // Send verification email
    const verificationToken = generateToken();
    try {
        const { email, token } = req.body;

        if (!email) {
            return res.status(404).json({ message: "Email Required" });
        }

        await Token.deleteOne({ email, token });
        return res.status(200).json({});

    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }


}
const verifyToken = async (req, res) => {

    try {
        const [email, token] = req.headers.authorization.split(" ");
        if (!token) {
            return res.status(404).json({ message: "Enter Token" });
        }

        if (!email) {
            return res.status(404).json({ message: "Enter Email" });
        }
        const checkToken = await Token.findOne({ email, token });

        if (!checkToken) {
            return res.status(409).json({ message: "Token doesn't match" });
        }
        else {

            return res.status(200).json({ checkToken });
        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }


}
const signup = async (req, res) => {

    try {
        const { email, username, password, firstname, lastname } = req.body;

        if (!email || !password || !username) {
            return res.status(404).json({ message: "all fields required" });
        }

        const exitingUser = await User.findOne({ email });
        const existingBlockedUser = await BlockedUser.findOne({ email });

        if (exitingUser) {
            return res.status(409).json({ message: "email already exist" });
        } else if (existingBlockedUser) {
            return res.status(409).json({ message: "You are a blocked user and cannot create your account" });
        } else {
            const hashPaswd = await bcrypt.hash(password, 10);
            const newUser = new User({
                email,
                firstname,
                lastname,
                username,
                password: hashPaswd,
            });

            await newUser.save();


            const token = jwt.sign(req.body, username);
            return res.status(200).json( {token,username,email,firstname});
        }
    } catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }

}
const login = async (req, res) => {
    try {

        const { email, username, password } = req.body;
        if (!email && !username) {
            return res.status(401).json({ message: "Enter Username or email " })

        }
        else if (!password) {
            return res.status(401).json({ message: "Enter Password " })

        }

        //find user
        else {
            if (username ) {
                // const findingVariabele = ()
                const user = await User.findOne({ username })
                console.log(user)
                if (!user) {
                    return res.status(401).json({ message: "wrong username or email" })
                }
                const isPaswd = await bcrypt.compare(password, user.password)
                //compare password
                if (!isPaswd) {
                    return res.status(401).json({ message: "wrong password" })
                }
                //generate jwt

                if (user) {
                    const token = jwt.sign(req.body, username)
                    res.status(200).json({ token: token, email:user.email,firstname: user.firstname,username:user.username,pass:user.password })
         }
            }

else if (email ) {
    // const findingVariabele = ()
    const user = await User.findOne({ email })
    console.log(user)
    if (!user) {
        return res.status(401).json({ message: "wrong username or email" })
    }
    const isPaswd = await bcrypt.compare(password, user.password)
    //compare password
    if (!isPaswd) {
        return res.status(401).json({ message: "wrong password" })
    }
    //generate jwt

    // const authHeader = req.headers.authorization;

    if (user) {
        const token = jwt.sign({username:user.username,password}, user.username)
        res.status(200).json({ token: token,email:email, firstname: user.firstname,username:user.username,pass:user.password })
        
    }
}



        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message })
    }
}

const autoLogin = async(req,res)=>{
    try {
        res.status(200)
        }
            
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}


const contact = async (req, res) => {
    try {
        const { email, username, query } = req.body;
        if (!email || !username || !query) {
            return res.status(404).json({ message: "all fields required" })
        }

        else {
            const newQuery = new Query({
                email,
                username,
                query
            });

            await newQuery.save();
            res.status(200).send(newQuery)
        }

    }
    catch (error) {
        res.status(520).send(error)
    }
}

const addBlockedUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(404).json({ message: "Email pleasee" })
        }
        
        else {
            const newBlockedUser = new BlockedUser({
                email
            });
            await User.deleteOne({email});
            await newBlockedUser.save();
            res.status(200).send(newBlockedUser)
        }

    }
    catch (error) {
        res.status(520).send(error)
    }
}

const addCaseFinder = async(req,res)=>{
    try {
        console.log("FIREBASE_AUTH value:", process.env.FIREBASE_AUTH);

        const { name, fName, contact,reportedBy,  city,address, age,date,mentalCondition,caseType } = req.body;
        
        if (!req.file) {
          res.status(400).send('No file uploaded.');
          return;
        }

        //else if (!name || !fName || !contact || !city || !address || !age || !date || !mentalCondition) {
            
         else if (!name || !reportedBy || !caseType || !fName || !contact || !city || !address || !age || !date || !mentalCondition) {
            res.status(400).send('all fields required');
            return;
          }
          else{
            console.log(req.body,'\n',req.file)
            const bucket = admin.storage().bucket();
            const file = req.file;
            console.log('file : ',req.file)
            const currentDate = new Date();
            const timestamp = currentDate.toISOString().replace(/[-:.]/g, ''); // Format: YYYYMMDDTHHmmssZ
            
            // Upload the file to Firebase Storage
            await bucket.upload(file.path, {
              destination: `${caseType}/` + `${caseType}_${timestamp}`,
              metadata: {
                contentType: file.mimetype
              }
            });
            await bucket.makePublic();
            // const imageUrl = `https://storage.googleapis.com/${bucket.name}/images/${file.filename}`;
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/find2gether-5c895.appspot.com/o/${caseType}%2F${caseType}_${timestamp}?alt=media`;
            const dateObject = new Date(date);

            // Extract the year, month, and day from the date object
            const year = dateObject.getFullYear();
            const month = dateObject.getMonth() + 1; // Adding 1 because getMonth returns zero-based month index
            const day = dateObject.getDate();
            
            // Create a formatted date string
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            const newCase = new Case({
                name,reportedBy, fName,caseType, contact,  city,address, age,date:formattedDate,mentalCondition ,imgUrl:imageUrl
            });
            // res.status(200).send('done');
            
            await newCase.save();
            // const sda = await Case.findOne({ newCase})
            res.status(200).send(newCase);
            fs.unlink(file.path, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted successfully');
                }
              });}
        
      } catch (error) {
        console.error('Error uploading file to Firebase Storage:', error);
        res.status(500).send('Error uploading file to Firebase Storage.');
      }
}

const allSuspects = async(req,res)=>{
    try {
        
           const suspects = await Case.find({caseType:'sus'})
           res.status(200).send(suspects)
        }
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const allMissings = async(req,res)=>{
    try {
        
           const suspects = await Case.find({caseType:'mis'})
           res.status(200).send(suspects)
        }
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const allUploadedCases = async(req,res)=>{
    try {
        const {username} = req.query
        if(!username){
            res.status(401).send('Enter Username')
        }
        else{
            const personalCases = await Case.find({reportedBy:username})
            res.status(200).send(personalCases)
        
        }
            }
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const deleteCase = async(req,res)=>{
    try {
        const {caseId} = req.body
        if(!caseId){
            res.status(401).send('Enter CaseId')
        }
       

        
        else{
            const findCase = await Case.findOne({_id:caseId});
            console.log(findCase)
            if(!findCase){
                res.status(401).send('No Case Found')
            }
            else{
                await Case.deleteOne({_id:caseId})
                res.status(200).send('done')
            }
        
        }
            }
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}

const matchedCases = async(req,res)=>{
    try {
        const {imageId,caseType} = req.query
        if(!imageId){
            res.status(401).send('Enter imageId')
        }
        else if(!caseType){
            res.status(401).send('Enter caseType')
        }
        else{
            // const imageIds = imageId.split(',')

            const matchedCase = await Case.find({_id:imageId ,caseType:caseType})
            res.status(200).send(matchedCase)
        
        }
            }
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const allMatchedCases = async(req,res)=>{
    try {
        const {imageId} = req.query
        if(!imageId){
            res.status(401).send('Enter imageId')
        }
       
        else{
            // const imageIds = imageId.split(',')

            const matchedCase = await Case.find({_id:imageId })
            res.status(200).send(matchedCase)
        
        }
            }
    
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
module.exports = {allMatchedCases,matchedCases,autoLogin,deleteCase,allUploadedCases, allMissings,allSuspects,contact, login, signup, sendVerificationToken, verifyToken, deleteToken, checkUsernameAvailability,addBlockedUser,addCaseFinder }