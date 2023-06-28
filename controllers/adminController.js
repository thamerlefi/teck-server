const User = require('../models/UserModel.js')
const Product = require('../models/ProductModel')
const Order = require('../models/OrderModel.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cloudinary = require('../utils/cloudinaryConfig.js')

// get all users => /api/user/all (only admin)
exports.getAllUsers = async(req,res) =>  {
    try {   
        res.json(res.pagination)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// delete user => /api/admin/remove-user/:id
exports.deleteUser = async(req,res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: 'user not found'})
        if(user.image.public_id !== "lqvpcvcnrykdabnpjkmi") cloudinary.uploader.destroy(user.image.public_id);
        await User.findByIdAndDelete(req.params.id)
        await Order.deleteMany({ 'userId': req.params.id });
        res.status(200).json({message: 'user deleted successfuly !'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// update user => /api/admin/update-user/:id
exports.updateUser = async(req,res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: 'user not found'})
        await User.findByIdAndUpdate(req.params.id, req.body)
        res.status(200).json({message: 'user updated successfuly !!'})
    } catch (error) {
        
    }
}

// admin dashboard page /api/user/admin
exports.adminPage = async(req,res) => {
    try {
        const users = await User.find()
        const products = await Product.find()
        const orders = await Order.find()
        const walletBalance = orders.reduce((acc,item) => acc + item.totalPrice,0) 
        res.json({users: users.length, products:products.length, orders: orders.length, walletBalance})
    } catch (error) {
        
    }
}