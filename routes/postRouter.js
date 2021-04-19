const express = require('express')
const bodyParser = require('body-parser')

const Post = require('../models/post')

const authenticate = require('../shared/authenticate')
const fileUpload = require('../shared/fileUploadConfig')
const { host } = require('../shared/host')

let postFields = [
    {
        name: 'image',
        maxCount: 5
    },
    {
        name: 'video',
        maxCount: 1
    },
    {
        name: 'audio',
        maxCount: 2
    }
]

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
.post(authenticate.verifyUser, authenticate.verifyDoctor, fileUpload.uploadPost.fields(postFields), (req, res, next) => {
    if(req.files){
        console.log('Files received!')
        let files = []
        for(let i in req.files){
            for(let j = 0; j < req.files[i].length; j++){
                files.push(host + fileUpload.getFilePath(req.files[i][j].path))
            }
        }
        const post = {
            title: req.body.title,
            content: req.body.content,
            postedUserId: req.user.userId,
            files: files
        }
        Post.create(post)
            .then((post) => {
                res.status(200).send(post)
            }, err => next(err))
            .catch(err => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})
.put((req, res, next) => {
    res.statusCode(405).send('PUT operation not allowed')
})
.delete((req, res, next) => {
    res.statusCode(405).send('DELETE operation not allowed')
})

module.exports = postRouter