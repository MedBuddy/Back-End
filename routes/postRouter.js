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
        .populate('userIcon')
        .populate('comments.userIcon')
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
            postedUserName: req.user.username,
            userIcon: req.user.icon,
            files: files
        }
        Post.create(post)
            .then((post) => {
                Post.findById(post._id)
                    .populate('userIcon')
                    .populate('comments.userIcon')
                    .then(post => {
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
.put((req, res, next) => {
    res.status(405).send('PUT operation not allowed')
})
.delete((req, res, next) => {
    res.status(405).send('DELETE operation not allowed')
})

postRouter.get('/myposts', authenticate.verifyUser, authenticate.verifyDoctorOrAdmin, (req, res, next) => {
    Post.find({ postedUserId: req.user.userId })
        .populate('userIcon')
        .populate('comments.userIcon')
        .then(posts => {
            res.status(200).send(posts)
        }, err => next(err))
        .catch(err => next(err))
})

postRouter.route('/:postId')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .populate('userIcon')
        .populate('comments.userIcon')
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
        Post.findById(req.params['postId'])
            .then((post) => {
                if(post.postedUserId != req.user.userId){
                    err = new Error(`You are not allowed to edit this post!`)
                    err.status = 404
                    return next(err)
                }
                else{
                    let files = []
                    if(req.body.removed){
                        req.body.removed.split(' ').forEach(i => files.push(post.files[i]))
                        fileUpload.deleteFiles(files, req.user.userId, 'posts')
                    }
                    files = post.files.filter(file => !files.includes(file))
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
                            res.status(200).send({post: post, msg: 'Post Edited'})
                        }, err => next(err))
                        .catch(err => next(err))
                }
            }, err => next(err))
            .catch(err => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})
.delete(authenticate.verifyUser, authenticate.verifyDoctorOrAdmin, (req, res, next) => {
    Post.findById(req.params['postId'])
        .then((post) => {
            if(post.postedUserId != req.user.userId){
                err = new Error(`You are not allowed to delete this post!`)
                err.status = 404
                return next(err)
            }
            else{
                fileUpload.deleteFiles(post.files, req.user.userId, 'posts')
                post.remove()
                    .then((resp) => {
                        res.status(200).send(resp)
                    }, err => next(err))
                    .catch(err => next(err))
            }
        }, err => next(err))
        .catch(err => next(err))
})

postRouter.route('/:postId/comments')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .populate('comments.userIcon')
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
                author: req.user.username,
                userId: req.user.userId,
                userIcon: req.user.icon
            }
            post.comments.push(comment)
            post.save()
                .then(post => {
                    Post.findById(post._id)
                        .populate('userIcon')
                        .populate('comments.userIcon')
                        .then(post => {
                            res.status(200).send(post)
                        }, err => next(err))
                        .catch(err => next(err))
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
                    Post.findById(post._id)
                        .populate('userIcon')
                        .populate('comments.userIcon')
                        .then(post => {
                            res.status(200).send({post: post, msg: 'Comments Deleted'})
                        }, err => next(err))
                        .catch(err => next(err))
                }, err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})

postRouter.route('/:postId/comments/:commentId')
.get((req, res, next) => {
    Post.findById(req.params['postId'])
        .populate('comments.userIcon')
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
                if(post.comments.id(req.params['commentId']).userId == req.user.userId){
                    post.comments.id(req.params['commentId']).content = req.body.content
                    post.save()
                        .then(post => {
                            Post.findById(post._id)
                                .populate('userIcon')
                                .populate('comments.userIcon')
                                .then(post => {
                                    res.status(200).send({post: post, msg: 'Comment Edited'})
                                }, err => next(err))
                                .catch(err => next(err))
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else{
                    res.status(403).send('You are not allowed to edit this comment')
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
                if(post.comments.id(req.params['commentId']).userId == req.user.userId){
                    post.comments.id(req.params['commentId']).remove()
                    post.save()
                        .then(post => {
                            Post.findById(post._id)
                                .populate('userIcon')
                                .populate('comments.userIcon')
                                .then(post => {
                                    res.status(200).send({post: post, msg: 'Comment Deleted'})
                                }, err => next(err))
                                .catch(err => next(err))
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else{
                    res.status(403).send(`You are not allowed to delete this comment!`)
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
        .populate('userIcon')
        .populate('comments.userIcon')
        .then((post) => {
            if(post.likes.includes(req.user.username))
                post.likes.splice(post.likes.indexOf(req.user.username), 1)
            else
                post.likes.push(req.user.username)
            post.save()
                .then(post => {
                    res.status(200).send({post: post, msg: 'Liked successfully!'})
                }, err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})
.put((req, res, next) => {
    res.status(405).send('PUT operation not allowed')
})
.delete((req, res, next) => {
    res.status(405).send('DELETE operation not allowed')
})

module.exports = postRouter