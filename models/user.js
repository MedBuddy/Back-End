const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { host } = require('../shared/host')

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
        type: Boolean,
        default: false
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    dob: {
        type: String,
        default: ''
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