const cloudinary = require('../utils/cloudinaryConfig.js')
const Product = require('../models/ProductModel')
const Order = require('../models/OrderModel.js')
const { newError } = require('../utils/Errors.js');
const UserModel = require('../models/UserModel.js');



// get all products => /api/products
exports.getProducts = async(req,res,next)=>{
    try {
        res.pagination.activePage = +req.query.page
        const categories = await Product.distinct('category');
        const result = await Product.aggregate([
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
              }
            }
          ]);
        //   if (result.length === 0) return res.json({ minPrice: 0, maxPrice: 0 });
          const { minPrice, maxPrice } = result[0];
        res.status(200).json({pagination:res.pagination,categories, minPrice, maxPrice})
    } catch (error) {
        console.log(error.message)
        res.status(400).json({message: error.message})
    }
}

//get all categories
exports.getAllCategs = async(req,res)=>{
    try {
        const categories = await Product.distinct('category');
        res.json({categories});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// get one product details => /api/products/:id
exports.getOneProduct = async (req,res,next)=>{
    try {
        const product = await Product.findById(req.params.id)
        if(!product) return next(newError(404,"product not found"))
        res.status(200).json(product)
    } catch (error) {
        res.status(404).json({message: 'product not found'})
    }
}

// comment a product
exports.commentProduct= async(req,res,next)=>{
    try {
        const { productId } = req.params;
        const { userId, firstName, lastName, image, comment, rating } = req.body;
        const product = await Product.findById(productId);
        if(!product) return res.status(404).json({ error: 'Product not found' });
        const newComment = {
            user: {
                _id: userId,
                firstName,
                lastName,
                image,
            },
            comment,
            rating
        };
        product.reviews.push(newComment);
        product.numOfReviews += 1;
        product.rating = product.reviews.reduce((acc,item)=> acc + item.rating ,0) / product.numOfReviews
        await product.save();
        
        
        const user = await UserModel.findById(userId);
        if(!user) return res.status(404).json({ error: 'User not found' });
        user.reviews.push({
            productId,
            comment,
            rating
        });
        await user.save();
        res.json({ message: 'Comment submitted successfully' });
    } catch (error) {
        next(newError(400,error.message))
    }
}

// create new product => /api/products/new
exports.newProduct = async(req,res,next)=>{
    try {
        const {name,price,category,description,stock} = req.body
        if(!name || !price || !category || !description || !stock) 
            return next(newError(400, 'please fill all required fuilds'))  
        if (!req.body.image) return next(newError(400, 'please choose an image'))
        const uploadRes = await cloudinary.uploader.upload(req.body.image, {upload_preset: 'e-commerce'})
        const {public_id, secure_url} = uploadRes
        req.body.image = {public_id, secure_url}
        const product = await Product.create(req.body)
        res.status(201).json({
            message: 'product created successfuly',
            product,
        })
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// update product => /api/products/:id
exports.updateProduct = async(req,res)=>{
    try {
        let product = await Product.findById(req.params.id)
        if(!product) return res.status(404).json({message: 'product not found'})
        if (req.body.image !== "") {
            cloudinary.uploader.destroy(product.image.public_id)
            const uploadRes = await cloudinary.uploader.upload(req.body.image, {upload_preset: 'e-commerce'})
            const {public_id, secure_url} = uploadRes
            req.body.image = {public_id, secure_url}
        } else req.body.image = product.image
        product = await Product.findByIdAndUpdate(req.params.id, req.body,{ new: true })
        res.json({message: 'product updated',product})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// delete product => /api/products/:id
exports.deleteProduct= async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({message: 'product not found'})
        cloudinary.uploader.destroy(product.image.public_id)
        const deletedProduct = await Product.findByIdAndDelete(req.params.id)
        await Order.deleteMany({ 'products.productId': deletedProduct._id });
        res.status(200).json({message: 'product deleted', product: deletedProduct})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

// get random products
exports.getRandomProducts = async(req,res)=>{
    const size = parseInt(req.query.size) || 10
    try {
        const randomProducts = await Product.aggregate([{$sample: {size}}])
        res.json({randomProducts})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
