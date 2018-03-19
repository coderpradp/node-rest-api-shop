const mongoose = require('mongoose')

const Order = require('../models/order')
const Product = require('../models/product')

exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + doc._id
            }
          }
        })
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.orders_create_order = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        throw { status: 404, message: 'Product not found' }
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
      })
      return order.save()
    })
    .then(result => {
      console.log(result)
      res.status(201).json({
        message: 'Order stored',
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/' + result._id
        }
      })
    })
    .catch(err => {
      if (err.status) {
        res.status(404).json({
          message: err.message
        })
      } else {
        res.status(500).json({
          error: err
        })
      }
    })
}

exports.orders_get_order = (req, res, next) => {
  const id = req.params.orderId
  Order.findById(id)
    .select('-__v')
    .populate('product', '-__v')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        })
      }
      res.status(200).json({
        order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders'
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.orders_delete_order = (req, res, next) => {
  const id = req.params.orderId
  Order.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Order deleted successfully',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: { product: 'ID', quantity: 'Number' }
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}
