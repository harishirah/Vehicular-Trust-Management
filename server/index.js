const express = require("express");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const socketio = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const {
    generateMessages,
    generateLocationMessage,
    sendKeys,
} = require("./utils/messages");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
    },
});

// app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const trustRoutes = require("./routes/trust");
const { fstat } = require("fs");

app.use("", trustRoutes);

io.on("connection", (socket) => {
    console.log("New Socket User Connected");

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("admin", generateMessages("Admin", "Welcome!"));
        // Send Public/Private Key pair to user by encrypting it with user's public key
        var msg = {
            pK: process.env["PK_" + room],
            sK: process.env["SK_" + room],
        };
        sendKeys(JSON.stringify(msg), username, username).then((keys) => {
            socket.emit("session_key", keys);
        });
        socket.broadcast
            .to(user.room)
            .emit(
                "admin",
                generateMessages(
                    "Admin",
                    user.username.substr(0, 30) + "... has joined the ChatRoom"
                )
            );
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
    });

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit(
            "message",
            generateMessages(user.username, message)
        );

        callback("");
    });

    socket.on("summary", (message, callback) => {
        const data = JSON.parse(message);
        fs.appendFile(
            "summary.txt",
            `${new Date().toLocaleString()}:\t Nature:${data.prob} \t Trust:${
                data.trust
            }\n`,
            function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }
        );
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
            socket.broadcast
                .to(user.room)
                .emit(
                    "admin",
                    generateMessages(
                        "Admin",
                        user.username.substr(0, 30) +
                            "... has left the ChatRoom"
                    )
                );
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
