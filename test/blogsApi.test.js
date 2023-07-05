const mongoose = require('mongoose')
mongoose.set("bufferTimeoutMS", 300000)
const supertest = require('supertest')

const helper = require('./apiTestHelper')

// import the application
const app = require('../app')

// wrap it with supertest function to create a superagent object
const api = supertest(app)

// MongoDb model for db interaction
const Blog = require('../models/blog')

let token = null


beforeAll(async () => {

    await Blog.deleteMany({})

    const user = {
        username: 'junaid',
        password: 'hehe'
    }

    const response = await api
                        .post('/api/login')
                        .send(user)
    token = response._body.token
})
// executed before execution of each test
/* beforeEach( async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map (
        blog => new Blog(blog)
    )
    
    // array of promises that will be executed as a single promise
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
    console.log(response)
}) */

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
}, 100000)

test('unique identifier property is named id', async () => {
    const blogs = await helper.blogsInDb()
    blogs.forEach(blog => expect(blog.id).toBeDefined())
})

test('a valid blog is added successfully', async () => {
    
    const blogsAtStart = await helper.blogsInDb()
    
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({authorization: `Bearer ${token}`})
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toEqual(blogsAtStart.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(newBlog.title)
})

test('blog without token fails with proper status code 401', async () => {
    
    const blogsAtStart = await helper.blogsInDb()
    
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toEqual(blogsAtStart.length)
})

test('if the likes property is missing from the request, it defaults to 0', async () => {

    const blogsAtStart = await helper.blogsInDb()

    const newBlog = {
        title: "Hehe wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({authorization: `Bearer ${token}`})
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toEqual(blogsAtStart.length + 1)

    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toEqual(0)
})

test('blog without title or url is not added in db', async () => {
    const newBlog = {
        title: "Hehe wars",
        author: "Robert C. Martin",
        likes: 123
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({authorization: `Bearer ${token}`})
        .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toEqual(helper.initialBlogs.length)
})

afterAll( async () => {
    await mongoose.connection.close()
})