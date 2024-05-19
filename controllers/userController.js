//Write the logic of registerUser in database 

const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
//const { use } = require("../routes/userRoute");
const Token = require("../models/tokenModel");
const crypto = require("crypto")

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};

//Cases when user is registered
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    // Validation
    if (!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all required fields")
    }

    if (password.length < 6){
        res.status(400)
        throw new Error("Password must have more than 6 characters")
    }

    //check if user email already exists
    const userExists = await User.findOne ({email})

    if (userExists) {
        res.status(400)
        throw new Error("Email is already used")
    }

    //create new user
    const user = await User. create({
        name,
        email,
        password,
    })

    //create token for user
    const token = createToken(user._id);

    //Send HTTP only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //cookie is expired in 1 day
        sameSite: "none",
        secure: true
    })

    //if user is created
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

    //Error when email and password is missing
    if (!email || !password){
        res.status(400)
        throw new Error("Please add email and password")        
    }

    //Error when user doesn't exist
    const user = await User.findOne({email})

    if(!user){
        res.status(400)
        throw new Error("User is not registered")   
    }

    //Error when password is not correct
    const correctPassword = await bcrypt.compare(password, user.password)

    //create token for user
    const token = createToken(user._id);

    //Send HTTP only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //cookie is expired in 1 day
        sameSite: "none",
        secure: true
    })

    if (user && correctPassword){
        const {_id, name, email, photo, department, phone, bio} = user;
        res.status(200).json({//has to be explained
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

// Get user information???
const getUser = (async (req, res) => {
    const user = await User.findById(req.user._id)

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

//Get all users
const getUsers = asyncHandler (async (req, res) =>{
    const users = await User.find({},{name:1}); //No createAt(), otherwise there is error
    res.status(200).json(users)
})

//Get login status
const loginStatus = asyncHandler (async (req, res) => {

    const token = req.cookies.token
    if (!token) return res.json(false)

    //Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (verified) return res.json(true)

    return res.json(false)
})

const updateUser = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id)

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

const updatePassword = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id);

    const {oldPassword, newPassword} = req.body

    if(!user){
        res.status(400)
        throw new Error ("User not found");
    }
    //Validation
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

/*const forgetPassword = asyncHandler (async(req, res) =>{
    const {email} = req.body
    const user = await User.findOne({email})

    if(!user){
        res.status(400)
        throw new Error ("Email not existed");
    }

    //Delete existed token
    let token = await Token.findOne({userID: user._id})
    if(token){
        await token.deleteOne()
    }

    //Reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken)

    //Hash token
    const hashToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Save token to database
    await new Token({
        userID: user._id,
        token: hashToken,
        createdAt: Date.now(),
        expireAt: Date.now() + 30 * (60*1000) //Token expires in 30mins
    }).save()

    //Reset Email URL construction
    const resetURL = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    //Reset Email
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>
        <p>This reset link is valid for only 30 minutes.</p>
        <a href=${resetURL} clicktracking=off>${resetURL}</a>

        <p>Regards ...< /p>
        <p>Pinvent Team</p>
    `;
    const subject = "Password reset request"
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER
    
    try {
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({success: true, message: "Reset Email Sent"})
    } catch (error) {
        res.status(500)
        throw new Error("Email is not sent")
    }
}); */

//Change password link
const changePassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;
    
    //Hash token, then compare to Token in DB
    const hashToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    //Compare to token in DB
    const userToken = await Token.findOne({
        token: hashToken,
        expireAt: {$gt: Date.now()}
    });

    if(!userToken){
        res.status(404)
        throw new Error("Invalid or expired token")
    }

    //Find user
    const user = await User.findOne({_id: userToken.userID})
    user.password = password
    await user.save()
    res.status(200).json({
        message: "Password changed, please log in again"
    });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    getUsers,
    loginStatus,
    updateUser,
    updatePassword,
    changePassword
};