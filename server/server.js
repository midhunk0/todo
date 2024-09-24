// @ts-nocheck
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const dotenv=require("dotenv").config();

const port=5000;
const app=express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("database connected"))
    .catch((error)=>console.log("database not connected: ", error));

app.use("/", require("./routes"));

app.listen(port, ()=>{
    console.log(`server listening on port ${port}`);
})