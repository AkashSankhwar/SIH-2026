const dotenv = require("dotenv");

dotenv.config();
if(!process.env.MONGO_URI){
    throw console.error("mongo uri is not present in env");
  
}
const config={
    MONGO_URI:process.env.MONGO_URI
}

module.exports=config;
