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
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    license: {
        type: String,
        default: ''
    },
    type: {
        type: Number,
        default: 2
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
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