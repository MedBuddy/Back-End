const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { host } = require('../shared/host')

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
    verified: {
        type: Boolean
    },
    license: {
        type: String
    },
    image: {
        type: String,
        default: host + '/images/user-default.jpg'
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    specialization: {
        type: String,
        default: ''
    },
    dob: {
        type: Date,
        default: new Date()
    },
    gender: {
        type: String,
        default: ''
    },
    bloodgroup: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Doctor', Doctor)