const express = require('express')
const bodyParser = require('body-parser')
const bcrpyt = require('bcryptjs')

const adminRouter = express.Router()
adminRouter.use(bodyParser.json())

const Admin = require('../models/admin')
const Doctor = require('../models/doctor')
const Image = require('../models/image')

const sendEmail = require('../shared/email').sendEmail
const authenticate = require('../shared/authenticate')

adminRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Admin.find({})
	.populate('image')
	.then((admins) => {
		res.status(200).send(admins)
	}, (err) => next(err))
	.catch((err) => next(err))
})

adminRouter.post('/signup', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
				Image.create({ username: req.body.username })
					.then(image => {
						Image.findById(image._id)
						.then(image => {
							admin = { 
								username: req.body.username,
								password: hashedPassword,
								email: req.body.email,
								image: image._id
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
						}, err => next(err))
						.catch(err => next(err))
					})
				}
			}, (err) => next(err))
		.catch((err) => next(err))
		}
	}, (err) => next(err))
	.catch((err) => next(err))
})

adminRouter.put('/acceptDoctor', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Doctor.findByIdAndUpdate(req.body.doctorId, { 
		verified: true, 
		specialization: req.body.specialization 
	})
	.then((doctor) => {
		let msg = `	<div>
						<h1>Hi ${doctor.username}!</h1>
						<p>Your Doctor\'s license has been successfully verified!<p>
						<p>You can now use your Doctor\'s account</p>
						<br>
						<p><i>Thanks & Regards,</i></p>
						<h3><i><b>MedBuddy Team</b></i></h3>
					</div>`
		sendEmail(doctor.email, 'MedBuddy License Verification', msg)
		Doctor.findById(doctor._id)
			.then((doctor) => {
				res.status(200).send(doctor)
			}, (err) => next(err))
			.catch((err) => next(err))
	}, (err) => next(err))
	.catch((err) => next(err))
})

adminRouter.put('/rejectDoctor', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Doctor.findByIdAndRemove(req.body.doctorId)
	.then((doctor) => {
		let msg = `	<div>
						<h1>Hi ${doctor.username},</h1>
						<p>Your doctor\'s license has been rejected!<p> 
						<p><b>Reason: </b>${req.body.reason}</p>
					</div>`
		sendEmail(doctor.email, 'MedBuddy License Rejection', msg)
		res.status(200).send(doctor)
	}, (err) => next(err))
	.catch((err) => next(err))
})

module.exports = adminRouter