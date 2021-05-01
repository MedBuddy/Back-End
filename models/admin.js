const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { host } = require('../shared/host')

const Admin = new Schema({
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
    activated: {
        type: Boolean,
        default: true
    },
    type: {
        type: Number,
        default: 3
    },
},{
    timestamps: true
})

module.exports = mongoose.model('Admin', Admin)