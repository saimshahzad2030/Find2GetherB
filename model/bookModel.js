const mongoose = require('mongoose')
const BookSchema = new mongoose.Schema({
    bookname:{type:String,required:true},    
    author:{type:String,required:true},
    price:{type:String},
})

module.exports = mongoose.model('Books',BookSchema)