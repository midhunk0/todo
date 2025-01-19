// @ts-nocheck
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const dotenv=require("dotenv").config();

const port=5000;
const app=express();
const environment=process.env.NODE_ENV;
const apiUrl=environment==='development'
    ? process.env.FRONT_END_DEV_API
    : process.env.FRONT_END_PROD_API;

app.use(
    cors({
    origin: apiUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("database connected"))
    .catch((error)=>console.log("database not connected: ", error));

app.use("/", require("./routes"));

app.listen(port, ()=>{
    console.log(`server listening on port ${port}`);
})