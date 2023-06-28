// import libraries
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors')


const {errorHandler} = require('./middlewares/globErrorsHandler')
const {newError} = require('./utils/Errors')

// import routes
const productRouter = require('./routes/products')
const userRouter = require('./routes/users')
const adminRouter = require('./routes/admin');
const orderRouter = require('./routes/orders')

const app = express()

// middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
require('dotenv').config()
app.use(cors())
app.set('view engine', 'ejs')

//---------------------------------------------- routes
// products route
app.use('/api/products', productRouter)

// user route
app.use('/api/user', userRouter)

// admin route
app.use('/api/admin', adminRouter)

// orders route
app.use('/api/orders', orderRouter)

// unexpected routes
app.all('*', (req,res,next)=>{
    next(newError(404,'connot find this url'))
})

// global error handler middleware
app.use(errorHandler)

// server running
const port = process.env.PORT || 5000
mongoose.connect(process.env.DB_URI)
.then(()=>app.listen(port,()=>console.log(`server listening on port ${port}`)))


