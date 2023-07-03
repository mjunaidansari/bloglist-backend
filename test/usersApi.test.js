const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')

const User = require('../models/user')
const helper = require('./apiTestHelper')

const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({
        username: 'root',
        passwordHash
    })
    await user.save()
})

describe('when there is initially one note in db', () => {
    
    test('creation succeeds with a fresh username', async () => {
        usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'junaid',
            name: 'Junaid Ansari',
            password: 'hehe'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toEqual(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username is already taken', async () => {
        usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Super User',
            password: 'hehe'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expect `username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toEqual(usersAtStart.length)
    })

})