const dotenv= require('dotenv')
const path = require('path')
const Joi = require('joi')

dotenv.config({path: path.join(__dirname, '../../.env')})


const envVarsSchema = Joi.object().keys({
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_YEARS: Joi.number()
            .default(30)
            .description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
            .default(30)
            .description('days after which refresh tokens expire'),
        OTP_EXPIRATION_MINUTES: Joi.number().default(10).description('minutes after which otp expires'),
      
    BASE_URL: Joi.string().required().description('Base url'),
}).unknown()


const { value: envVars, error } = envVarsSchema.prefs({errors:{label:'key'}}).validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
        port: envVars.PORT,
        mongoose: {
            url: envVars.MONGODB_URL,
            options: {
                // useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        },
        jwt: {
            secret: envVars.JWT_SECRET,
            accessExpirationYear: envVars.JWT_ACCESS_EXPIRATION_YEARS,
            refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
            otpExpirationMinutes: envVars.OTP_EXPIRATION_MINUTES,
        },
        base_url: envVars.BASE_URL,
        front_url : envVars.FRONT_URL,



}
