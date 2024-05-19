const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");


const createProduct = asyncHandler (async(req, res) => {
    const {name, comment, category, model, inventorynumber, serialnumber, 
        guarantee, price, statusDevice, belongTo, description} = req.body
    
    //Validate product
    if(!name || !category || !inventorynumber || !price || !statusDevice || !model
     ){
        res.status(400)
        throw new Error ("All required fields have to be filled")
    }

    //Manage image upload
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2), //2 decimal places
        }
    }

    //Create product
    const product = await Product.create({
        user: req.user.id, name, comment, category, model, inventorynumber, 
        serialnumber, guarantee, price, statusDevice, belongTo, description, image:fileData
    })

    res.status(201).json(product)
});

//Get all products
const getProducts = asyncHandler (async (req, res) =>{
    const products = await Product.find().sort("-createdAt");
    res.status(200).json(products)
})

//Get one product
const getProduct = asyncHandler (async (req, res) =>{
    const product = await Product.findById(req.params.id)

    //Error if product doesn't exist
    if(!product){
        res.status(404)
        throw new Error ("Product not found")
    }
    res.status(200).json(product)
})

//Delete product
const deleteProduct = asyncHandler (async (req, res) =>{
    const product = await Product.findById(req.params.id)

    //Error if product doesn't exist
    if(!product){
        res.status(404)
        throw new Error ("Product not found")
    }

    //Authorize user for product
    /*if(product.user.toString() !== req.user.id){
        res.status(401)
        throw new Error ("User not authorized")
    }*/

    await product.deleteOne()
    res.status(200).json(product);
})

//Update a product
const updateProduct = asyncHandler (async (req, res) =>{
    const {name, category, inventorynumber, serialnumber, model, guarantee, 
        price, statusDevice, belongTo, description, comment} = req.body
    const {id} = req.params

    //Find a product to update
    const product = await Product.findById(id)
    
    //Validation not necessary because product is valid after creating
    //Error if product doesn't exist
    if(!product){
        res.status(404)
        throw new Error ("Product not found")
    }

    //Authorize user for product
    /*if(product.user.toString() !== req.user.id){
        res.status(401)
        throw new Error ("User not authorized")
    }*/

    //Manage image upload
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2), //2 decimal places
        }
    }

    //Update product
    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id},
        {
            name, category, inventorynumber, serialnumber, model, price, 
            guarantee, description, statusDevice, belongTo, comment,
            image: Object.keys(fileData).length === 0 ? product?.image : fileData,
        },
        {
            new: true,
            runValidators: true
        }
    )

    res.status(201).json(updatedProduct)
});

module.exports = {
    createProduct, getProducts, getProduct, deleteProduct, updateProduct
}