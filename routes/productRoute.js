const express = require("express");
const router = express.Router();
const { createProduct, getProducts, getProduct, deleteProduct,
    updateProduct, } = require("../controllers/productController");
const protectProduct = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");


router.post("/", protectProduct, upload.single("image"), createProduct)
router.patch("/:id", protectProduct, upload.single("image"), updateProduct)
router.get("/", protectProduct, getProducts)
router.get("/:id", protectProduct, getProduct)
router.delete("/:id", protectProduct, deleteProduct)



module.exports = router