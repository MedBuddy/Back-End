const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Like = new Schema({
    userId: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Comment = new Schema({
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

const Post = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    postedUserId: {
        type: String,
        required: true
    },
    files: {
        type: [String],
        default: []
    },
    likes: {
        type: [Like],
        default: []
    },
    comments: {
        type: [Comment],
        default: []
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Post', Post)