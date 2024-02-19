const mongoose = require('mongoose')

const caseNumberSchema = new mongoose.Schema({
    total:Number
});

const CaseNoModel = mongoose.model('Casesds', caseNumberSchema);

module.exports = CaseNoModel;