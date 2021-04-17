const express = require('express')
const bodyParser = require('body-parser')
const bcrpyt = require('bcryptjs')

const User = require('../models/user')
const Doctor = require('../models/doctor')
const Admin = require('../models/admin')

const sendEmail = require('../shared/email').sendEmail
const authenticate = require('../shared/authenticate')

const accountRouter = express.Router()
accountRouter.use(bodyParser.json())

accountRouter.post('/login', (req, res, next) => {
    let Account
    if(req.body.type == 1) Account = User
    else if(req.body.type == 2) Account = Doctor
    else if(req.body.type == 3) Account = Admin
    else return res.sendStatus(403)
    Account.findOne({ username: req.body.userId })
      .then(async (account) => {
          if(account){
            if(!account.activated)
              res.status(200).send({resCode: -1, msg: 'Invalid User'})
            else if(await bcrpyt.compare(req.body.password, account.password)){
               const token = authenticate.getToken({ userId: account._id, type: req.body.type })
               res.status(200).send({resCode: 1, msg: 'Logged in', token: token})
            }
            else
              res.status(200).send({resCode: 0, msg: 'Invalid Password'})
          }
          else{
            Account.findOne({ email: req.body.userId })
              .then(async (account) => {
                if(account){
                  if(!account.activated)
                    res.status(200).send({resCode: -1, msg: 'Invalid User'})
                  else if(await bcrpyt.compare(req.body.password, account.password)){
                      const token = authenticate.getToken({ userId: account._id, type: req.body.type })
                      res.status(200).send({resCode: 1, msg: 'Logged in', token: token})
                  }
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

accountRouter.post('/signup', (req, res, next) => {
    let Account
    if(req.body.type == 1) Account = User
    else if(req.body.type == 2) Account = Doctor
    else return res.sendStatus(403)
    Account.findOne({ username: req.body.username })
      .then(async (account) => {
        if(account){
          if(account.activated)
            res.status(200).send("Username already exists!")
          else {
            const salt = await bcrpyt.genSalt()
            const hashedPassword = await bcrpyt.hash(req.body.password, salt)
            var otp = ""
            for(var i=1;i<=6;i++) 
              otp += Math.floor(Math.random() * 10)
            const hashedOtp = await bcrpyt.hash(otp, 10)
            account.otp = hashedOtp
            account.password = hashedPassword
            account.email = req.body.email
            account.save()
              .then((account) => {
                User.findById(account._id)
                  .then((account) => {
                      sendEmail(account.email, 'MedBuddy Account Activation', 'Your OTP for account activation is ' + otp)
                      res.status(200).send(account)
                  })
              }, (err) => next(err))
          }
        }
        else {
          Account.findOne({ email: req.body.email })
            .then(async (account) => {
                if(account){
                  if(account.activated)
                    res.status(200).send("Email already registered!")
                  else {
                    const salt = await bcrpyt.genSalt()
                    const hashedPassword = await bcrpyt.hash(req.body.password, salt)
                    var otp = ""
                    for(var i=1;i<=6;i++) 
                      otp += Math.floor(Math.random() * 10)
                    const hashedOtp = await bcrpyt.hash(otp, 10)
                    account.otp = hashedOtp
                    account.username = req.body.username
                    account.password = hashedPassword
                    account.save()
                      .then((account) => {
                        User.findById(account._id)
                          .then((account) => {
                              sendEmail(req.body.email, 'MedBuddy Account Activation', 'Your OTP for account activation is ' + otp)
                              res.status(200).send(account)
                          }); 
                      }, (err) => next(err))
                  }
                }
                else{
                  const salt = await bcrpyt.genSalt()
                  const hashedPassword = await bcrpyt.hash(req.body.password, salt)
                  var otp = ""
                  for(var i=1;i<=6;i++) 
                    otp += Math.floor(Math.random() * 10)
                  const hashedOtp = await bcrpyt.hash(otp, 10)
                  account = { 
                      username: req.body.username,
                      password: hashedPassword,
                      email: req.body.email,
                      otp: hashedOtp,
                      activated: false
                  }
                  if(req.body.type == 2)
                    account.verified = false
                  Account.create(account)
                   .then((account) => {
                     User.findById(account._id)
                       .then((account) => {
                          sendEmail(req.body.email, 'MedBuddy Account Activation', 'Your OTP for account activation is ' + otp)
                          res.status(200).send(account)
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

accountRouter.post('/otp', (req, res, next) => {
    let Account
    if(req.body.type == 1) Account = User
    else if(req.body.type == 2) Account = Doctor
    else return res.sendStatus(403)
    Account.findOne({ _id: req.body.userId })
      .then(async (account) => {
        if(await bcrpyt.compare(req.body.otp, account.otp)){
          account.activated = true
          account.otp = null
          account.save()
          .then((account) => {
            res.status(200).send("User account activated!")
          }, (err) => next(err))
          .catch((err) => next(err))
        }
        else
          res.status(200).send("Invalid OTP")
      }, (err) => next(err))
      .catch((err) => next(err))
})

accountRouter.delete('/deleteAccount', authenticate.verifyUser, (req, res, next) => {
    let Account
    if(req.user.type == 1) Account = User
    else if(req.user.type == 2) Account = Doctor
    else return res.sendStatus(403)
    Account.findByIdAndDelete(req.user.userId)
      .then((account) => {
          res.status(200).send(account)
      }, (err) => next(err))
      .catch((err) => next(err))
})

module.exports = accountRouter