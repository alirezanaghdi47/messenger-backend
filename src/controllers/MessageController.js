// libraries
const path = require("path");
const fs = require("fs");
const express = require("express");

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication");

// models
const Message = require("../models/messageModel.js");
const Chat = require("../models/chatModel.js");

// utils
const {isValidObjectId} = require("../utils/functions");
const {messageType} = require("../utils/constants");

const router = express.Router();

router.get("/getAllMessage", requireAuth, async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        const messages = await Message.find({chatId: chatid})
            .populate("userId")
            .exec();

        res.status(200).json({data: messages, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addTextMessage", requireAuth, async (req, res) => {
    try {
        const {text} = req.body;
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        const newMessage = new Message({
            type: messageType.text,
            content: text,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        res.status(200).json({message: "متن ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addFileMessage", [requireAuth, upload.single("file")], async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        if (!req.file) {
            return res.status(404).json({message: "فایل ارسال نشد", status: "failure"});
        }

        const fileName = `${req.file.filename}-${Date.now()}`;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads" , "file", fileName);

        fs.renameSync(oldFilePath, newFilePath);

        const newMessage = new Message({
            type: messageType.file,
            content: process.env.ASSET_URL + "/file/" + fileName,
            name: fileName,
            size: fileSize,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        res.status(200).json({message: "فایل ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addImageMessage", [requireAuth, upload.single("image")], async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        if (!req.file) {
            return res.status(404).json({message: "عکس ارسال نشد", status: "failure"});
        }

        const fileName = `${req.file.filename}-${Date.now()}`;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads" , "image", fileName);

        fs.renameSync(oldFilePath, newFilePath);

        const newMessage = new Message({
            type: messageType.image,
            content: process.env.ASSET_URL + "/image/" + fileName,
            name: fileName,
            size: fileSize,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        res.status(200).json({message: "عکس ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addVideoMessage", [requireAuth, upload.single("video")], async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        if (!req.file) {
            return res.status(404).json({message: "ویدیو ارسال نشد", status: "failure"});
        }

        const fileName = `${req.file.filename}-${Date.now()}`;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads" , "video", fileName);

        fs.renameSync(oldFilePath, newFilePath);

        const newMessage = new Message({
            type: messageType.video,
            content: process.env.ASSET_URL + "/video/" + fileName,
            name: fileName,
            size: fileSize,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        res.status(200).json({message: "ویدیو ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addMusicMessage", [requireAuth, upload.single("music")], async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        if (!req.file) {
            return res.status(404).json({message: "موسیقی ارسال نشد", status: "failure"});
        }

        const fileName = `${req.file.filename}-${Date.now()}`;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads" , "music", fileName);

        fs.renameSync(oldFilePath, newFilePath);

        const newMessage = new Message({
            type: messageType.music,
            content: process.env.ASSET_URL + "/music/" + fileName,
            name: fileName,
            size: fileSize,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        res.status(200).json({message: "موسیقی ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addLocationMessage", requireAuth, async (req, res) => {
    try {
        const {location} = req.body;
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({message: "گفتگویی با این مشخصات وجود ندارد", status: "failure"});
        }

        const newMessage = new Message({
            type: messageType.location,
            content: location,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        res.status(200).json({message: "موقعیت مکانی ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/deleteMessage", requireAuth, async (req, res) => {
    try {
        const {messageid} = req.headers;

        if (!isValidObjectId(messageid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const message = await Message.findById(messageid);

        if (!message) {
            return res.status(409).json({message: "پیامی با این مشخصات وجود ندارد", status: "failure"});
        }

        if (message.type !== 0 && message.type !== 5) {
            const fileName = path.basename(message?.content);
            let filePath;

            if (message.type === 1) filePath = path.resolve("uploads" , "file" , fileName);
            if (message.type === 2) filePath = path.resolve("uploads" , "image" , fileName);
            if (message.type === 3) filePath = path.resolve("uploads" , "music" , fileName);
            if (message.type === 4) filePath = path.resolve("uploads" , "video" , fileName);

            await fs.unlinkSync(filePath);
        }

        await Message.deleteOne({_id: messageid});

        res.status(200).json({message: "چت حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;