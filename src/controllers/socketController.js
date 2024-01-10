// libraries
const fs = require("fs");
const path = require("path");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const ffmpeg = require("fluent-ffmpeg");
const ffmpeg_static = require("ffmpeg-static");

// models
const Chat = require("../models/chatModel");
const Group = require("../models/groupModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// utils
const {messageType, chatType} = require("../utils/constants");
const {saveFile, getFileExtension, getFileName, delay} = require("../utils/functions");

const addChat = async (data) => {
    try {
        const {userId, receiverId} = data;

        const chat = await Chat.findOne({participantIds: {$all: [userId, receiverId]}})

        if (chat) return chat;

        const newChat = new Chat({
            type: chatType.user,
            participantIds: [userId, receiverId],
        });
        await newChat.save();

        return newChat;
    } catch (err) {
        console.log(err)
    }
}

const addGroupChat = async (data) => {
    try {
        const {userName, avatar, biography, userId, participantids} = data;

        const newGroup = new Group({
            userName,
            avatar,
            biography
        });
        await newGroup.save();

        const newChat = new Chat({
            type: chatType.group,
            participantIds: [userId, ...participantids],
            groupId: newGroup?._id
        });
        await newChat.save();

        return newChat;
    } catch (err) {
        console.log(err)
    }
}

const getAllChat = async (data) => {
    try {
        const {userId} = data;

        const chats = await Chat.find({
            $and: [
                {participantIds: {$in: [userId]}},
                // {messages: {$exists: true, $not: {$size: 0}}}
            ]
        })
            .sort({createAt: -1})
            .populate("groupId")
            .populate("participantIds")
            .exec();

        return chats;
    } catch (err) {
        console.log(err);
    }
}

const getChat = async (data) => {
    try {
        const {chatId} = data;

        const chat = await Chat.findById(chatId)
            .populate("groupId")
            .populate("participantIds")

        if (!chat) return null;

        return chat
    } catch (err) {
        console.log(err)
    }
}

const deleteChat = async (data) => {
    try {
        const {chatId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat) return;

        await Message.deleteMany({chatId: {$eq: chatId}});
        await Chat.deleteOne({_id: chatId});

        return chat;
    } catch (err) {
        console.log(err);
    }
}

const getAllMessage = async (data) => {
    try {
        const {chatId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat) return;

        const messages = await Message.find({chatId: chatId})
            .populate("userId")
            .exec();

        return messages;
    } catch (err) {
        console.log(err)
    }
}

const addTextMessage = async (data) => {
    try {
        const {text, chatId, senderId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat) return;

        const newMessage = new Message({
            type: messageType.text,
            content: text,
            userId: senderId,
            chatId: chatId
        });
        await newMessage.save();

    } catch (err) {
        console.log(err);
    }
}

const addFileMessage = async (data) => {
    try {
        const {file, chatId, senderId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat || !file) return;

        const fileData = file.data;
        const fileName = `${getFileName(file.name)}-${senderId}-${Date.now()}.${getFileExtension(file.name)}`;
        const fileSize = file.size;
        const filePath = path.resolve("uploads", "file", fileName);

        await saveFile(filePath, fileData);

        const newMessage = new Message({
            type: messageType.file,
            content: process.env.ASSET_URL + "/file/" + fileName,
            name: fileName,
            size: fileSize,
            userId: senderId,
            chatId: chatId
        });
        await newMessage.save();

    } catch (err) {
        console.log(err)
    }
}

const addImageMessage = async (data) => {
    try {
        const {image, chatId, senderId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat || !image) return;

        const fileData = image.data;
        const fileName = `${getFileName(image.name)}-${senderId}-${Date.now()}.${getFileExtension(image.name)}`;
        const fileSize = image.size;
        const filePath = path.resolve("uploads", "image", fileName);

        await saveFile(filePath, fileData);

        const newMessage = new Message({
            type: messageType.image,
            content: process.env.ASSET_URL + "/image/" + fileName,
            name: fileName,
            size: fileSize,
            userId: senderId,
            chatId: chatId
        });
        await newMessage.save();

    } catch (err) {
        console.log(err)
    }
}

const addVideoMessage = async (data) => {
    try {
        const {video, chatId, senderId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat || !video) return;

        const fileData = video.data;
        const fileName = `${getFileName(video.name)}-${senderId}-${Date.now()}.${getFileExtension(video.name)}`;
        const thumbnailName = `${path.parse(video.name).name}-${senderId}-${Date.now()}.png`;
        const fileSize = video.size;
        const filePath = path.resolve("uploads", "video", fileName);
        const thumbnailFolder = path.resolve("uploads", "thumbnail");

        await saveFile(filePath, fileData);

        const fileInfo = await ffprobe(filePath, {path: ffprobeStatic.path});
        const fileDuration = fileInfo.streams[0].duration;

        await ffmpeg(filePath)
            .setFfmpegPath(ffmpeg_static)
            .screenshots({
                timestamps: [Math.floor(fileDuration / 4)],
                filename: thumbnailName,
                folder: thumbnailFolder,
                size: "640x360"
            }).on('end', function () {
                console.log('done');
            });

        const newMessage = new Message({
            type: messageType.video,
            content: process.env.ASSET_URL + "/video/" + fileName,
            duration: fileDuration,
            thumbnail: process.env.ASSET_URL + "/thumbnail/" + thumbnailName,
            name: fileName,
            size: fileSize,
            userId: senderId,
            chatId: chatId
        });
        await delay(100);
        await newMessage.save();

    } catch (err) {
        console.log(err)
    }
}

const addMusicMessage = async (data) => {
    try {
        const {music, chatId, senderId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat || !music) return;

        const fileData = music.data;
        const fileName = `${getFileName(music.name)}-${senderId}-${Date.now()}.${getFileExtension(music.name)}`;
        const fileSize = music.size;
        const filePath = path.resolve("uploads", "music", fileName);

        await saveFile(filePath, fileData);

        const fileInfo = await ffprobe(filePath, {path: ffprobeStatic.path});
        const fileDuration = fileInfo.streams[0].duration;

        const newMessage = new Message({
            type: messageType.music,
            content: process.env.ASSET_URL + "/music/" + fileName,
            name: fileName,
            size: fileSize,
            duration: fileDuration,
            userId: senderId,
            chatId: chatId
        });
        await newMessage.save();

    } catch (err) {
        console.log(err)
    }
}

const deleteMessage = async (data) => {
    try {
        const {messageId} = data;

        const message = await Message.findById(messageId);

        if (!message) return;

        if (message.type === 1) {
            const fileName = path.basename(message?.content);
            const filePath = path.resolve("uploads", "file", fileName);
            await fs.unlinkSync(filePath);
        }

        if (message.type === 2) {
            const fileName = path.basename(message?.content);
            const filePath = path.resolve("uploads", "image", fileName);
            await fs.unlinkSync(filePath);
        }

        if (message.type === 3) {
            const fileName = path.basename(message?.content);
            const filePath = path.resolve("uploads", "music", fileName);
            await fs.unlinkSync(filePath);
        }

        if (message.type === 4) {
            const fileName1 = path.basename(message?.content);
            // const fileName2 = path.basename(message?.thumbnail);
            const filePath1 = path.resolve("uploads", "video", fileName1);
            // const filePath2 = path.resolve("uploads", "thumbnail", fileName2);
            await fs.unlinkSync(filePath1);
            // await fs.unlinkSync(filePath2);
        }

        await Message.deleteOne({_id: messageId});

    } catch (err) {
        console.log(err)
    }
}

const addLocationMessage = async (data) => {
    try {
        const {location, chatId, senderId} = data;

        const chat = await Chat.findById(chatId);

        if (!chat) return;

        const newMessage = new Message({
            type: messageType.location,
            content: location,
            userId: senderId,
            chatId: chatId
        });
        await newMessage.save();

    } catch (err) {
        console.log(err);
    }
}

const getAllUser = async (data) => {
    try {
        const {userId} = data;

        const users = await User.find({_id: {$ne: userId}})
            .sort({createAt: -1})
            .exec();

        return users;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    addChat,
    addGroupChat,
    getAllChat,
    getChat,
    deleteChat,
    getAllMessage,
    addTextMessage,
    addFileMessage,
    addImageMessage,
    addVideoMessage,
    addMusicMessage,
    addLocationMessage,
    deleteMessage,
    getAllUser,
}