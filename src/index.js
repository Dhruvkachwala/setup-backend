const app = require('./app')
const logger = require('./config/logger')

const config = require('./config/config')
const connectDB = require('./db/dbConnection')
let server

connectDB()

server = app.listen(3001, () => {
    logger.info(`Listening to port ${config.port}`)

}
)


const exitHandler =()=>{
    if(server){
        server.close(()=>{
        logger.info('Server closed')
            process.exit(1)

        })
    }
    else{ 
        process.exit(1)
    }
}

const unexpectedErrorHandler = (error) => {     
logger.error(error)
    exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)


process.on('SIGTERM', () => {
    logger.info('SIGTERM received')
    if (server) {
        server.close()
    }
})