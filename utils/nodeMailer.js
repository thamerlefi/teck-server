const nodemailer = require('nodemailer')

exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'themerlefi@gmail.com',
      pass: process.env.NODEMAILER_SEKRET
    }
  });