const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comment = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userIcon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
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
    postedUserName: {
        type: String,
        required: true
    },
    userIcon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    files: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
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