const { getAllUsers, adminPage, deleteUser, updateUser } = require('../controllers/adminController')
const isAdmin = require('../middlewares/IsAdmin')
const isAuth = require('../middlewares/auth')
const UserModel = require('../models/UserModel')
const { paginatedResults } = require('../utils/paginatedResults')

const router = require('express').Router()

// admin page => /api/admin
router.get('/',isAuth, isAdmin, adminPage)

// get all users => /api/admin/users (only admin)
router.get('/users',isAuth, isAdmin, paginatedResults(UserModel), getAllUsers)

// delete user => /api/admin/remove/:id
router.delete('/remove-user/:id', isAuth, isAdmin, deleteUser)

// update user => /api/admin/uppdate-user/:id
router.put('/update-user/:id', isAuth, isAdmin, updateUser)


module.exports = router