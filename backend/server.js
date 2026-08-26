require('dotenv').config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app.js");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",   // hackathon ke liye theek hai, production mein specific origin do
  },
});

// io ko app ke andar bhi accessible banao, taaki controllers use kar saken
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Frontend connect hote hi apna jurisdiction room join karega
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB, server not started:", error.message);
    process.exit(1);
  }
};

startServer();