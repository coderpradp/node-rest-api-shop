const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

// Requiring API routes
const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/user')

// Connecting to MongoDB Atlas
mongoose.Promise = global.Promise

mongoose
  .connect(
    'mongodb://node-shop-admin:' +
      process.env.MONGO_ATLAS_PW +
      '@node-shop-rest-shard-00-00-wlack.mongodb.net:27017,node-shop-rest-shard-00-01-wlack.mongodb.net:27017,node-shop-rest-shard-00-02-wlack.mongodb.net:27017/test?ssl=true&replicaSet=node-shop-rest-shard-0&authSource=admin'
  )
  .then(result => {
    console.log('Connected to MongoDB server')
  })
  .catch(err => {
    console.log('Failed to connect to MongoDB server')
  })

// Some useful express middlewares
app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Middleware for allowing CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
    return res.status(200).json({})
  }
  next()
})

// Handling requests
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/user', userRoutes)

// Not found error
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

// Other errors
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
  next(error)
})

module.exports = app
