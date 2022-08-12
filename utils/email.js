const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  // defind the email options
  const mailOptions = {
    from: 'lntr.tin trongtin@gmail.com',
    to: options.to,
    subject: options.subject,
    text: options.text
    // html: options.html
  };
  // actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
