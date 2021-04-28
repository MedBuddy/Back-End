const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Review = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Review', Review)