const express = require('express')
const bodyParser = require('body-parser')

const { host } = require('../shared/host')
const authenticate = require('../shared/authenticate')
const fileUpload = require('../shared/fileUploadConfig')

const Doctor = require('../models/doctor')

const doctorRouter = express.Router()
doctorRouter.use(bodyParser.json())

doctorRouter.get('/', authenticate.verifyUser, (req, res, next) => {
    Doctor.find({})
      .then((doctors) => {
          res.status(200).send(doctors)
      }, (err) => next(err))
      .catch((err) => next(err))
})

doctorRouter.get('/unverified', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Doctor.find({ verified: false })
        .then((doctors) => {
            res.status(200).send(doctors)
        }, (err) => next(err))
        .catch((err) => next(err))
})

doctorRouter.post('/license', authenticate.verifyUser, authenticate.verifyDoctor, fileUpload.uploadPdf.single('license'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        Doctor.findByIdAndUpdate(req.user.userId, { license: host + fileUpload.getFilePath(req.file.path) })
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

module.exports = doctorRouter