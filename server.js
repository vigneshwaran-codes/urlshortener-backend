const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const userRouter = require('./routes/user.js')
const service = require('./service/resetService.js')
const db = require('./shared/helper.js')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT

async function Connection () {
  // connecting -> db
  await db.connect()

  // Middleware
  app.use(cors())
  app.use(express.json())

  app.use('/user', userRouter)

  // List all urls
  app.get('/urls', async (req, res) => {
    const allUrls = await db.url.find().toArray()
    res.send(allUrls)
  })

  // reset-password
  app.post('/reset-password', service.resets)

  // set new-password
  app.post('/new-password', service.newPassword)

  // calling with Login Tokens
  app.use((req, res, next) => {
    const token = req.headers['auth-token']
    if (token) {
      try {
        req.user = jwt.verify(token, 'admin123')
        console.log(req.user)
        next()
      } catch (err) {
        console.error(err)
        res.sendStatus(500)
      }
    } else {
      res.sendStatus(401)
    }
  })
  // generating new url

  app.post('/create-url', service.createUrl)

  // redirecting from short url -> Long url
  app.get('/redirect/:id', service.redirect)

  app.get('/', (req, res) => {
    res.send('Welcome Url Shortener App')
  })

  // Listen Port
  app.listen(PORT, () => console.log('the server is connected Successfully', PORT))
}

Connection()
