const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken")

const protectLoginUser = asyncHandler (async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token){
            res.status(401)
            throw new Error("Not authorized, please log in")
        }

        //Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET)

        //Get userif from token
        const user = await User.findById(verified.id).select("-password") //receive all information except user password

        if(!user){
            res.status(401)
            throw new Error("User not found")
        }

        req.user = user
        next() //other codes that need to run after middleware will run

    } catch (error) {
        res.status(401)
            throw new Error("Not authorized, please log in")
    }
});

module.exports = protectLoginUser