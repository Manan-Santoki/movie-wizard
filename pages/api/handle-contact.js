import * as dotenv from 'dotenv';
//require('dotenv').config();
  dotenv.config();


export default async function (req, res) {
  const nodemailer = require('nodemailer');
  const PASSWORD = process.env.EMAIL_PW;
  const USER = process.env.EMAIL_USER;
  const EMAIL_TO = process.env.EMAIL_TO;
  const EMAIL_HOST = process.env.EMAIL_HOST;

  const transporter = nodemailer.createTransport({
    port: 465,
    host: EMAIL_HOST,
    auth: {
      user: USER,
      pass: PASSWORD,
    },
    secure: true,
    tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
  debug: true, // show debug output
  logger: true // log information in console
  });

/*
  await new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
    });
});
  */
  
  const mailData = {
    from: USER,
    to: EMAIL_TO,
    subject: `Movie-Wizard Contact-Form Message From ${req.body.name}`,
    text: req.body.message + " | Sent from: " + req.body.email,
    html: `<div>${req.body.message}</div><p>Sent from:
    ${req.body.email}</p>`,
  }

  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailData, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });

  res.status(200).json({ status: "OK" });
};