const express = require('express')
const bodyParser = require('body-parser')
const bcrpyt = require('bcryptjs')
const multer = require('multer')
const { host } = require('../shared/host')

const Doctor = require('../models/doctor')
const Admin = require('../models/admin')
const sendEmail = require('../shared/email').sendEmail

const doctorRouter = express.Router()
doctorRouter.use(bodyParser.json())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname+'/../public/licenses')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const pdfFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.pdf$/)) {
        return cb(new Error('You can upload only PDF files!'), false)
    }
    cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: pdfFileFilter, limits: { fileSize: 5*1000000 } })

doctorRouter.get('/', (req, res, next) => {
    Doctor.find({})
      .then((doctors) => {
          res.status(200).send(doctors)
      }, (err) => next(err))
      .catch((err) => next(err))
})

doctorRouter.post('/signup', (req, res, next) => {
    Doctor.findOne({ username: req.body.username })
      .then(async (doctor) => {
        if(doctor){
          if(doctor.activated || doctor.email !== req.body.email)
            res.status(200).send("Username already exists!")
          else {
            const salt = await bcrpyt.genSalt()
            const hashedPassword = await bcrpyt.hash(req.body.password, salt)
            var otp = ""
            for(var i=1;i<=6;i++) 
              otp += Math.floor(Math.random() * 10)
            const hashedOtp = await bcrpyt.hash(otp, 10)
            doctor.otp = hashedOtp
            doctor.password = hashedPassword
            doctor.save()
              .then((doctor) => {
                Doctor.findById(doctor._id)
                  .then((doctor) => {
                      sendEmail(doctor.email, 'MedBuddy Account Activation', 'Your OTP for account activation is ' + otp)
                      res.status(200).send(doctor)
                  })
              }, (err) => next(err))
          }
        }
        else {
          Doctor.findOne({ email: req.body.email })
            .then(async (doctor) => {
                if(doctor){
                  if(doctor.activated)
                    res.status(200).send("Email already registered!")
                  else {
                    const salt = await bcrpyt.genSalt()
                    const hashedPassword = await bcrpyt.hash(req.body.password, salt)
                    var otp = ""
                    for(var i=1;i<=6;i++) 
                      otp += Math.floor(Math.random() * 10)
                    const hashedOtp = await bcrpyt.hash(otp, 10)
                    doctor.otp = hashedOtp
                    doctor.username = req.body.username
                    doctor.password = hashedPassword
                    doctor.save()
                      .then((doctor) => {
                        Doctor.findById(doctor._id)
                          .then((doctor) => {
                              sendEmail(req.body.email, 'MedBuddy Account Activation', 'Your OTP for account activation is ' + otp)
                              res.status(200).send(doctor)
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
                  doctor = { 
                      username: req.body.username,
                      password: hashedPassword,
                      email: req.body.email,
                      otp: hashedOtp,
                      activated: false,
                      verified: false
                  }
                  Doctor.create(doctor)
                   .then((doctor) => {
                     Doctor.findById(doctor._id)
                       .then((doctor) => {
                          sendEmail(req.body.email, 'MedBuddy Account Activation', 'Your OTP for account activation is ' + otp)
                          res.status(200).send(doctor)
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

doctorRouter.post('/login', (req, res, next) => {
    Doctor.findOne({ username: req.body.userId })
      .then(async (doctor) => {
          if(doctor){
            if(!doctor.activated)
              res.status(200).send({resCode: -1, msg: 'Invalid User'})
            else if(await bcrpyt.compare(req.body.password, doctor.password))
              res.status(200).send({resCode: 1, msg: 'Logged in', userId: doctor._id, username: doctor.username})
            else
              res.status(200).send({resCode: 0, msg: 'Invalid Password'})
          }
          else{
            Doctor.findOne({ email: req.body.userId })
              .then(async (doctor) => {
                if(doctor){
                  if(!doctor.activated)
                    res.status(200).send({resCode: -1, msg: 'Invalid User'})
                  else if(await bcrpyt.compare(req.body.password, doctor.password))
                    res.status(200).send({resCode: 1, msg: 'Logged in', userId: doctor._id, username: doctor.username})
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

doctorRouter.post('/otp', (req, res, next) => {
	Doctor.findOne({ _id: req.body.userId })
	  .then(async (doctor) => {
		  if(await bcrpyt.compare(req.body.otp, doctor.otp)){
			  doctor.activated = true
			  doctor.otp = null
			  doctor.save()
			   .then((doctor) => {
				   res.status(200).send("User account activated!")
			   }, (err) => next(err))
			   .catch((err) => next(err))
		  }
		  else
		    res.status(200).send("Invalid OTP")
	  }, (err) => next(err))
    .catch((err) => next(err))
})

doctorRouter.post('/license', upload.single('license'), (req, res, next) => {
    if(req.file){
        console.log('File received!')
        Doctor.findByIdAndUpdate(req.body.userId, { license: host + '/licenses/' + req.file['filename'] })
            .then((profile) => {
              res.status(200).send(profile)
            }, (err) => next(err))
            .catch((err) => next(err))
    }
    else{
        console.log('No File received!')
        res.status(200).send('Nothing!')
    }
})

doctorRouter.delete('/deleteAccount', (req, res, next) => {
    Doctor.findByIdAndDelete(req.body.userId)
      .then((doctor) => {
          res.status(200).send(doctor)
      }, (err) => next(err))
      .catch((err) => next(err))
})

doctorRouter.post('/unverified', (req, res, next) => {
    Admin.findById(req.body.userId)
        .then((admin) => {
            if(admin){
                Doctor.find({ verified: false })
                    .then((doctors) => {
                        res.status(200).send(doctors)
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }
            else{
                res.status(401).send('Not an Admin!')
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})

module.exports = doctorRouter