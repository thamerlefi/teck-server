const {
  newProduct,
  getProducts,
  getOneProduct,
  updateProduct,
  deleteProduct,
  commentProduct,
  getRandomProducts,
  getAllCategs,
} = require("../controllers/productsController");
const isAdmin = require("../middlewares/IsAdmin");
const isAuth = require("../middlewares/auth");
const ProductModel = require("../models/ProductModel");
const { paginatedResults } = require("../utils/paginatedResults");

const router = require("express").Router();

// get random products => /api/products/random
router.get("/random", getRandomProducts);

// get all categs
router.get("/categories", getAllCategs);

// get products
router.get("/", paginatedResults(ProductModel), getProducts);
router.get("/:id", getOneProduct);

// comment product
router.post("/:productId/comment", isAuth, commentProduct);

// create new product (only admin)
router.post("/new", isAuth, isAdmin, newProduct);

// update product (only admin)
router.put("/:id", isAuth, isAdmin, updateProduct);

// delete product (only admin)
router.delete("/:id", isAuth, isAdmin, deleteProduct);

module.exports = router;
