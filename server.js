// libraries
require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
    maxHttpBufferSize: 1e8, // 100MB
    cors: {
        origin: process.env.ORIGIN
    }
});
const {I18n} = require("i18n");

const i18n = new I18n({
    locales: ["fa" , "en"],
    directory: path.join(__dirname , "src" , "locales"),
    defaultLocale: "fa",
})

// controllers
const authController = require("./src/controllers/authController.js");
const userController = require("./src/controllers/userController.js");
const chatController = require("./src/controllers/chatController.js");
const messageController = require("./src/controllers/messageController.js");

// middlewares
app.use(cors({"origin": process.env.ORIGIN}));
app.use('/uploads', express.static(process.cwd() + '/uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(i18n.init);
// app.use(function (req, res, next){
//    i18n.setLocale(req, req.headers["language"]);
//    next();
// });

// routes
app.use("/api/auth", authController);
app.use("/api/user", userController);
app.use("/api/message", messageController);
app.use("/api/chat", chatController);

// connecting to database
require("./src/utils/database.js");

// connecting to server
http.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});

let activeUsers = [];

// connecting to socket
io.on('connection', (socket) => {

    socket.on("online", async (data) => {
        socket.join(data.userId);
        activeUsers = activeUsers.filter(user => user.userId !== data.userId);
        activeUsers.push(data);
        io.emit('activeUsersResponse', activeUsers);
    });

    socket.on("offline", async (data) => {
        socket.leave(data.userId);
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        io.emit('activeUsersResponse', activeUsers);
        socket.disconnect();
    });

    socket.on("addChat", async (data) => {
        activeUsers.filter(user => data.receiverIds.includes(user.userId)).map(item => {
            socket.to(item.socketId).emit("addChatResponse", data.chat);
        });
    });

    socket.on("joinGroup", async (data) => {
        activeUsers.filter(user => data.receiverIds.includes(user.userId)).map(item => {
            socket.to(item.socketId).emit("joinGroupResponse", data.chat);
        });
    });

    socket.on("leaveGroup", async (data) => {
        activeUsers.filter(user => data.receiverIds.includes(user.userId)).map(item => {
            socket.to(item.socketId).emit("leaveGroupResponse", data.chat);
        });
    });

    socket.on("deleteChat", async (data) => {
        activeUsers.filter(user => data.receiverIds.includes(user.userId)).map(item => {
            socket.to(item.socketId).emit("deleteChatResponse", data.chat?._id);
        });
    });

    socket.on("addMessage", async (data) => {
        socket.to(data.chatId).emit("addMessageResponse", data.message);
    });

    socket.on("deleteMessage", async (data) => {
        socket.to(data.chatId).emit("deleteMessageResponse", data.messageId);
    });

    socket.on("joinRoom", data => {
        socket.join(data.chatId);
    });

    socket.on("leaveRoom", data => {
        socket.leave(data.chatId);
    });

    socket.on("startTyping", data => {
        socket.to(data.chatId).emit("startTypingResponse", data);
    });

    socket.on("stopTyping", data => {
        socket.to(data.chatId).emit("stopTypingResponse", data);
    });

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        io.emit('activeUsersResponse', activeUsers);
        socket.disconnect();
    });

});