const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        ref: "user"
        },
        
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true
    },

    category: {
        type: String,
        required: [true, "Please add a category"],
        trim: true
    },

    allowedCategories: {
        type: [String],
        required: true
    },

    model: {
        type: String,
        required: [true, "Please add device model"],
        trim: true
    },


    inventorynumber: {
        type: String,
        required: [true, "Please add an invetory number"],
        trim: true
    },

    serialnumber: {
        type: String,
        trim: true
    },

    guarantee: {
        type: String,
        trim: true
    },

    price: {
        type: String,
        required: [true, "Please add a price"],
        trim: true
    },

    description: {
        type: String,
        trim: true
    },
    
    statusDevice: {
        type: String,
        required: [true, "Please add a status"],
        trim: true
    },

    allowedStatusDevice: {
        type: [String],
        required: true
    },

    belongTo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user'
    },

    comment: {
        type: String,
        trim: true
    },

    image: {
        type: Object,
        default:{}
    },

}, {
    timestamps: true,
})

const Product = mongoose.model("Product", productSchema)

module.exports = Product;