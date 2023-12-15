const mongoose = require('mongoose')
const BookSchema = new mongoose.Schema({
    bookname:{type:String,required:true},    
    author:{type:String,required:true},
    borrowedby:{type:String},
    borrowedDate:{type:String},
    returnDate:{type:String}
})

module.exports = mongoose.model('BorrowedBooks',BookSchema)