const express = require('express')
const bodyParser = require('body-parser')

const Query = require('../models/query')

const authenticate = require('../shared/authenticate')
const fileUpload = require('../shared/fileUploadConfig')
const { host } = require('../shared/host')

let queryFields = [
    {
        name: 'image',
        maxCount: 3
    }
]

const queryRouter = express.Router()
queryRouter.use(bodyParser.json())

queryRouter.route('/')
.get((req, res, next) => {
    Query.find({})
        .populate('userIcon')
        .populate('replies.userIcon')
        .then((queries) => {
            res.status(200).send(queries)
        }, err => next(err))
        .catch(err => next(err))
})
.post(authenticate.verifyUser, fileUpload.uploadQuery.fields(queryFields), (req, res, next) => {
    if(req.files){
        console.log('Files received!')
        let files = []
        for(let i in req.files){
            for(let j = 0; j < req.files[i].length; j++){
                files.push(host + fileUpload.getFilePath(req.files[i][j].path))
            }
        }
        const query = {
            title: req.body.title,
            content: req.body.content,
            askedUserId: req.user.userId,
            askedUserName: req.user.username,
            userIcon: req.user.icon,
            files: files
        }
        Query.create(query)
            .then((query) => {
                Query.findById(query._id)
                    .populate('userIcon')
                    .populate('replies.userIcon')
                    .then(query => {
                        res.status(200).send(query)
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

queryRouter.get('/myqueries', authenticate.verifyUser, (req, res, next) => {
    Query.find({ askedUserId: req.user.userId })
        .populate('userIcon')
        .populate('replies.userIcon')
        .then(queries => {
            res.status(200).send(queries)
        }, err => next(err))
        .catch(err => next(err))
})

queryRouter.route('/:queryId')
.get((req, res, next) => {
    Query.findById(req.params['queryId'])
        .populate('userIcon')
        .populate('replies.userIcon')
        .then((query) => {
            res.status(200).send(query)
        }, err => next(err))
        .catch(err => next(err))
})
.post((req, res, next) => {
    res.status(405).send('POST operation not allowed')
})
.put(authenticate.verifyUser, fileUpload.uploadQuery.fields(queryFields), (req, res, next) => {
    if(req.files){
        console.log('Files Received!')
        Query.findById(req.params['queryId'])
            .then((query) => {
                if(query.askedUserId != req.user.userId){
                    err = new Error(`You are not allowed to edit this query!`)
                    err.status = 404
                    return next(err)
                }
                else{
                    fileUpload.deleteFiles(query.files, req.user.userId, 'queries')
                    let files = []
                    for(let i in req.files){
                        for(let j = 0; j < req.files[i].length; j++){
                            files.push(host + fileUpload.getFilePath(req.files[i][j].path))
                        }
                    }
                    query.title = req.body.title
                    query.content = req.body.content
                    query.files = files
                    query.save()
                        .then((query) => {
                            res.status(200).send(query)
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
.delete(authenticate.verifyUser, (req, res, next) => {
    Query.findById(req.params['queryId'])
        .then((query) => {
            if(query.askedUserId != req.user.userId){
                err = new Error(`You are not allowed to delete this query!`)
                err.status = 404
                return next(err)
            }
            else{
                fileUpload.deleteFiles(query.files, req.user.userId, 'queries')
                query.remove()
                    .then((resp) => {
                        res.status(200).send(resp)
                    }, err => next(err))
                    .catch(err => next(err))
            }
        }, err => next(err))
        .catch(err => next(err))
})

queryRouter.route('/:queryId/replies')
.get((req, res, next) => {
    Query.findById(req.params['queryId'])
        .populate('replies.userIcon')
        .then((query) => {
            res.status(200).send(query.replies)
        }, err => next(err))
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Query.findById(req.params['queryId'])
        .then((query) => {
            const reply = {
                content: req.body.content,
                author: req.user.username,
                userId: req.user.userId,
                userIcon: req.user.icon
            }
            query.replies.push(reply)
            query.save()
                .then(query => {
                    Query.findById(query._id)
                        .populate('userIcon')
                        .populate('replies.userIcon')
                        .then(query => {
                            res.status(200).send({query: query, msg: 'Reply Added'})
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
    Query.findById(req.params['queryId'])
        .then((query) => {
            query.replies = []
            query.save()
                .then(query => {
                    Query.findById(query._id)
                        .populate('userIcon')
                        .populate('replies.userIcon')
                        .then(query => {
                            res.status(200).send({query: query, msg: 'Replies Deleted'})
                        }, err => next(err))
                        .catch(err => next(err))
                }, err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})

queryRouter.route('/:queryId/replies/:replyId')
.get((req, res, next) => {
    Query.findById(req.params['queryId'])
        .populate('replies.userIcon')
        .then((query) => {
            if(query.replies.id(req.params['replyId']) != null)
                res.status(200).send(query.replies.id(req.params['replyId']))
            else{
                err = new Error(`Reply ${req.params['replyId']} not found`)
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
    Query.findById(req.params['queryId'])
        .then((query) => {
            if(query.replies.id(req.params['replyId']) != null){
                if(query.replies.id(req.params['replyId']).userId == req.user.userId){
                    query.replies.id(req.params['replyId']).content = req.body.content
                    query.save()
                        .then(query => {
                            Query.findById(query._id)
                                .populate('userIcon')
                                .populate('replies.userIcon')
                                .then(query => {
                                    res.status(200).send({query: query, msg: 'Reply Edited'})
                                }, err => next(err))
                                .catch(err => next(err))
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else{
                    res.status(403).send('You are not allowed to edit this reply')
                }
            }
            else{
                err = new Error(`Reply ${req.params['replyId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Query.findById(req.params['queryId'])
        .then((query) => {
            if(query.replies.id(req.params['replyId']) != null){
                if(query.replies.id(req.params['replyId']).userId == req.user.userId){
                    query.replies.id(req.params['replyId']).remove()
                    query.save()
                        .then(query => {
                            Query.findById(query._id)
                                .populate('userIcon')
                                .populate('replies.userIcon')
                                .then(query => {
                                    res.status(200).send({query: query, msg: 'Reply Deleted'})
                                }, err => next(err))
                                .catch(err => next(err))
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else{
                    res.status(403).send('You are not allowed to delete this reply')
                }
            }
            else{
                err = new Error(`Reply ${req.params['replyId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})

queryRouter.route('/:queryId/replies/:replyId/votes')
.get((req, res, next) => {
    Query.findById(req.params['queryId'])
        .then((query) => {
            if(query.replies.id(req.params['replyId']) != null){
                let reply = query.replies.id(req.params['replyId'])
                let response = {
                    total_votes: reply.upvotes.length + reply.downvotes.length,
                    upvotes: reply.upvotes.length,
                    downvotes: reply.downvotes.length,
                    upvotedBy: reply.upvotes,
                    downvotedBy: reply.downvotes
                }
                res.status(200).send(response)
            }
            else{
                err = new Error(`Reply ${req.params['replyId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Query.findById(req.params['queryId'])
        .populate('userIcon')
        .populate('replies.userIcon')
        .then((query) => {
            if(query.replies.id(req.params['replyId']) != null){
                let reply = query.replies.id(req.params['replyId'])
                upvoteIndex = reply.upvotes.indexOf(req.user.userId)
                downvoteIndex = reply.downvotes.indexOf(req.user.userId)
                if(upvoteIndex == -1 && downvoteIndex == -1){
                    if(req.body.voteType === 'up'){
                        reply.upvotes.push(req.user.userId)
                        query.replies.id(req.params['replyId']).upvotes = reply.upvotes
                    }
                    else{
                        reply.downvotes.push(req.user.userId)
                        query.replies.id(req.params['replyId']).downvotes = reply.downvotes
                    }
                    query.save()
                        .then(query => {
                            let vote = req.body.voteType[0].toUpperCase()+req.body.voteType.substring(1)
                            res.status(200).send({query: query, msg: `${vote}voted successfully!`})
                        }, err => next(err))
                        .catch(err => next(err))
                }
                else if(upvoteIndex != -1){
                    if(req.body.voteType === 'up')
                        res.status(200).send({query: query, msg: 'Already Upvoted!'})
                    else{
                        reply.upvotes.splice(upvoteIndex, 1)
                        reply.downvotes.push(req.user.userId)
                        query.replies.id(req.params['replyId']).upvotes = reply.upvotes
                        query.replies.id(req.params['replyId']).downvotes = reply.downvotes
                        query.save()
                            .then(query => {
                                res.status(200).send({query: query, msg: 'Downvoted successfully!'})
                            }, err => next(err))
                            .catch(err => next(err))
                    }
                }
                else{
                    if(req.body.voteType === 'down')
                        res.status(200).send({query: query, msg: 'Already Downvoted!'})
                    else{
                        reply.downvotes.splice(downvoteIndex, 1)
                        reply.upvotes.push(req.user.userId)
                        query.replies.id(req.params['replyId']).upvotes = reply.upvotes
                        query.replies.id(req.params['replyId']).downvotes = reply.downvotes
                        query.save()
                            .then(query => {
                                res.status(200).send({query: query, msg: 'Upvoted successfully!'})
                            }, err => next(err))
                            .catch(err => next(err))
                    }
                }
            }
            else{
                err = new Error(`Reply ${req.params['replyId']} not found`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})
.put((req, res, next) => {
    res.status(405).send('PUT operation not allowed')
})
.delete(authenticate.verifyUser, (req, res, next) => {
    res.status(405).send('DELETE operation not allowed')
})

module.exports = queryRouter