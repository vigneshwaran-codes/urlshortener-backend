const db = require('../shared/helper.js')
const shortid = require('shortid')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
require('dotenv').config()

const services = {

  async resets (req, res) {
    /*
     For verification -> user email
     crypto -> generating a token and sending it to user mail and later verifying it
     nodemailer -> to send a mail
     */

    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err)
      }
      const emailToken = buffer.toString('hex')
      const userEmail = await db.data.findOne({ email: req.body.email })
      if (userEmail) {
        db.data.updateOne({ email: req.body.email }, { $set: { reset: emailToken } })
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASS
          }
        })
        const mailOptions = {
          from: process.env.EMAIL_ID,
          to: req.body.email,
          subject: ' reset your password',
          html: `
                <p>click the <a href='url/reset-password/${emailToken}'>link </a> to reset your password</p>
                <p>valid for 24 hours only</p>
                `
        }

        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.log(err)
          } else {
            console.log('email sent:' + info.response)
            res.send({ message: 'Check your mail' })
          }
        })
      } else {
        res.send({ message: 'enter a valid mail' })
      }
    })
  },

  // reset-Password
  async newPassword (req, res) {
    try {
      const salt = await bcrypt.genSalt(10)
      // store pass to DB in encrypted form
      req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt)
      // find a mail with provided token
      const checkEmail = await db.data.findOne({ reset: req.body.token })
      if (checkEmail) {
        // if mail exists -> set pass to that user
        await db.data.findOneAndUpdate({ reset: req.body.token },
          { $set: { password: req.body.newPassword, reset: undefined } })
        return res.send({ message: 'Password reseted successfully' })
      } else {
        return res.send({ message: 'Something went wrong' })
      }
    } catch (err) {
      res.status(400).send(err)
    }
  },

  // creating url
  async createUrl (req, res) {
    // check whether there already shortUrl is present for the provided url or not
    const searchUrl = await db.url.findOne({ url: req.body.url })
    if (searchUrl) {
      // if yes than send the saved url
      res.send(`${process.env.CLIENT_URL} + /redirect/${searchUrl.shortUrl}`)
    } else {
      // generate url -> new url and send to DB
      const shortUrl = shortid.generate()
      const data = await db.url.insertOne({ url: req.body.url, shortUrl: shortUrl })
      res.send(`${process.env.CLIENT_URL} + /redirect/${shortUrl}`)
    }
  },

  // Redirect shorturl -> long url
  async redirect (req, res) {
    console.log(req.params.id)
    const data = await db.url.findOne({ shortUrl: req.params.id })
    if (data) {
      console.log(data)
      res.send(data.url)
    } else {
      res.send('enter a valid url')
    }
  }
}

module.exports = services
