// const { model } = require('mongoose');
// const auth = require('D:/Useful codes/bookLibB/MidTermBookLib/model/authModel');
// const book = require('D:/Useful codes/bookLibB/MidTermBookLib/model/bookModel');
// const jwt = require('D:/Useful codes/bookLibB/MidTermBookLib/middleware/jwt')
const bcrypt = require('bcrypt')
const authController = {
    async signup (req,res){
        try{
            const {email,password} = req.body;
            if (!email||!password){
              return res.status(404).json({message:"all fields required"})
            }
            // Check if the user already exists
            const exitingAuthor = await auth.findOne({email});
            if (exitingAuthor)
            {
                return res.status(409).json({message:"email already exist"})
            }
              // Hash the password
              const hashPaswd = await bcrypt.hash(password,10)
              //create user
              const newAuthor = new auth({
            
                email,
                password:hashPaswd,
                
              })
              await newAuthor.save()
             
              const token = jwt.sign(req.body,password)
              res.status(200).json({token})
        }
        catch(error){
                res.status(520).json({message:"internal server error",error:error.message})
        }
        
    },
    async login(req,res){
        try{
          const {email,password} = req.body;
          if(!email || !password){
            return res.status(401).json({message:"Enter Password & email both"})
  
          }
          //find user
          else{
            const author = await auth.findOne({email})
          const isPaswd = await bcrypt.compare(password,author.password)
          // console.log(user)
          if(!author){
              return res.status(401).json({message:"invalid email or password"})
          }
          //compare password
          else if(!isPaswd)
          {
              return res.status(401).json({message:"wrong password"})
          }
          //generate jwt
  
          // const authHeader = req.headers.authorization;
          
          else{
            const token = jwt.sign(req.body,password)
            res.status(200).send(token)
          }
          }
        } 
        catch(error)
        {
          return res.status(520).json({message:"internal server error",error:error.message})
        }     
      },
      async newBook(req,res){
        try{
            const {bookname,author,price} = req.body;
            // const [bearer,token,secretKey] = req.headers.authorization.split(" ");
            if (!bookname || !author || !price){
              return res.status(404).json({message:"all fields required"})
            }
          
            else{
              const findBook =await book.findOne({bookname})
            if(findBook){
              console.log(findBook)
              res.status(409).json("Book already Exist")
            } 
            
            else{
                //create Job
                const newBook = new book({
                    bookname,author,price
                })
                await newBook.save()
               
                // const token = jwt.sign(req.body)
                res.status(200).json({newBook})
              
            } 
            }

        }
        catch(error){
            res.status(520).send(error)
        }
      }
    }
  

module.exports = authController