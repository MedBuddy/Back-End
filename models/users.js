const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String
    },
    activated: {
        type: Boolean
    },
    image: {
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('User', User)