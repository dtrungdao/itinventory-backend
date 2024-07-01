const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema ({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },

    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true, //remove space around the email
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ],
    },

    password: {
        type: String, 
        required: [true, "Please add a password"], 
        minLength: [6, "Password must be more than 6 characters"], 
    },

    photo:{
        type: String, 
        required: [true, "Please add a photo"], 
        default: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
    },

    department: {
        type: String,
        trim: true
    },

    allowedDepartments: {
        type: [String],
        required: true
    },

    phone:{
        type: String, 
        default: "+49"
    },

    bio:{
        type: String,
        default: "bio"
    }
},{
    timestamps: true,
})

//Encrypt password before saving to DB
userSchema.pre("save", async function (next){
    //check if password is changed by isModified method
    if (!this.isModified("password")){
        return next();
    }

    //create a random salt value with 10 loops
    const salt = await bcrypt.genSalt(10)
    //hash given password with salt value
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword;
    next();
})

const User = mongoose.model("User", userSchema);
module.exports = User