const mongoose = require('mongoose')

const querySchema = new mongoose.Schema({
    email: String,
    username: String,
    query: String,
});

const Query = mongoose.model('Query', querySchema);

module.exports = Query;