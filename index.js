const express = require('express')
const cors = require('cors')
require('dotenv').config({path:'D:/Portfolio Websites/FYPB/config.env'})
const routerUser = require('./routes/userRoutes')
const routerAuthor = require('./routes/authorRoutes')

const connectDb = require('./db/db')


const app = express()
const port =  process.env.PORT || 5000 
//cors
app.use(cors())
//connectDB
const db = connectDb()


//middleware
app.use(express.json())
app.use('/user',routerUser)
app.use('/author',routerAuthor)

//routes
const currentDirectory = process.cwd();

//connect app
app.listen(port,()=>{
  console.log(`server is running on port ${port}`)
  console.log('Current Directory:', currentDirectory);
})