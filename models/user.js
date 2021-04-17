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
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    type: {
        type: Number,
        default: 1
    },
    image: {
        type: String,
        default: '/images/user-default.jpg'
    },
    dob: {
        type: Date,
        default: new Date()
    },
    gender: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    bloodgroup: {
        type: String,
        default: ''
    }
},{
    timestamps: true
})

module.exports = mongoose.model('User', User)