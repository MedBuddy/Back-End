const express = require('express')
const bodyParser = require('body-parser')

const User = require('../models/user')
const Doctor = require('../models/doctor')
const Admin = require('../models/admin')
const Image = require('../models/image')

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
        .populate('image')
        .then((profile) => {
            res.status(200).send(profile)
        }, (err) => next(err))
        .catch((err) => next(err))
})
.post((req, res, next) => {
    res.status(405).send('POST operation not supported')
})
.put(authenticate.verifyUser, (req, res, next) => {
    let Profile
    if(req.user.type == 1) Profile = User
    else if(req.user.type == 2) Profile = Doctor
    else return res.sendStatus(403)
    Profile.findByIdAndUpdate(req.user.userId, req.body)
        .then((profile) => {
            Profile.findById(profile._id)
                .populate('image')
                .then((profile) => {
                    res.status(200).send(profile)
                }, (err) => next(err))
                .catch((err) => next(err))
        }, (err) => next(err))
        .catch((err) => next(err))
})
.delete((req, res, next) => {
    res.status(405).send('DELETE operation not supported')
})

profileRouter.post('/imageUpload', authenticate.verifyUser, fileUpload.uploadImage.single('image'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        let Profile
        if(req.user.type == 1) Profile = User
        else if(req.user.type == 2) Profile = Doctor
        else if(req.user.type == 3) Profile = Admin
        else return res.sendStatus(403)
        Profile.findById(req.user.userId)
            .then((profile) => {
                Image.findByIdAndUpdate(profile.image, { url: host + fileUpload.getFilePath(req.file.path) })
                    .then(image => {
                        Image.findById(image._id)
                            .then(image => res.status(200).send(image),
                                    err => next(err))
                            .catch(err => next(err))
                    })
            }, (err) => next(err))
            .catch((err) => next(err))
    }
    else {
        console.log('No file received!')
        res.status(200).send('Nothing')
    }
})

module.exports = profileRouter