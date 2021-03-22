const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Doctor = new Schema({
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
    },
    specialization: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Doctor', Doctor)