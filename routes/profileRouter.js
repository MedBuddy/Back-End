const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const { host } = require('../shared/host')

const profileRouter = express.Router()
profileRouter.use(bodyParser.json())

const User = require('../models/users')
const Doctor = require('../models/doctor')

const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname+'/../public/images/users')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
const doctorStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname+'/../public/images/doctors')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|PNG)$/)) {
        return cb(new Error('You can upload only image files!'), false)
    }
    cb(null, true)
}

const userUpload = multer({ storage: userStorage, fileFilter: imageFileFilter })
const doctorUpload = multer({ storage: doctorStorage, fileFilter: imageFileFilter })

profileRouter.route('/details')
.get((req, res, next) => {
    let profile
    if(req.body.type === 'user')
        profile = User
    else if(req.body.type === 'doctor')
        profile = Doctor
    profile.findById(req.body.userId)
        .then((profile) => {
            res.status(200).send(profile)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.put((req, res, next) => {
    let updates = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        gender: req.body.gender,
        dob: req.body.dob,
        mobile: req.body.mobile,
        bloodgroup: req.body.bloodgroup
    }
    let profile
    if(req.body.type === 'user'){
        profile = User
    }
    else if(req.body.type === 'doctor'){
        profile = Doctor
        updates.specialization = req.body.specialization
    }
    profile.findByIdAndUpdate(req.body.userId, updates)
        .then((profile) => {
            res.status(200).send(profile)
        }, (err) => next(err))
        .catch((err) => next(err))
})

profileRouter.put('/imageUpload/user', userUpload.single('image'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        User.findByIdAndUpdate(req.body.userId, { image: host + '/images/users/' + req.file['filename'] })
            .then((profile) => {
                res.status(200).send(profile)
            }, (err) => next(err))
            .catch((err) => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})

profileRouter.put('/imageUpload/doctor', doctorUpload.single('image'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        Doctor.findByIdAndUpdate(req.body.userId, { image: host + '/images/users/' + req.file['filename'] })
            .then((profile) => {
                res.status(200).send(profile)
            }, (err) => next(err))
            .catch((err) => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})

module.exports = profileRouter