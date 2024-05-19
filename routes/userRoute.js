const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUser, getUsers,
    loginStatus, updateUser, updatePassword,
 changePassword } = require("../controllers/userController");
const protectLoginUser = require("../middleware/authMiddleware");

//Expected: information that frontend send to me will be POSTED to backend
//whenever making request to this endpoint, function registerUser is to be used. It's created inside userController
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", protectLoginUser, getUser);
router.get("/getusers", protectLoginUser, getUsers);
router.get("/loggedin", loginStatus);
router.patch("/update", protectLoginUser, updateUser);
router.patch("/updatepassword", protectLoginUser, updatePassword);
router.put("/changepassword/:resetToken", changePassword);



module.exports = router;