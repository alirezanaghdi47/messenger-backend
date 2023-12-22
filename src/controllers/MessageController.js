// libraries
const path = require("path");
const fs = require("fs");
const express = require("express");
const {PutObjectCommand} = require("@aws-sdk/client-s3");

// middlewares
const {upload, client} = require("../middlewares/upload.js");
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

        const fileName = `file-${res.locals.user._id}-${req.file.filename}`;
        const fileSize = req.file.size;
        const filePath = req.file.path;
        const localFilePath = path.resolve("uploads", fileName);
        const globalFilePath = path.join(process.env.ASSETS_URL, "file", fileName);

        const params = {
            Body: fs.readFileSync(localFilePath),
            Bucket: process.env.BUCKET_NAME,
            Key: "file/" + globalFilePath,
        };

        await client.send(new PutObjectCommand(params));

        await fs.unlinkSync(filePath);
        await fs.unlinkSync(localFilePath);

        const newMessage = new Message({
            type: messageType.file,
            content: globalFilePath,
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

        const fileName = `image-${res.locals.user._id}-${req.file.filename}`;
        const fileSize = req.file.size;
        const filePath = req.file.path;
        const localFilePath = path.resolve("uploads", fileName);
        const globalFilePath = path.join(process.env.ASSETS_URL, "image", fileName);

        const params = {
            Body: fs.readFileSync(localFilePath),
            Bucket: process.env.BUCKET_NAME,
            Key: "image/" + globalFilePath,
        };

        await client.send(new PutObjectCommand(params));

        await fs.unlinkSync(filePath);
        await fs.unlinkSync(localFilePath);

        const newMessage = new Message({
            type: messageType.image,
            content: globalFilePath,
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

        const fileName = `video-${res.locals.user._id}-${req.file.filename}`;
        const fileSize = req.file.size;
        const filePath = req.file.path;
        const localFilePath = path.resolve("uploads", fileName);
        const globalFilePath = path.join(process.env.ASSETS_URL, "video", fileName);

        const params = {
            Body: fs.readFileSync(localFilePath),
            Bucket: process.env.BUCKET_NAME,
            Key: "video/" + globalFilePath,
        };

        await client.send(new PutObjectCommand(params));

        await fs.unlinkSync(filePath);
        await fs.unlinkSync(localFilePath);

        const newMessage = new Message({
            type: messageType.video,
            content: globalFilePath,
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

        const fileName = `music-${res.locals.user._id}-${req.file.filename}`;
        const fileSize = req.file.size;
        const filePath = req.file.path;
        const localFilePath = path.resolve("uploads", fileName);
        const globalFilePath = path.join(process.env.ASSETS_URL, "music", fileName);

        const params = {
            Body: fs.readFileSync(localFilePath),
            Bucket: process.env.BUCKET_NAME,
            Key: "music/" + globalFilePath,
        };

        await client.send(new PutObjectCommand(params));

        await fs.unlinkSync(filePath);
        await fs.unlinkSync(localFilePath);

        const newMessage = new Message({
            type: messageType.music,
            content: globalFilePath,
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
        const {messageid} = req.header;

        if (!isValidObjectId(messageid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const message = await Message.findById(messageid);

        if (!message) {
            return res.status(409).json({message: "پیامی با این مشخصات وجود ندارد", status: "failure"});
        }

        await Message.deleteOne({_id: messageid});

        res.status(200).json({message: "چت حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;