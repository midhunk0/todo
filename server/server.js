// @ts-nocheck
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_API,  // Frontend URL from .env
    credentials: true,  // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());

// Handle preflight requests for all routes
app.options('*', cors({
    origin: process.env.FRONTEND_API,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Database connected"))
.catch((error) => console.log("Database connection error: ", error));

// API routes
app.use("/", require("./routes"));

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
