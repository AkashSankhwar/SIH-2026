const express=require("express");
const authRouter = require("./routes/auth.route.js");
const app=express();

const cors = require("cors");
app.use(cors()); 

app.use(express.json());

app.use("/api/auth",authRouter);

app.get("/",(req,res)=>{
    res.send("server is running");
})

module.exports = app;