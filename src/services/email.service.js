const config = require('../config/config');
const logger = require('../config/logger');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const { FILES_FOLDER } = require('../helper/constant.helper');
const transport = nodemailer.createTransport(config.email.smtp);

transport
    .verify()
    .then(() => logger.info('📧 Connected to email server 📧'))
    .catch(() =>
        logger.warn(
            'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
        )
    );

/**
 * Send mail.
 * @param {String} to
 * @param {String} subject
 * @param {Object} data
 * @returns {Boolean}
 */
exports.sendEmail = async (to, subject, data) => {
    return await transport
        .sendMail({
            from: config.email.smtp.auth.user,
            to,
            subject,
            html: data,
        })
        .then(() => true)
        .catch(() => false);
};

/**
 * Send verify mail to user.
 * @param {Object} mailData
 * @returns {Boolean}
 */
exports.sendVerifyEmail = async (mailData) => {
    return await new Promise((resolve, reject) => {
        ejs.renderFile(
            './views/otpEmailTemplate.ejs',
            {
                email: mailData.email,
                firstName: mailData.firstName,
                lastName: mailData.lastName,
                otp: mailData.otp,
                imageUrl: `${process.env.BASE_URL}${FILES_FOLDER.default}/logo.jpeg`,
            },
            async (err, data) => (err ? reject(err) : resolve(data))
        );
    }) // Render the otpEmailTemplate of ejs.
        .then(async (data) => {
            const mailSend = await this.sendEmail(mailData.email, mailData.subject, data); // Send mail on requested email by users.

            return !mailSend ? false : true;
        })
        .catch(async () => false);
};
