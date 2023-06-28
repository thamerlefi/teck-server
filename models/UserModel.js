const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true, min: 3},
    lastName: {type: String, required: true, min: 3},
    email: {type: String,required: true},
    password:{type: String,required: true,min: 6},
    phone: {
      type: Number
    },
    isAdmin :{type: Boolean,default: false,required: true},
    image:{
        type:Object,
        default: {
            secure_url: ''
        },
        required: true
    },
    orders: [
      { 
        orderId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
          required: true,
        }
      }
    ] ,
    reviews: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          comment: {
            type: String,
            required: true
          },
          rating: {
            type: Number,
            required: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
},{
    timestamps: true
})

module.exports = mongoose.model('User', UserSchema)