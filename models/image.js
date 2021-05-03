const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { host } = require('../shared/host')

const Image = new Schema({
    url: {
        type: String,
        default: host + '/images/user-default.jpg'
    },
    username: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Image', Image)