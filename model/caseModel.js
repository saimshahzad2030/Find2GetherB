const mongoose = require('mongoose')

const caseSchema = new mongoose.Schema({
    name:String,
    fName:String,
    contact:String,
    city:String,
    address:String,
     age:String,
     reportedBy:String,
     caseType:String,
     date:String,
     mentalCondition :String,
     imgUrl:String
});

const Case = mongoose.model('Cases', caseSchema);

module.exports = Case;