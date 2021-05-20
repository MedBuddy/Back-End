const express = require('express')
const bodyParser = require('body-parser')

const { host } = require('../shared/host')
const authenticate = require('../shared/authenticate')
const fileUpload = require('../shared/fileUploadConfig')

const Doctor = require('../models/doctor')
const Review = require('../models/review')
const Message = require('../models/message')
const User = require('../models/user')

const doctorRouter = express.Router()
doctorRouter.use(bodyParser.json())

doctorRouter.get('/', authenticate.verifyUser, (req, res, next) => {
    Doctor.find({ activated: true, verified: true })
      .populate('image')
      .then((doctors) => {
          res.status(200).send(doctors)
      }, (err) => next(err))
      .catch((err) => next(err))
})

doctorRouter.get('/unverified', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Doctor.find({ activated: true, verified: false })
        .populate('image')
        .then((doctors) => {
            res.status(200).send(doctors)
        }, (err) => next(err))
        .catch((err) => next(err))
})

doctorRouter.post('/license', fileUpload.uploadPdf.single('license'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        Doctor.findByIdAndUpdate(req.body.userId, { license: host + fileUpload.getFilePath(req.file.path) })
            .then((profile) => {
                Doctor.findById(profile._id)
                  .then((profile) => {
                      res.status(200).send(profile)
                  }, (err) => next(err))
                  .catch((err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err))
    }
    else{
        console.log('No File received!')
        res.status(200).send('Nothing!')
    }
})

doctorRouter.post('/messages', authenticate.verifyUser, (req, res, next) => {
    Message.find({ roomId: req.body.doctor + '-' + req.body.user })
        .then(messages => {
            res.status(200).send(messages)
        }, err => next(err))
        .catch(err => next(err))
})

doctorRouter.get('/chats', authenticate.verifyUser, authenticate.verifyDoctor, (req, res, next) => {
    Message.find({})
        .then(messages => {
            let chatUsers = new Set()
            messages.forEach(message => {
                let members = message.roomId.split('-')
                if(members[0] === req.user.username)
                    chatUsers.add(members[1])
            })
            User.find({})
                .populate('image')
                .then(users => {
                    let response = users.filter(user => chatUsers.has(user.username))
                    res.status(200).send(response)
                },err => next(err))
                .catch(err => next(err))
        }, err => next(err))
        .catch(err => next(err))
})

doctorRouter.get('/:doctorId', authenticate.verifyUser, (req, res, next) => {
    Doctor.findById(req.params['doctorId'])
        .populate('image')
        .then((doctor) => {
            res.status(200).send(doctor)
        }, (err) => next(err))
        .catch((err) => next(err))
})

doctorRouter.route('/:doctorId/reviews')
.get(authenticate.verifyUser, (req, res, next) => {
    Review.find({ doctorId: req.params['doctorId'] })
        .populate('userId')
        .then((reviews) => {
            Review.populate(reviews, 'userId.image')
            .then(reviews => {
                res.status(200).send(reviews)
            })
        }, (err) => next(err))
        .catch((err) => next(err))
})
.post(authenticate.verifyUser, authenticate.verifyNormalUser, (req, res, next) => {
    Review.findOne({ userId: req.user.userId })
        .then(review => {
            if(review){
                res.status(200).send({resCode: 0, msg: 'You can post a review only once!'})
            }
            else{
                req.body.userId = req.user.userId
                req.body.doctorId = req.params['doctorId']
                Review.create(req.body)
                    .then((review) => {
                        Review.find({ doctorId: req.params['doctorId'] })
                            .then(reviews => {
                                Doctor.findById(req.params['doctorId'])
                                    .then(doctor => {
                                        let n = reviews.length
                                        let rating = parseFloat(doctor.rating)
                                        let newRating = ((rating * n) + review.rating) / (n+1)
                                        doctor.rating = newRating.toString()
                                        doctor.save()
                                            .then(doctor => {
                                                Review.findById(review._id)
                                                    .populate('userId')
                                                    .then((review) => {
                                                        Review.populate(review, 'userId.image')
                                                        .then(review => {
                                                            res.status(200).send({resCode: 1, review: review})
                                                        })
                                                    }, err => next(err))
                                                    .catch(err => next(err))
                                            }, err => next(err))
                                            .catch(err => next(err))
                                    })
                            }, err => next(err))
                            .catch(err => next(err))
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }
        })
})
.put((req, res, next) => {
    res.status(405).send('PUT operation not supported')
})
.delete((req, res, next) => {
    res.status(405).send('DELETE operation not supported')
})

doctorRouter.route('/:doctorId/reviews/:reviewId')
.get(authenticate.verifyUser, (req, res, next) => {
    Review.findById(req.params['reviewId'])
        .populate('userId')
        .then((reviews) => {
            res.status(200).send(reviews)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.post((req, res, next) => {
    res.status(200).send('POST operation not supported')
})
.put(authenticate.verifyUser, authenticate.verifyNormalUser, (req, res, next) => {
    Review.findById(req.params['reviewId'])
        .then((review) => {
            if(review.userId == req.user.userId){
                review.rating = req.body.rating
                review.comment = req.body.comment
                review.save()
                    .then((review) => {
                        Review.find({ doctorId: req.params['doctorId'] })
                            .then(reviews => {
                                let mean = 0
                                reviews.forEach(r => mean += r.rating)
                                mean /= reviews.length
                                Doctor.findByIdAndUpdate(req.params['doctorId'], { rating: mean.toString() })
                                    .then(doctor => {
                                        Review.findById(review._id)
                                            .populate('userId')
                                            .then((review) => {
                                                Review.populate(review, 'userId.image')
                                                .then(review => {
                                                    res.status(200).send(review)
                                                })
                                            }, err => next(err))
                                            .catch(err => next(err))
                                    }, err => next(err))
                                    .catch(err => next(err))
                            }, err => next(err))
                            .catch(err => next(err))
                    }, err => next(err))
                    .catch(err => next(err))
            }
            else{
                err = new Error(`You are not allowed to edit this review!`)
                err.status = 403
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})
.delete(authenticate.verifyUser, authenticate.verifyNormalUser, (req, res, next) => {
    Review.findById(req.params['reviewId'])
        .then((review) => {
            if(review.userId == req.user.userId){
                review.remove()
                    .then((resp) => {
                        Review.find({ doctorId: req.params['doctorId'] })
                            .then(reviews => {
                                let mean = 0
                                reviews.forEach(r => mean += r.rating)
                                mean /= reviews.length
                                Doctor.findByIdAndUpdate(req.params['doctorId'], { rating: mean.toString() })
                                    .then(doctor => {
                                        res.status(200).send('Rating updated!')
                                    }, err => next(err))
                                    .catch(err => next(err))
                            }, err => next(err))
                            .catch(err => next(err))
                    }, err => next(err))
                    .catch(err => next(err))
            }
            else{
                err = new Error(`You are not allowed to delete this review!`)
                err.status = 404
                return next(err)
            }
        }, err => next(err))
        .catch(err => next(err))
})

module.exports = doctorRouter