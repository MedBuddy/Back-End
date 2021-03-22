const nodemailer = require('nodemailer')
const { email, password } = require('./credentials')

function sendEmail(receiver, otp){
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: email,
		  pass: password
		}
	})
	const mailOptions = {
		from: email,
		to: receiver,
		subject: 'MedBuddy Account Activation',
		text: 'Your OTP for account activation is ' + otp
	}
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) 
		  console.log('Error: ' + error)
		else
		  console.log('Email Sent: ' + info.response)
	})
}

module.exports = { sendEmail }