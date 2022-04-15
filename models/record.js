const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('record', recordSchema)