const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const { host } = require('../shared/host')

const profileRouter = express.Router()
profileRouter.use(bodyParser.json())

const User = require('../models/user')
const Doctor = require('../models/doctor')
const authenticate = require('../shared/authenticate')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = (req.user.type == 1? 'users' : 'doctors')
        cb(null, __dirname + '/../public/images/' + folder)
    },
    filename: (req, file, cb) => {
        let filename = req.user.userId + file.originalname.substring(file.originalname.lastIndexOf('.'))
        cb(null, filename)
    }
})

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|PNG)$/)) {
        return cb(new Error('You can upload only image files!'), false)
    }
    cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: imageFileFilter })

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

profileRouter.post('/imageUpload', authenticate.verifyUser, upload.single('image'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        let Profile
        if(req.user.type == 1) Profile = User
        else if(req.user.type == 2) Profile = Doctor
        else return res.sendStatus(403)
        Profile.findByIdAndUpdate(req.user.userId, { 
                image: `${host}/images/${(req.user.type == 1? 'users':'doctors')}/${req.file['filename']}` 
            })
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