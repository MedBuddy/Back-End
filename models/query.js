const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Reply = new Schema({
    content: {
        type: String,
        required: true
    },
    upvotes: {
        type: [String],
        default: []
    },
    downvotes: {
        type: [String],
        default: []
    },
    author: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Query = new Schema({
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

module.exports = mongoose.model('Query', Query)