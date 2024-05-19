const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const errorHandler = require("./middleware/errorMiddleware")
const cookieParser = require("cookie-parser");
const path = require("path")

const app = express();

// Middlewares: phan mem trung gian
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Resolve conflict when requesting from backend to frontend
app.use(cors({
    origin: ["http://localhost:3000", "https://telit-it-inventory.vercel.app"],
    credentials: true
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

//Routes Middleware, utilize the route
//prefix of every user route: /api/users
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);

//Routes
app.get("/", (req, res) => {
    res.send("Home Page");
});

//Error Middleware
app.use(errorHandler); 

const PORT = process.env.PORT || 5000;

//Connect to DB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err) => console.log(err))