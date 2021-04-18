const express = require('express')
const bodyParser = require('body-parser')

const User = require('../models/user')

const authenticate = require('../shared/authenticate')

const userRouter = express.Router()
userRouter.use(bodyParser.json())

userRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
      .then((users) => {
          res.status(200).send(users)
      }, (err) => next(err))
      .catch((err) => next(err))
})

module.exports = userRouter