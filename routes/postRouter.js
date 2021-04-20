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
.get((req, res, next) => {
    Post.find({})
        .then((posts) => {
            res.status(200).send(posts)
        }, err => next(err))
        .catch(err => next(err))
})
.post(authenticate.verifyUser, authenticate.verifyDoctorOrAdmin, fileUpload.uploadPost.fields(postFields), (req, res, next) => {
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
    res.status(405).send('PUT operation not allowed')
})
.delete((req, res, next) => {
    res.status(405).send('DELETE operation not allowed')
})

postRouter.route('/:postId')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            res.status(200).send(post)
        }, err => next(err))
        .catch(err => next(err))
})
.post((req, res, next) => {
    res.status(405).send('POST operation not allowed')
})
.put(authenticate.verifyUser, authenticate.verifyDoctorOrAdmin, fileUpload.uploadPost.fields(postFields), (req, res, next) => {
    if(req.files){
        console.log('Files Received!')
        Post.findOne({ _id: req.params['postId'], postedUserId: req.user.userId })
            .then((post) => {
                fileUpload.deleteFiles(post.files, req.user.userId)
                let files = []
                for(let i in req.files){
                    for(let j = 0; j < req.files[i].length; j++){
                        files.push(host + fileUpload.getFilePath(req.files[i][j].path))
                    }
                }
                post.title = req.body.title
                post.content = req.body.content
                post.files = files
                post.save()
                    .then((post) => {
                        res.status(200).send(post)
                    }, err => next(err))
                    .catch(err => next(err))
            }, err => next(err))
            .catch(err => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})
.delete(authenticate.verifyUser, authenticate.verifyDoctorOrAdmin, (req, res, next) => {
    Post.findOne({ _id: req.params['postId'], postedUserId: req.user.userId })
        .then((post) => {
            fileUpload.deleteFiles(post.files, req.user.userId)
            post.remove()
                .then((resp) => {
                    res.status(200).send(resp)
                }, err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})

postRouter.route('/:postId/comments')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            res.status(200).send(post.comments)
        }, err => next(err))
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            const comment = {
                content: req.body.content,
                author: req.user.userId
            }
            post.comments.push(comment)
            post.save()
                .then(post => {
                    res.status(200).send(post)
                }, err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})
.put((req, res, next) => {
    res.status(405).send('PUT operation not allowed')
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            post.comments = []
            post.save()
                .then(post => {
                    res.status(200).send(post)
                }, err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})

postRouter.route('/:postId/comments/:commentId')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            if(post.comments.id(req.params['commentId']) != null)
                res.status(200).send(post.comments.id(req.params['commentId']))
            else{
                err = new Error(`Comment ${req.params['commentId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})
.post((req, res, next) => {
    res.status(405).send('POST operation not allowed')
})
.put(authenticate.verifyUser, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            if(post.comments.id(req.params['commentId']) != null){
                if(post.comments.id(req.params['commentId']).author == req.user.userId){
                    post.comments.id(req.params['commentId']).content = req.body.content
                    post.save()
                        .then(post => {
                            res.status(200).send(post)
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else{
                    err = new Error(`You are not allowed to edit this comment!`)
                    err.status = 404
                    return next(err)
                }
            }
            else{
                err = new Error(`Comment ${req.params['commentId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            if(post.comments.id(req.params['commentId']) != null){
                if(post.comments.id(req.params['commentId']).author == req.user.userId){
                    post.comments.id(req.params['commentId']).remove()
                    post.save()
                        .then(post => {
                            res.status(200).send(post)
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else{
                    err = new Error(`You are not allowed to delete this comment`)
                    err.status = 404
                    return next(err)
                }
            }
            else{
                err = new Error(`Comment ${req.params['commentId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})

postRouter.route('/:postId/likes')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            res.status(200).send({ likes: post.likes.length, likedBy: post.likes })
        }, err => next(err))
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            if(post.likes.includes(req.user.userId))
                res.status(200).send('Already Liked')
            else{
                post.likes.push(req.user.userId)
                post.save()
                    .then(post => {
                        res.status(200).send(post)
                    }, err => next(err))
                    .catch(err => next(err))
            }
        }, err => next(err))
        .catch(err => next(err))
})
.put((req, res, next) => {
    res.status(405).send('PUT operation not allowed')
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            let index = post.likes.indexOf(req.user.userId)
            if(index == -1)
                res.status(200).send('Not Liked')
            else{
                post.likes.splice(index, 1)
                post.save()
                    .then(post => {
                        res.status(200).send(post)
                    }, err => next(err))
                    .catch(err => next(err))
            }
        }, err => next(err))
        .catch(err => next(err))
})

module.exports = postRouter