const User = require('../models/UserModel.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { newError } = require('../utils/Errors.js');
const cloudinary = require('../utils/cloudinaryConfig.js')
const {transporter} = require('../utils/nodeMailer.js')

// forgot password
exports.forgotPassword = async(req,res,next) => {
    try {
        const {email} = req.body
        const oldUser = await User.findOne({email})
        if(!oldUser) return next(newError(404, 'please enter your real email'))
        const secret = process.env.JWT_SECRET_KEY + oldUser.password
        const resetToken =  jwt.sign({id: oldUser._id, email: oldUser.email}, secret,{
            expiresIn: '1h'
        })
        const link = `${process.env.BASE_URL}/api/user/reset-password/${oldUser._id}/${resetToken}`
        const mailOptions = {
            from: 'auto-Shopp',
            to: email,
            subject: 'reset your password',
            text: 
            `hello ${oldUser.lastName}
            please click on the link to reset your password
            ${link}`
          }
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              return next(newError(500, 'cannot send the reset passwort to your email'))
            } else {
              res.json({message: "please check your email to reset your password"})
            }
          })
    } catch (error) {
        return next(newError(500, "something wrong"))
    }
}

// GET reset password PAGE
exports.resetPassword = async(req,res,next) => {
    try {
        const {id,token} = req.params
        const oldUser = await User.findById(id)
        if(!oldUser) res.render("fullScreenError",{redirect:false,errMsg:"user not found !!!"} )
        const secret = process.env.JWT_SECRET_KEY + oldUser.password
        const resetToken =  jwt.verify(token, secret)
        if (!resetToken) res.render("fullScreenError",{redirect:false,errMsg:"invalid or expired token"} )
        res.render("resetPassword", {errMsg:"",email: oldUser.email})
    } catch (error) {
        res.render("fullScreenError",{redirect:false,errMsg:"invalid or expired token"} )
    }
}

// POST reset password 
exports.resetPasswordPost = async(req,res,next) => {
    try {
        const {id,token} = req.params
        const oldUser = await User.findById(id)
        if(!oldUser) return res.render("fullScreenError",{redirect:false,errMsg:"user not found"} )
        const secret = process.env.JWT_SECRET_KEY + oldUser.password
        const resetToken =  jwt.verify(token, secret)
        if (!resetToken) return res.render("fullScreenError",{redirect:false,errMsg:"invalid or expired token"} )
        if(req.body.password.trim() === "" || req.body.password !== req.body.confirm){
           return res.render("resetPassword",{errMsg:"passwords not matches",email: oldUser.email} )
           
        } 
        req.body.password = await bcrypt.hash(req.body.password,10)
        await User.findByIdAndUpdate(id, {password: req.body.password})
        res.render("fullScreenError",{redirect:true ,errMsg:"your password is updated successfuly"} )
    } catch (error) {
        return next(newError(500, error.msg))
    }
}

// user register => /api/user/register
exports.userRegister = async(req,res,next)=>{
    try {
        const userr = await User.findOne({email: req.body.email})
        if (userr) return next(newError(404, 'user already exist')) //res.status(400).json({message: 'user already exist'})
        if(req.body.password !== req.body.confirm) return next(newError(400, 'passwords not matches'))
        const hashedPass = await bcrypt.hash(req.body.password,10)
        req.body.password = hashedPass
        req.body.image = {
            public_id: "lqvpcvcnrykdabnpjkmi",
            secure_url: "https://res.cloudinary.com/deftn1jya/image/upload/v1685146335/e-commerce/lqvpcvcnrykdabnpjkmi.png"
        }
        const user = await User.create(req.body)
        const token =  jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "2 days"
        })
        res.status(201).json({token, user: {
            id: user._id,
            firstName:user.firstName,
            lastName:user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            image: user.image
        }})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// user login => /api/user/login
exports.userLogin = async(req,res)=>{
    try {
        const user = await User.findOne({email: req.body.email}) 
        if(!user) return res.status(404).json({message: 'user not found'})
        const isPassVerified = await bcrypt.compare(req.body.password, user.password)
        if(!isPassVerified) return res.status(404).json({message: 'wrong password'})
        const token = await jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "2 days"
        })
        res.cookie('token', token,{
            // httpOnly: true,
            maxAge: 1000 * 60 * 60
        })
        res.json({token, user:{id: user._id,
            firstName:user.firstName,
            lastName:user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            image: user.image
        }})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// user logout => /api/user/logout
exports.userLogout = async(req,res)=>{
    try {
        if(!req.cookies.token) return res.status(404).json({message: 'you are already logged out'})
        res.clearCookie('token',{
            httpOnly: true
        })
        res.status(200).json({message: 'you are logged out !!'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// user update => /api/user/update
exports.userUpdate = async(req,res,next)=>{
    try {
        const user = await User.findById(req.userToken.id)
        if(!user) return res.status(404).json({message: 'user not found'})
       if(req.body.password.trim() !== ""){
            if(req.body.password !== req.body.confirm) return next(newError(400, 'passwords not matches'))
             req.body.password = await bcrypt.hash(req.body.password, 10)
        } else{
            req.body.password = user.password
        }
        if (user.isAdmin === false) req.body.isAdmin = false 
        if(req.body.image) {
            if(user.image) cloudinary.uploader.destroy(user.image.public_id);
            const uploadRes = await cloudinary.uploader.upload(req.body.image, {upload_preset: 'e-commerce'})
            const {public_id, secure_url} = uploadRes
            req.body.image = {public_id, secure_url}
        } else{
            req.body.image = user.image
        }
        const updatedUser = await User.findByIdAndUpdate(req.userToken.id, req.body, { new: true })
        res.status(200).json({message: 'your profile is updated successfuly !!', user: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            image: updatedUser.image
        }})
    } catch (error) {
        res.json(error.message)
    }
}

// user profile => /api/user/profile
exports.profile = async(req,res) =>{
    const userToken = req.userToken
    res.status(200).json({id: userToken?._id, 
        firstName: userToken?.firstName,
        lastName: userToken?.lastName,
        email: userToken?.email,
        isAdmin: userToken?.isAdmin,
        image: userToken?.image
    })
}

