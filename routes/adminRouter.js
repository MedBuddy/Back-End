const express = require('express')
const bodyParser = require('body-parser')
const bcrpyt = require('bcryptjs')

const adminRouter = express.Router()
adminRouter.use(bodyParser.json())

const Admin = require('../models/admin')
const Doctor = require('../models/doctor')

adminRouter.get('/', (req, res, next) => {
    Admin.find({})
      .then((admins) => {
          res.status(200).send(admins)
      }, (err) => next(err))
      .catch((err) => next(err))
})

adminRouter.post('/login', (req, res, next) => {
    Admin.findOne({ username: req.body.userId })
      .then(async (admin) => {
          if(admin){
            if(await bcrpyt.compare(req.body.password, admin.password))
              res.status(200).send({resCode: 1, msg: 'Logged in', userId: admin._id, username: admin.username})
            else
              res.status(200).send({resCode: 0, msg: 'Invalid Password'})
          }
          else{
            Admin.findOne({ email: req.body.userId })
              .then(async (admin) => {
                if(admin){
                  if(await bcrpyt.compare(req.body.password, admin.password))
                    res.status(200).send({resCode: 1, msg: 'Logged in', userId: admin._id, username: admin.username})
                  else
                    res.status(200).send({resCode: 0, msg: 'Invalid Password'})
                }
                else
                  res.status(200).send({resCode: -1, msg: 'Invalid User'})
              }, (err) => next(err))
              .catch((err) => next(err))
          }
      }, (err) => next(err))
      .catch((err) => next(err))
})

adminRouter.post('/signup', (req, res, next) => {
    Admin.findOne({ username: req.body.username })
      .then((admin) => {
        if(admin){
            res.status(200).send("Username already exists!")
        }
        else {
          Admin.findOne({ email: req.body.email })
            .then(async (admin) => {
                if(admin){
                    res.status(200).send("Email already registered!")
                }
                else{
                  const salt = await bcrpyt.genSalt()
                  const hashedPassword = await bcrpyt.hash(req.body.password, salt)
                  admin = { 
                      username: req.body.username,
                      password: hashedPassword,
                      email: req.body.email
                  }
                  Admin.create(admin)
                   .then((admin) => {
                     Admin.findById(admin._id)
                       .then((admin) => {
                          res.status(200).send(admin)
                        }) 
                        .catch((err) => next(err))
                    }, (err) => next(err))
                   .catch((err) => next(err))
                }
            }, (err) => next(err))
          .catch((err) => next(err))
        }
      }, (err) => next(err))
      .catch((err) => next(err))
})

adminRouter.put('/verifyDoctor', (req, res, next) => {
    Admin.findById(req.body.userId)
        .then((admin) => {
            if(admin){
                Doctor.findByIdAndUpdate(req.body.doctorId, { verified: true })
                    .then((doctor) => {
                        res.status(200).send(doctor)
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }
            else{
                res.status(401).send('Not an Admin!')
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})

module.exports = adminRouter