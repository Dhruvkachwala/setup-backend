const dotenv= require('dotenv')
const path = require('path')
const Joi = require('joi')

dotenv.config({path: path.join(__dirname, '../../.env')})


const envVarsSchema = Joi.object().keys({
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    BASE_URL: Joi.string().required().description('Base url'),
}).unknown()


const { value: envVars, error } = envVarsSchema.prefs({errors:{label:'key'}}).validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
        port: envVars.PORT,
        mongoose:{
            url: envVars.MONGODB_URL,
            options:{
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
            },
        },
        jwt:{
            secret: envVars.JWT_SECRET,
        },
        base_url: envVars.BASE_URL,
        front_url : envVars.FRONT_URL,



}
