const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Message', Message)