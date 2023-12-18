const mongoose = require('mongoose')
const BlockedUserSchema = new mongoose.Schema({
    email:{type:String,required:true}
})

module.exports = mongoose.model('BlockedUserInfo',BlockedUserSchema)