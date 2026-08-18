const express=require("express");
const app=express();
exports.app = app;

const cors = require("cors");
app.use(cors()); 



app.use(express.json());

module.exports = app;