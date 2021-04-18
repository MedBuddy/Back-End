const express = require('express')
const bodyParser = require('body-parser')

const Post = require('../models/post')
const authenticate = require('../shared/authenticate')

const postRouter = express.Router()
postRouter.use(bodyParser.json())

postRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    Post.find({})
        .then((posts) => {
            res.status(200).send(posts)
        }, err => next(err))
        .catch(err => next(err))
})

module.exports = postRouter