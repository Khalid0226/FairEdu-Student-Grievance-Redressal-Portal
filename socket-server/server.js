const io = require("socket.io")(4000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

console.log("🚀 Socket Server running on port 4000...");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1. Join a specific room based on Report ID
  socket.on("join_chat", (reportId) => {
    socket.join(reportId);
    console.log(`User ${socket.id} joined Report Room: ${reportId}`);
  });

  // 2. Message sirf usi room mein bhejna
  socket.on("send_message", (data) => {
    console.log("New Message for Room:", data.chatId, data.text);
    // 'to(data.chatId)' se message sirf us report ke logon ko jayega
    socket.to(data.chatId).emit("receive_message", data);
  });

  // 3. Typing status bhi sirf room mein dikhegi
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("display_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});