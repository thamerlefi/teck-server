const { newError } = require("./Errors")

exports.trycatch = (asyncFunc) => async (req,res,next) => {
    try {
        return await asyncFunc(req,res,next)
    } catch (error) {
        next(newError(_,error.message))
    }
}

