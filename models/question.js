const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Reply = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Question = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    askedUserId: {
        type: String,
        required: true
    },
    files: {
        type: [String],
        default: []
    },
    replies: {
        type: [Reply],
        default: []
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Question', Question)