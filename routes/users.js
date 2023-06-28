const multer = require('multer')
const { userRegister, userLogin, profile, userUpdate, userLogout, userImg, forgotPassword, resetPassword, resetPasswordPost} = require('../controllers/userController')
const isAuth = require('../middlewares/auth')

const router = require('express').Router()
const upload = multer()


// forgot password
router.post('/forgot-password',forgotPassword)
router.get('/reset-password/:id/:token',resetPassword)
router.post('/reset-password/:id/:token',resetPasswordPost)

// sign up => /api/user/register
router.post('/register', userRegister)

// login => /api/user/login
router.post('/login', userLogin)

// logout => /api/user/logout
router.post('/logout', userLogout)

// update profile => /api/user/update
router.put('/update',isAuth, userUpdate)

// profile => /api/user/profile
router.get('/profile', isAuth ,profile)


module.exports = router