const app = require("./src/app.js");
const connectDB=require("./src/config/database");
const user=require("./src/models/user.model.js");
connectDB();
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.send("server is running");
})


app.listen(PORT,()=>{
    console.log("Server is running on port 5000");
})
