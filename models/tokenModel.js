const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        ref: "user"
    },
    token: {
        type: String,
        required: true, 
    },
    create: {
        type: Date,
        required: true, 
    },
    expire: {
        type: Date,
        required: true, 
    },
})

const Token = mongoose.model("Token", tokenSchema)

module.exports = Token