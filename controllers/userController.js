//Write the logic of registerUser in database 

const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto")

//Create token when registering new account in backend
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};

//All cases when user is registered
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    // Validate if fields are missing
    if (!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all required fields")
    }

    //Set password policy
    if (password.length < 8){
        res.status(400)
        throw new Error("Password must have more than 8 characters")
    }

    //Check if user email exists
    const userExists = await User.findOne ({email})

    if (userExists) {
        //Response error if user already exists
        res.status(400)
        throw new Error("Email is already used")
    }

    //Create a new user after tasks
    const user = await User. create({
        name,
        email,
        password,
    })

    //Create a token for user
    const token = createToken(user._id);

    //Send HTTP only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //cookie is expired in 1 day
        sameSite: "none",
        secure: true
    })

    //Response after creating a user
    if (user){
        const {_id, name, email, photo, department, phone, bio} = user
        res.status(201).json({
            _id, name, email, photo, department, phone, bio, token,
        })
    } else{
        res.status(400)
        throw new Error ("Invalid user data");
    }
});

//Cases when user is logged in
const loginUser = asyncHandler(async(req, res) => {

    const {email, password} = req.body

    //Response error when email and password is missing
    if (!email || !password){
        res.status(400)
        throw new Error("Please add email and password")        
    }

    //Response error when user doesn't exist
    const user = await User.findOne({email})

    if(!user){
        res.status(400)
        throw new Error("User is not registered")   
    }

    //Check if password is not correct
    const correctPassword = await bcrypt.compare(password, user.password)

    //create token for existing user
    const token = createToken(user._id);

    //Send HTTP only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //cookie is expired in 1 day
        sameSite: "none",
        secure: true
    })

    //Response after logging in
    if (user && correctPassword){
        const {_id, name, email, photo, department, phone, bio} = user;
        res.status(200).json({
            _id, name, email, photo, phone, department, bio, token,
    });
    }
    else{
        res.status(400)
        throw new Error ("Invalid user data");
    }
});

//Cases when user is logged out
const logoutUser = asyncHandler(async(req, res) => {
    //Send HTTP only cookie
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), //cookie is expired immediately and user is logged out
        sameSite: "none",
        secure: true
    })
    return res.status(200).json({message: "Logout successful"});
});

// Get user information
const getUser = (async (req, res) => {
    const user = await User.findById(req.user._id)

    //Response after getting user information
    if (user){
        const {_id, name, email, photo, department, phone, bio} = user
        res.status(200).json({
            _id, name, email, photo, department, phone, bio,
        })
    } else{
        res.status(400)
        throw new Error ("User not found");
    }

});

//Get all users information
const getUsers = asyncHandler (async (req, res) =>{
    const users = await User.find({},{name:1}); //No createAt(), otherwise there is error
    res.status(200).json(users)
})

//Get login status
const loginStatus = asyncHandler (async (req, res) => {

    //Response error if token doesn't exist
    const token = req.cookies.token
    if (!token) return res.json(false)

    //Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (verified) return res.json(true)

    return res.json(false)
})

//Cases when updating user
const updateUser = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id)

    //Get and update new user information
    if (user) {
        const {name, email, photo, department, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;
        user.bio = req.body.bio || bio;
        user.department = req.body.department || department;

        const updatedUser = await user.save();
        res.status(200).json({
        _id: updatedUser._id, 
        name: updatedUser.name, 
        email: updatedUser.email, 
        photo: updatedUser.photo, 
        department: updatedUser.department,
        phone: updatedUser.phone, 
        bio: updatedUser.bio, 
    })
        
        
    }
    else{
        res.status(404)
        throw new Error("User not found");
    }
})

//Cases when updating Password
const updatePassword = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id);

    const {oldPassword, newPassword} = req.body

    if(!user){
        res.status(400)
        throw new Error ("User not found");
    }
    //Validate if fields are missing
    if (!oldPassword || !newPassword){
        res.status(400)
        throw new Error ("Passwords have to be filled");
    }

    //Password correction
    const correctPassword = await bcrypt.compare(oldPassword, user.password)

    //Save new password
    if (user && correctPassword){
        user.password = newPassword
        await user.save();
        res.status(200).send("Password is changed");
    } else{
        res.status(400)
        throw new Error ("Password is incorrect");
    }
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    getUsers,
    loginStatus,
    updateUser,
    updatePassword,
};