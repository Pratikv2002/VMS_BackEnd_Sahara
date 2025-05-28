import { createTransport } from "nodemailer";
import fs from 'fs';

let mailTransporter = createTransport({
    host: "smtp.gmail.com",
    auth: {
        pass: 'ikjxvsyqgquiihov',
        user: 'jaggy434@gmail.com'
    },
    port: 587,
    secure: false,
});


const sendEmail = async (toEmail, id, visitor_image,visitorName,token) => {
    try {
        const html = `
        <!DOCTYPE >
        <html>
        <head>
            <title>Gate Access Request</title>
            <style>
            p {
                font-family: Arial, sans-serif;
                font-size: 16px;
            }
            a {
                background-color: #060cc1;
                border: 0;
                border-radius: 4px;
                color: white;
                text-align: center;
                display: inline-block;
                font-family: Arial, sans-serif;
                font-size: 16px;
                text-decoration: none;
                padding: 8px 25px;
                color: #FFFFFF;
            }
            .bold {
                font-weight: 600;
            }
            </style>
        </head>
        <body>
            <p class="bold">Greetings,</p>
            <p>
            ${visitorName} has requested gate access to meet you. Click on the button
            below to make a decision.
            </p>
            <a href="${process.env.FRONT_APPLICATION}/approve-reject/${id}/${token}">
            Make a Decision
            </a>
            <br />
            <p>Sincerely,</p>
            <p>VMS</p>
        </body>
        </html>

        `
        const mailOptions = {
            from: {
                name: 'noreply@gmail.com',
                address: 'jaggy434@gmail.com'
            },
            to: [toEmail],
            subject: `Gate Access Request - ${visitorName}`,
            html: html,
            attachments: [{
                filename: 'image.jpeg',
                content: visitor_image,
                encoding: 'base64',
                cid: 'image1'
            }]
        }

        const info = await mailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return html;
    } catch (error) {
        console.error(error);
        return false;
    }
}

const sendEmailToVisitor = async (toEmail, name) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <style>
            p {
                font-family: Arial, sans-serif;
                font-size: 16px;
            }
            button {
                background-color: #060cc1;
                border: 0;
                border-radius: 4px;
                color: white;
                text-align: center;
                display: inline-block;
                font-family: Arial, sans-serif;
                font-size: 16px;
                text-decoration: none;
                height: 2rem;
                width: 15rem;
            }
            .bold {
                font-weight: 600;
            }
            </style>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit</title>
        </head>
        <body>
        <p class="bold">Your visit requesst is sent for approval.</p>
        <p>You ll be notified once ${name} approves your visit request.</p>
        
        <p>Sincerely,</p>
        <p>VMS</p>
        </body>
        </html>
        `
        const mailOptions = {
            from: {
                name: 'noreply@gmail.com',
                address: 'jaggy434@gmail.com'
            },
            to: [toEmail],
            subject: 'Visit enqued for approval',
            html: html
        }

        const info = await mailTransporter.sendMail(mailOptions);
        console.log('Email sent to visitor successfully:', info.messageId);
        return html;
    } catch (error) {
        console.log(error);
    }
}

const approveEmailToVisitor = async (toEmail, token) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <style>
            p {
                font-family: Arial, sans-serif;
                font-size: 16px;
            }
            a {
                background-color: #060cc1;
                border: 0;
                border-radius: 4px;
                color: white;
                text-align: center;
                display: inline-block;
                font-family: Arial, sans-serif;
                font-size: 16px;
                text-decoration: none;
                padding: 8px 25px;
                color: #FFFFFF;
            }
            .bold {
                font-weight: 600;
            }
            </style>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit</title>
        </head>
        <body>
        <p class="bold">Your visit is approved</p>
        <p class="bold">Click on link to get digital card</p>
        
        <a href="${process.env.FRONT_APPLICATION}/digital-pass/${token}">
            Digital Pass
            </a>
        <p>Sincerely,</p>
        <p>VMS</p>
        </body>
        </html>
        `
        const mailOptions = {
            from: {
                name: 'noreply@gmail.com',
                address: 'jaggy434@gmail.com'
            },
            to: [toEmail],
            subject: 'Visit approved',
            html: html
        }

        const info = await mailTransporter.sendMail(mailOptions);
        console.log('Email sent to visitor successfully:', info.messageId);
        return html;
    } catch (error) {
        console.log(error);
    }
}

const rejectEmailToVisitor = async (toEmail) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <style>
            p {
                font-family: Arial, sans-serif;
                font-size: 16px;
            }
            button {
                background-color: #060cc1;
                border: 0;
                border-radius: 4px;
                color: white;
                text-align: center;
                display: inline-block;
                font-family: Arial, sans-serif;
                font-size: 16px;
                text-decoration: none;
                height: 2rem;
                width: 15rem;
            }
            .bold {
                font-weight: 600;
            }
            </style>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit</title>
        </head>
        <body>
        <p class="bold">Sorry to let you know </p>
        <p>Your visit has been rejected.</p>

        <p>Sincerely,</p>
        <p>VMS</p>
        </body>
        </html>
        `
        const mailOptions = {
            from: {
                name: 'noreply@gmail.com',
                address: 'jaggy434@gmail.com'
            },
            to: [toEmail],
            subject: 'Visit approved',
            html: html
        }

        const info = await mailTransporter.sendMail(mailOptions);
        console.log('Email sent to visitor successfully:', info.messageId);
        return html;
    } catch (error) {
        console.log(error);
    }
}

export { sendEmail, sendEmailToVisitor, approveEmailToVisitor, rejectEmailToVisitor }