const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST)

// create chekout in stripe
exports.createCheckout = async(req,res) => {
    const line_items = req.body.cart.map(prod =>{
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: prod.name,
                    images: [prod.image.secure_url],
                    description: prod.description,
                },
                unit_amount: prod.price * 100
            },
            quantity: prod.count
        }
    })
    const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {
            allowed_countries: ['US', 'CA'],
          },
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 0,
                  currency: 'usd',
                },
                display_name: 'Free shipping',
                delivery_estimate: {
                  minimum: {
                    unit: 'business_day',
                    value: 5,
                  },
                  maximum: {
                    unit: 'business_day',
                    value: 7,
                  },
                },
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: 1500,
                  currency: 'usd',
                },
                display_name: 'Next day air',
                delivery_estimate: {
                  minimum: {
                    unit: 'business_day',
                    value: 1,
                  },
                  maximum: {
                    unit: 'business_day',
                    value: 1,
                  },
                },
              },
            },
          ],
        phone_number_collection:{
            enabled:true
        },
        line_items,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/payment-success`,
        cancel_url: `${process.env.CLIENT_URL}/`,
      });
        
    
   
      res.json({sessionId: session.id });
}

// create order in database
exports.createOrder = async(req,res)=>{
    try {
        
        const sessionId = req.body.sessionId
        const {cart, userId} = req.body
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log(session.payment_status)
        if (session.payment_status === 'paid'){
        const products = cart.map(prod=>{
            return {
            productId: prod._id,
            quantity: prod.count
            }
        })
        const findedOrder = await Order.findOne({sessionId})
        if (findedOrder) return 
        const newOrder = new Order({
            sessionId,
            userId,
            products,
            totalPrice: session.amount_total / 100,
            shippingAdress: {
                city: session.customer_details.address.city,
                country: session.customer_details.address.country,
                line1: session.customer_details.address.line1,
                line2: session.customer_details.address.line2,
                postalCode: session.customer_details.address.postal_code,
                phone: session.customer_details.phone,
            }
          })
          await newOrder.save()
          const user = await User.findById(userId)
          if(!user) return res.status(404).json({message: "user noot found"})
          user.orders.push({orderId: newOrder._id})
          await user.save()
          const productsInCart = cart.map(prod=>prod._id)
          const updatedProds = await Product.find({_id: {$in: productsInCart}})
          
          updatedProds.map(async(prod) => {
            prod.selling ++
            cartProd = cart.find(cartProd => cartProd._id === prod._id.toString())
            
            prod.stock = prod.stock -cartProd.count
            if (prod.stock < 0) prod.stock = 0 
            await prod.save()
          })
          // console.log(updatedProds)
          res.json({message: "order added"})
        }else {
            res.send('Payment failed.');
          }
    } catch (error) {
        res.status(500).json({message: "internal server error"})
    }
}

// get all orders (only admin)
exports.getAllOrders = async(req,res)=>{
  try {
    res.pagination.list = await Promise.all(
    res.pagination.list.map(async(item)=>{
      const itemModel = await Order.findById(item._id)
        .populate('userId', "firstName lastName email image")
        .populate("products.productId", "name description image")
        .exec()
          return itemModel
    })
    )
    // if(!orders) return res.status(404).json({message: "order not found"})
    res.json({orders:res.pagination})
  } catch (error) {
    res.status(500).json({message: "internal server error", error:error.message})
  }
}

// get one order by id
exports.getOneOrder= async(req,res)=>{
  try {
    const {id} = req.params
    const order = await Order.findById(id)
    .populate('userId', "firstName lastName email image")
    .populate("products.productId", "name description price category stock image")
    .exec()
    if(!order) return res.status(404).json({message: "order not found"})
    res.json({order})
  } catch (error) {
    res.status(500).json({message: "internal server error"})
  }
}

// update one order by id
exports.updateOrder = async(req, res) =>{
  try {
    const {id} = req.params
    const {action} = req.body
    const order = await Order.findById(id)
    if(!order) return res.status(404).json({message: "order not found"})
    order.status = action
    await order.save()
    const updatedOrder = await Order.findById(id)
    .populate('userId', "firstName lastName email image")
    .populate("products.productId", "name description price category stock image")
    .exec()
    res.json({updatedOrder})
  } catch (error) {
    res.status(500).json({message: "internal server error"})
  }
}

// get user order 
exports.getUserOrders = async(req,res)=>{
  try {
    const userId = req.userToken._id
    const orders = await Order.find({userId})
    .populate("products.productId", "name description image price category")
    if(!orders) return res.status(404).json({message: "order not found"})
    res.json({orders})
  } catch (error) {
    res.status(500).json({message: "internal server error", error: error.message})
  }
}

exports.getUserOneOrder = async(req,res)=>{
  try {
    // const userId = req.userToken._id
    const {id} = req.params
    const order = await Order.findById(id)
    .populate("products.productId", "name description price category stock image")
    if(!order) return res.status(404).json({message: "order not found"})
    res.json({order})
  } catch (error) {
    res.status(500).json({message: "internal server error", error: error.message})
  }
}

// get the number of orders for each category
exports.getNumOrdersByCateg =  async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'products.productId',
          as: 'orders'
        }
      },
      {
        $unwind: '$orders'
      },
      {
        $group: {
          _id: '$category',
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // If there are no products or orders, return an empty result
    if (result.length === 0) {
      return res.json([]);
    }
    let resu=[]
    result.map(cat =>{
      // resu[cat._id] = cat.orderCount
      resu.push([cat._id, cat.orderCount])
    })
    res.json(resu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error',er:error });
  }
}
