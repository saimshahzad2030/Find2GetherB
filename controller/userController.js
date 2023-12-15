
const User = require('../model/userModel');
const nodemailer = require('nodemailer');
// const Book = require('D:/Useful codes/bookLibB/MidTermBookLib/model/bookModel');
const jwt = require('../middleware/jwt')
// const borrowedBooksModel = require('D:/Useful codes/bookLibB/MidTermBookLib/model/borrowedBooksModel');
const BlockedUser = require('../model/blockedUserModel')
const Query = require('../model/ContactModel')
const bcrypt = require('bcrypt');
const Token = require('../model/Token')
const generateToken = ()=> {
    // Generate a random number between 1000 and 9999
    const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return token;
  }
   
  const sendVerificationEmail = async(userEmail, verificationToken,req,res)  => {
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
      from: 'saimshehzad2040@gmail.com',
      to: userEmail,
      subject: 'Account Verification',
      text: `Click the following link to verify your account: https://yourapp.com/verify?token=${verificationToken}`,
    };
  
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    const newToken = new Token({
        email:userEmail,
        token:verificationToken,
    });
try{
    
    await newToken.save();
    console.log('Email sent:', info.messageId+ '\nToken:', verificationToken);
   
}
catch(error){
    return error;
    
}
  
  }
  const sendVerificationToken  = async(req, res) =>{
    // Send verification email
    const verificationToken = generateToken();
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(404).json({ message: "Email Required" });
        }

        const exitingUser = await User.findOne({ email });
        const existingBlockedUser = await BlockedUser.findOne({ email });

        if (exitingUser) {
            return res.status(409).json({ message: "email already exist" });
        } 
        else if (existingBlockedUser) {
            return res.status(410).json({ message: "You are a blocked user" });
        }
        else{
            sendVerificationEmail(email, verificationToken)
        .catch(error => console.error('Error sending email:', error));
        return res.status(200).json({ verificationToken });
        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
   

  }
  const verifyToken  = async(req, res) =>{
   
    try {
        const [ email,token] = req.headers.authorization.split(" ");
        if (!token) {
            return res.status(404).json({ message: "Enter Token" });
        }

        if (!email) {
            return res.status(404).json({ message: "Enter Email" });
        }
        const checkToken = await Token.findOne({email, token });
        
        if (!checkToken) {
            return res.status(409).json({ message: "Token doesn't match" });
        } 
        else{
           
        return res.status(200).json({ checkToken });
        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
   

  }
    const signup = async(req, res) => {

        try {
            const { email, password } = req.body;
    
            if (!email || !password) {
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
                    password: hashPaswd,
                });
    
                await newUser.save();
    
               
                const token = jwt.sign(req.body, password);
                return res.status(200).json({ token });
            }
        } catch (error) {
            return res.status(520).json({ message: "internal server error", error: error.message });
        }

    }
    const login = async(req, res)  => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(401).json({ message: "Enter Password & email both" })

            }
            //find user
            else {
                const user = await User.findOne({ email })
                console.log(user)
                if (!user) {
                    return res.status(401).json({ message: "wrong email" })
                }
                const isPaswd = await bcrypt.compare(password, user.password)
                //compare password
                 if (!isPaswd) {
                    return res.status(401).json({ message: "wrong password" })
                }
                //generate jwt

                // const authHeader = req.headers.authorization;

                if(user) {
                    const token = jwt.sign(req.body, password)
                    res.status(200).send(token)
                }
            }
        }
        catch (error) {
            return res.status(520).json({ message: "internal server error", error: error.message })
        }
    }
    const contact = async(req,res) =>{
        try {
            const { email, username,query } = req.body;
            if (!email || !username || !query ) {
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
    // const getBook = async(req, res)  => {
    //     try {
    //         const { bookname, author } = req.body;
    //         if (!bookname || !author) {
    //             return res.status(404).json({ message: "all fields required" })
    //         }

    //         else {
    //             const findBook = await Book.findOne({ bookname })
    //             if (findBook) {
    //                 // // console.log("book found");
    //                 const [bearer, token, secretKey, email] = req.headers.authorization.split(" ");
    //                 const date = new Date();


    //                 const threeDaysAfter = new Date(date.getTime() + (3 * 24 * 60 * 60 * 1000));

    //                 // console.log(findBook)
    //                 const newBorrowedBook = new borrowedBooksModel({
    //                     bookname,
    //                     author,
    //                     borrowedby: email,
    //                     borrowedDate: date.toString(),

    //                     returnDate: threeDaysAfter.toString()
    //                 })
    //                 await newBorrowedBook.save()
    //                 await Book.deleteOne({bookname:bookname})
    //                 res.status(200).send(newBorrowedBook)
    //             }

    //             else {
    //                 // //create Job
    //                 // const newBook = new book({
    //                 //     bookname,author,price
    //                 // })
    //                 // await newBook.save()

    //                 // // const token = jwt.sign(req.body)
    //                 // res.status(200).json({newBook})
    //                 res.status(402).send("No Book found")
    //             }
    //         }

    //     }
    //     catch (error) {
    //         res.status(520).send(error)
    //     }
    // }
    // const returnBook = async(req, res) => {
    //     try {
    //         const { bookname, author } = req.body;
    //         if (!bookname || !author) {
    //             return res.status(404).json({ message: "all fields required" })
    //         }

    //         else {
    //             const findBook = await borrowedBooksModel.findOne({ bookname })
    //             if (findBook) {
                
    //                 const newBook = new Book({
    //                     bookname,
    //                     author
                        
    //                 })
    //                 await newBook.save()
    //                 await borrowedBooksModel.deleteOne({bookname:bookname})
    //                 res.status(200).send(newBook)
    //             }

    //             else {
                 
    //                 res.status(402).send("No Book found")
    //             }
    //         }

    //     }
    //     catch (error) {
    //         res.status(520).send(error)
    //     }
    // }


module.exports = {contact,login,signup,sendVerificationToken,verifyToken}