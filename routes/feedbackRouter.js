const express = require('express')
const bodyParser = require('body-parser')

const Feedback = require('../models/feedback')

const authenticate = require('../shared/authenticate')

const feedbackRouter = express.Router()
feedbackRouter.use(bodyParser.json())

feedbackRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedback.find({})
      .then((feedbacks) => {
          res.status(200).send(feedbacks)
      }, (err) => next(err))
      .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    req.body.userId = req.user.userId
    Feedback.create(req.body)
        .then((feedback) => {
            res.status(200).send(feedback)
        }, err => next(err))
        .catch(err => next(err))
})
.put((req, res, next) => {
    res.status(200).send('PUT operation not supported')
})
.delete((req, res, next) => {
    res.status(200).send('DELETE operation not supported')
})

module.exports = feedbackRouter