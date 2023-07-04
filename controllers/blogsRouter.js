const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')

const logger = require('../utils/logger')

// getting all the blogs 
blogsRouter.get('/', async (request, response, next) => {
    // Blog
    //     .find({})
    //     .then(blogs => {
    //         response.json(blogs)
    //     })

    const blogs = await Blog
                    .find({})
                    .populate('user', {
                        username: 1,
                        name: 1,
                        id: 1
                    })
    response.json(blogs)

})

// getting sepecified blog
blogsRouter.get('/:id', async (request, response, next) => {
    // Blog
    //     .findById(request.params.id)
    //     .then(blog => {
    //         if (blog)
    //             response.json(blog)
    //         else 
    //             response.status(404).end()
    //     })
    //     .catch(error => next(error))

    const blog = await Blog.findById(request.params.id)
    if(blog)
        response.json(blog)
    else
        response.status(404).end()
})

// creating a blog

// isolates token from authorization header
// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     console.log(authorization)
//     if(authorization && authorization.startsWith('bearer '))
//         return authorization.replace('bearer ', '')
//     return null
// }

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body

    // const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if(!decodedToken)
        return response
            .status(401)
            .json({
                error: 'invalid token!'
            })

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })

    // blog
    //     .save()
    //     .then(savedBlog => {
    //         response.json(savedBlog)
    //     })
    //     .catch(error => next(error))

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) =>  {
    const id = request.params.id
    
    // Blog
    //     .findByIdAndRemove(id)
    //     .then(result => {
    //         console.log('deleted')
    //         response.status(204).end()
    //     })
    //     .catch(error => next(error))

    await Blog.findByIdAndRemove(id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    // Blog
    //     .findByIdAndUpdate(request.params.id, blog, {runValidators: true, new: true, context: query})
    //     .then(updatedBlog => {
    //         response.json(updatedBlog)
    //     })
    //     .catch(error => next(error))

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {runValidators: true, new: true, context: query})
    response.json(updatedBlog)
})

module.exports = blogsRouter