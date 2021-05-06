const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Feedback = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Feedback', Feedback)