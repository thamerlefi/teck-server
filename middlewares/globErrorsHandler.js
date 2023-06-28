exports.errorHandler = (error,req,res,next) => {
    error.statusCode = error.statusCode || 500
    res.status(error.statusCode).json({message: error.message}) 
}