const express = require("express");
const router = express.Router();
const protectContact = require("../middleware/authMiddleware");
const { contact } = require("../controllers/contactController");

router.post("/", protectContact, contact)

module.exports = router;