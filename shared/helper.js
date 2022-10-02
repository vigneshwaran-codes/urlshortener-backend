const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URI
const MONGO_NAME = process.env.MONGO_NAME
const client = new MongoClient(MONGO_URL)

module.exports = {
  db: null,
  url: null,
  data: null,
  async connect () {
    await client.connect()
    this.db = client.db(MONGO_NAME)
    console.log('Selected Database', MONGO_NAME)
    this.url = this.db.collection('urls')
    this.data = this.db.collection('data')
  }
}
