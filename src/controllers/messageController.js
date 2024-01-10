// libraries
const path = require("path");
const fs = require("fs");
const express = require("express");
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

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

        const message = await Message.findById(newMessage._id)
            .populate("userId")
            .exec();

        res.status(200).json({data: message, message: "متن ارسال شد", status: "success"});
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

        const fileName = req.file.filename;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads", "file", fileName);

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

        const message = await Message.findById(newMessage._id)
            .populate("userId")
            .exec();

        res.status(200).json({data: message, message: "فایل ارسال شد", status: "success"});
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

        const fileName = req.file.filename;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads", "image", fileName);

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

        const message = await Message.findById(newMessage._id)
            .populate("userId")
            .exec();

        res.status(200).json({data: message, message: "عکس ارسال شد", status: "success"});
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

        const fileName = req.file.filename;
        const fileSize = req.file.size;
        const fileThumbnailName = path.parse(fileName).name + ".png";
        const fileThumbnailFolder = path.resolve("uploads", "thumbnail");
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads", "video", fileName);

        await fs.renameSync(oldFilePath, newFilePath);

        const fileInfo = await ffprobe(newFilePath, {path: ffprobeStatic.path});
        const fileDuration = fileInfo.streams[0].duration;

        await ffmpeg(newFilePath)
            .setFfmpegPath(ffmpeg_static)
            .screenshots({
                timestamps: [Math.floor(fileDuration / 4)],
                filename: fileThumbnailName,
                folder: fileThumbnailFolder,
                size: "640x360"
            }).on('end', function () {
                console.log('done');
            });

        const newMessage = new Message({
            type: messageType.video,
            content: process.env.ASSET_URL + "/video/" + fileName,
            name: fileName,
            size: fileSize,
            duration: fileDuration,
            thumbnail: process.env.ASSET_URL + "/thumbnail/" + fileThumbnailName,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        const message = await Message.findById(newMessage._id)
            .populate("userId")
            .exec();

        res.status(200).json({data: message, message: "ویدیو ارسال شد", status: "success"});
    } catch (err) {
        console.log(err);
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

        const fileName = req.file.filename;
        const fileSize = req.file.size;
        const oldFilePath = req.file.path;
        const newFilePath = path.resolve("uploads", "music", fileName);

        await fs.renameSync(oldFilePath, newFilePath);

        const fileInfo = await ffprobe(newFilePath, {path: ffprobeStatic.path});
        const fileDuration = fileInfo.streams[0].duration;

        const newMessage = new Message({
            type: messageType.music,
            content: process.env.ASSET_URL + "/music/" + fileName,
            name: fileName,
            size: fileSize,
            duration: fileDuration,
            userId: res.locals.user._id,
            chatId: chatid
        });
        await newMessage.save();

        const message = await Message.findById(newMessage._id)
            .populate("userId")
            .exec();

        res.status(200).json({data: message, message: "موسیقی ارسال شد", status: "success"});
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

        const message = await Message.findById(messageid)
            .populate("userId")
            .exec();

        if (!message) {
            return res.status(409).json({message: "پیامی با این مشخصات وجود ندارد", status: "failure"});
        }

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

        await Message.deleteOne({_id: messageid});

        res.status(200).json({data: message, message: "چت حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;