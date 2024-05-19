const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const contact =  asyncHandler (async (req, res) => {
    const {subject, message} = req.body
    const user = await User.findByID(req.user._id)

    if (!user){
        res.status(400)
        throw new Error ("Please log in!")
    }

    //Validation
    if(!subject || !message){
        res.status(400)
        throw new Error ("Subject and message must not be empty")
    }

    const send_to = process.env.EMAIL_USER
    const sent_from = process.env.EMAIL_USER
    const reply_to = user.email

    try {
        await sendEmail(subject, message, send_to, sent_from, reply_to)
        res.status(200).json({success: true, message: "Email Sent"})
    } catch (error) {
        res.status(500)
        throw new Error("Email is not sent")
    }
});

module.exports = { contact }