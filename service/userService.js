const db = require('../shared/helper.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const services = {
  // if new user register
  async register (req, res) {
    try {
      // find whether any other user exists with the same email id or not
      const user = await db.data.findOne({ email: req.body.email })
      if (user) {
        return res.send({ message: 'User Already exists' })
      } else {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
        await db.data.insertOne(req.body)
        return res.send({ message: 'Registered Successfully' })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send('Something went wrong')
    }
  },

  // checking -> Log in

  async login (req, res) {
    try {
      // check email
      const user = await db.data.findOne({ email: req.body.email })
      if (!user) {
        return res.send({ message: 'Enter valid Email-id' })
      } else {
        // check Password
        const isValid = await bcrypt.compare(req.body.password, user.password)
        if (isValid) {
          const Token = jwt.sign({ user_id: user._id, email: user.email }, 'admin123', { expiresIn: '24h' })
          console.log(Token)
          return res.send({ Token, message: 'Logged in Successfully', name: user.name })
        } else {
          res.send({ message: 'Entered password is wrong' })
        }
      }
    } catch (err) {
      console.log(err)
      res.status(500).send('Something went wrong try again')
    }
  }
}

module.exports = services
