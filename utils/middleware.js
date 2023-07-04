const logger = require('./logger')

// middleware for logging requests
const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method)
    logger.info('Path: ', request.path)
    logger.info('Body: ', request.body)
    logger.info('----')
    next()
}

const unknownEndpoint = (request, response, next) => {
    response.status(404).send({
        error: 'unknown endpoint'
    })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if(error.name === 'CastError')
        return response.status(400).send({error: 'malformatted id'})

    if(error.name === 'ValidationError')
        return response.status(400).send({error: error.message})

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    console.log(authorization)
    if(authorization && authorization.startsWith('bearer '))
        request.token = authorization.replace('bearer ', '')
    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor
}
