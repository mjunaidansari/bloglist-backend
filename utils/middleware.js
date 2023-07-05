const User = require('../models/user')
const logger = require('./logger')
const jwt = require('jsonwebtoken')

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
    if(authorization && authorization.startsWith('Bearer '))
        request.token = authorization.replace('Bearer ', '')
    next()
}

const userExtractor = async (request, response, next) => {
    if(request.token){
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        request.user = await User.findById(decodedToken.id)
        // request.user = user.toJSON()
    }
    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}
