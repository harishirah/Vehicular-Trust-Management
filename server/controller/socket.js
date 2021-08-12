const { io } = require("../index");
const {
  generateMessages,
  generateLocationMessage,
} = require("../utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("../utils/users");

io.on("connection", (socket) => {
  console.log("New Socket User Connected");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("message", generateMessages("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessages(user.username + " has joined the ChatRoom")
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessages(user.username, message));

    callback("");
  });

  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        "https://google.com/maps?q=" + latitude + "," + longitude
      )
    );

    callback("");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessages("Admin", user.username + " has left the ChatRoom")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
