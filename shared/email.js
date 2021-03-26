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
		text: msg
	}
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) 
		  console.log('Error: ' + error)
		else
		  console.log('Email Sent: ' + info.response)
	})
}

module.exports = { sendEmail }