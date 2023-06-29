const express = require('express')
const isAuth = require('../middlewares/auth')
const isAdmin = require('../middlewares/IsAdmin')
const { createCheckout, createOrder, getAllOrders, updateOrder, getOneOrder, getUserOrders, getUserOneOrder, getNumOrdersByCateg } = require('../controllers/orderController')
const { paginatedResults } = require('../utils/paginatedResults')
const OrderModel = require('../models/OrderModel')
const router = express.Router()

// create new checkout in strippe => /api/orders/create-checkout
router.post('/create-checkout', isAuth ,createCheckout)

// create new order in db => /api/orders/create-order
router.post('/create-order' ,createOrder)

// get all orders (only admin) => /api/orders/all
router.get('/all',isAuth, isAdmin, paginatedResults(OrderModel) ,getAllOrders)

// 
router.get('/order-count-by-category',isAuth,isAdmin ,getNumOrdersByCateg)

// get one order by id (only admin) => /api/orders/:id
router.get('/:id',isAuth, isAdmin, getOneOrder)

// update order (only admin) => /api/orders/update/:id
router.put('/update/:id',isAuth, isAdmin ,updateOrder)

// get user all orders => /api/orders/user/orders
router.get('/user/orders',isAuth, getUserOrders)

// get user one order => /api/orders/user/order/:id
router.get('/user/order/:id',isAuth, getUserOneOrder)


module.exports = router