
const isAdmin = (req,res,next) => {
    if(req.userToken && req.userToken.isAdmin) return next()
    res.status(401).json({message: 'no access user'})
}

module.exports = isAdmin