const express = require('express')
const router = express.Router()
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
const ProductsController = require('../controllers/products')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname
    cb(null, name)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
})

// Get all products
router.get('/', ProductsController.products_get_all)

// Get a product
router.get('/:productId', ProductsController.products_get_product)

// Add a product
router.post(
  '/',
  checkAuth,
  upload.single('productImage'),
  ProductsController.products_create_product
)

// Update a product
router.patch(
  '/:productId',
  checkAuth,
  ProductsController.products_update_product
)

// Delete a product
router.delete(
  '/:productId',
  checkAuth,
  ProductsController.products_delete_product
)

module.exports = router
