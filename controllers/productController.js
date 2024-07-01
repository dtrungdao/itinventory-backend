//Library async-handler is imported and used from this website https://www.npmjs.com/package/express-async-handler
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");

//Management of creating a product in backend
const createProduct = asyncHandler (async(req, res) => {
    const {name, comment, category, model, inventorynumber, serialnumber, 
        guarantee, price, statusDevice, belongTo, description} = req.body


    //Validate if required attributes are missing
    if(!name || !category || !inventorynumber || !price || !statusDevice || !model
     ){
        res.status(400)
        throw new Error ("All required fields have to be filled")
    }

    //Management image upload to backend
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2), //2 decimal places
        }
    }

    //Create a product after checking tasks
    const product = await Product.create({
        user: req.user.id, name, comment, category, model, inventorynumber, 
        serialnumber, guarantee, price, statusDevice, belongTo, description, image:fileData
    })

    //Response API status
    res.status(201).json(product)
});

//Management get all products in backend
const getProducts = asyncHandler (async (req, res) =>{
    const products = await Product.find().sort("-createdAt");
    res.status(200).json(products)
})

//Management get one product in backend
const getProduct = asyncHandler (async (req, res) =>{
    const product = await Product.findById(req.params.id)
    
    //Response error if product doesn't exist
    if(!product){
        res.status(404)
        throw new Error ("Product not found")
    }
    res.status(200).json(product)
})

//Management delete product in backend
const deleteProduct = asyncHandler (async (req, res) =>{
    const product = await Product.findById(req.params.id)

    //Response error if product doesn't exist
    if(!product){
        res.status(404)
        throw new Error ("Product not found")
    }

    await product.deleteOne()
    res.status(200).json(product);
})

//Management update a product in backend
const updateProduct = asyncHandler (async (req, res) =>{
    const {name, category, inventorynumber, serialnumber, model, guarantee, 
        price, statusDevice, belongTo, description, comment} = req.body
    const {id} = req.params

    //Find a product to update
    const product = await Product.findById(id)
    
    //Validation not necessary because product is valid after creating
    //Response error if product doesn't exist
    if(!product){
        res.status(404)
        throw new Error ("Product not found")
    }
    //Management image upload to backend
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2), //2 decimal places
        }
    }

    // Log the data to update
    console.log("ID:", id);
    console.log("Data to update:", {
        name,
        category,
        inventorynumber,
        serialnumber,
        model,
        guarantee,
        price,
        statusDevice,
        belongTo,
        description,
        comment,
        image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    });


    //Update product after tasks
    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id},
        {
            name, category, inventorynumber, serialnumber, model, guarantee, 
            price, statusDevice, belongTo, description, comment,
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