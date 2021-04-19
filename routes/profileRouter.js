const express = require('express')
const bodyParser = require('body-parser')

const User = require('../models/user')
const Doctor = require('../models/doctor')

const { host } = require('../shared/host')
const authenticate = require('../shared/authenticate')
const fileUpload = require('../shared/fileUploadConfig')

const profileRouter = express.Router()
profileRouter.use(bodyParser.json())

profileRouter.route('/details')
.get(authenticate.verifyUser, (req, res, next) => {
    let Profile
    if(req.user.type == 1) Profile = User
    else if(req.user.type == 2) Profile = Doctor
    else return res.sendStatus(403)
    Profile.findById(req.user.userId)
        .then((profile) => {
            res.status(200).send(profile)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.put(authenticate.verifyUser, (req, res, next) => {
    let Profile
    if(req.user.type == 1) Profile = User
    else if(req.user.type == 2) Profile = Doctor
    else return res.sendStatus(403)
    Profile.findByIdAndUpdate(req.user.userId, req.body)
        .then((profile) => {
            Profile.findById(profile._id)
              .then((profile) => {
                  res.status(200).send(profile)
              }, (err) => next(err))
              .catch((err) => next(err))
        }, (err) => next(err))
        .catch((err) => next(err))
})

profileRouter.post('/imageUpload', authenticate.verifyUser, fileUpload.uploadImage.single('image'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        let Profile
        if(req.user.type == 1) Profile = User
        else if(req.user.type == 2) Profile = Doctor
        else return res.sendStatus(403)
        Profile.findByIdAndUpdate(req.user.userId, { image: host + fileUpload.getFilePath(req.file.path) })
            .then((profile) => {
                Profile.findById(profile._id)
                  .then((profile) => {
                      res.status(200).send(profile)
                  }, (err) => next(err))
                  .catch((err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})

module.exports = profileRouter