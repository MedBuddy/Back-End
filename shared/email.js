const nodemailer = require('nodemailer')
const { email, password } = require('./credentials')

function sendEmail(receiver, subject, msg){
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
		subject: subject,
		html: msg
	}
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) 
		  console.log('Error: ' + error)
		else
		  console.log('Email Sent: ' + info.response)
	})
}

function getOTPMsg(username, otp){
	msg = `<div>
			   <h1>Hi ${username}!</h1>
			   <p>Thank you for registering in MedBuddy.</p>
			   <p>Your OTP:</p>
			   <h2>${otp}</h2>
			   <p><i>Thanks & Regards,</i></p>
			   <h3><i><b>MedBuddy Team</b></i></h3>
		   </div>`
	return msg
}

module.exports = { sendEmail, getOTPMsg }