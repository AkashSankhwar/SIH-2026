const express=require("express");
const app=express();
const cors = require("cors");
app.use(cors()); 
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.send("server is running");
})




app.listen(PORT,()=>{
    console.log("Server is running");
})