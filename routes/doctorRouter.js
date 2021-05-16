const express = require('express')
const bodyParser = require('body-parser')

const { host } = require('../shared/host')
const authenticate = require('../shared/authenticate')
const fileUpload = require('../shared/fileUploadConfig')

const Doctor = require('../models/doctor')
const Review = require('../models/review')
const Message = require('../models/message')

const doctorRouter = express.Router()
doctorRouter.use(bodyParser.json())

doctorRouter.get('/', authenticate.verifyUser, (req, res, next) => {
    Doctor.find({})
      .populate('image')
      .then((doctors) => {
          res.status(200).send(doctors)
      }, (err) => next(err))
      .catch((err) => next(err))
})

doctorRouter.get('/unverified', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Doctor.find({ verified: false })
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
        .then((reviews) => {
            res.status(200).send(reviews)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.post(authenticate.verifyUser, authenticate.verifyNormalUser, (req, res, next) => {
    Review.findOne({ userId: req.user.userId })
        .then(review => {
            if(review){
                err = new Error(`You can post a review only once!`)
                err.status = 404
                return next(err)
            }
            else{
                req.body.userId = req.user.userId
                req.body.doctorId = req.params['doctorId']
                Review.create(req.body)
                    .then((review) => {
                        Review.findById(review._id)
                            .then((review) => {
                                res.status(200).send(review)
                            }, err => next(err))
                            .catch(err => next(err))
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }
        })
})
.put((req, res, next) => {
    res.status(200).send('PUT operation not supported')
})
.delete((req, res, next) => {
    res.status(200).send('DELETE operation not supported')
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
                        Review.findById(review._id)
                            .then(review => {
                                res.status(200).send(review)
                            }, err => next(err))
                            .catch(err => next(err))
                    }, err => next(err))
                    .catch(err => next(err))
            }
            else{
                err = new Error(`You are not allowed to edit this review!`)
                err.status = 404
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
                        res.status(200).send(resp)
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

doctorRouter.get('/:doctorId/chats', authenticate.verifyUser, authenticate.verifyDoctor, (req, res, next) => {
    Message.find({})
        .then(messages => {
            const chats = messages.filter(message => {
                let users = message.roomId.split('-')
                return (users[1] === req.user.username || users[2] === req.user.username)
            })
            res.status(200).send(chats)
        }, err => next(err))
        .catch(err => next(err))
})

module.exports = doctorRouter