const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { host } = require('../shared/host')

const Image = new Schema({
    url: {
        type: String,
        default: host + '/images/user-default.jpg'
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Image', Image)