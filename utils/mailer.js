const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');


exports.sendEmail = (email, firstName, subject, message) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth:{
            user: "alagha911@gmail.com",
            pass: "ILLIAnov84"
        }
    });
    transporter.sendMail({
        from: "alagha911@gmail.com",
        to: email,
        subject: subject,
        html: `<h4> HI ${firstName}</h4>
                <p>${message}</p>`,
    })
}