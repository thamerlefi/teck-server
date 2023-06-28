const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
        trim: true,
        // max: [100, 'Name must be less than 100 caracters']
    },
    price: {
        type: Number,
        required : [true, 'Please enter product price'],
        // maxLength: [5, 'price cannot exeed 5 numbers'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'please enter product descrition']
    },
    rating: {
        type: Number,
        default: 0
    },
    image: {
            type:Object,
            required:true,
            default: {
                public_id: '',
                secure_url: ''
            },
            
    },
    images: [
        {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'please select the category of this product'],
    },
    stock: {
        type: Number,
        required: [true, 'please enter product stock'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                _id : {
                    type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
                },
                firstName : {
                    type: String,
                    required: true
                },
                lastName: {
                    type: String,
                    required: true
                },
                image : {
                    type: String,
                    required: true
                } 
            },
            rating: {
                type: Number,
                // required: true
            },
            comment:{
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    selling:{
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', ProductSchema)