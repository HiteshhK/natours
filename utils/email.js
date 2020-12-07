const nodemailer = require('nodemailer');

const sendEmail = async options=>{
//  a) create transporter
// console.log({
//     host:process.env.EMAIL_HOST,
//     post:process.env.EMAIL_PORT,
//     user:process.env.EMAIL_USERNAME,
//     password:process.env.EMAIL_PASSWORD})
// const transporter = nodemailer.createTransport({
//     host:process.env.EMAIL_HOST,
//     port:process.env.EMAIL_PORT,
//     auth:{
//         user:process.env.EMAIL_USERNAME,
//         password:process.env.EMAIL_PASSWORD
//     }
// });
var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "482446b03121ce",
      pass: "13e8837ae7db52"
    }
  });
//  b) Define the email options
const mailOptions={
    from:'Hitesh Kaushik <new@hite.io>',
    to:options.email,
    subject:options.subject,
    text:options.message
    //html
}
//  c)Actually send the email
 await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;