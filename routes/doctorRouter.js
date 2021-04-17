const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const { host } = require('../shared/host')

const Doctor = require('../models/doctor')
const authenticate = require('../shared/authenticate')

const doctorRouter = express.Router()
doctorRouter.use(bodyParser.json())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/../public/licenses')
    },
    filename: (req, file, cb) => {
        let filename = req.user.userId + file.originalname.substring(file.originalname.lastIndexOf('.'))
        cb(null, filename)
    }
})

const pdfFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.pdf$/)) {
        return cb(new Error('You can upload only PDF files!'), false)
    }
    cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: pdfFileFilter, limits: { fileSize: 1 * 1024 * 1024 } })

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

doctorRouter.post('/license', authenticate.verifyUser, authenticate.verifyDoctor, upload.single('license'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        Doctor.findByIdAndUpdate(req.user.userId, { license: host + '/licenses/' + req.file['filename'] })
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