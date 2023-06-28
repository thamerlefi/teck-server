const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const { newError } = require('../utils/Errors')

const isAuth = async(req,res,next) => {
    try {
        const token = req.headers["x-auth"]
        // const token = req.cookies.token
        if(!token) return next(newError(401,'no access please log in'))
        const userToken = jwt.verify(token, process.env.JWT_SECRET_KEY,async(err,decoded)=>{
            if(err) return res.status(401).json({message: 'invalid token, you must login first !!', err: err.message})
            const user = await User.findById(decoded.id)
            req.userToken = user
            next()
        }) 
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
// next(newError(404,'connot find this url'))
module.exports = isAuth