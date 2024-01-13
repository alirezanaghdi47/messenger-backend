// libraries
const path = require("path");
const fs = require("fs");
const express = require("express");
const sharp = require("sharp");

// middlewares
const {requireAuth} = require("../middlewares/authentication");
const {upload} = require("../middlewares/upload");

// models
const Chat = require("../models/chatModel.js");
const Group = require("../models/groupModel.js");
const Message = require("../models/messageModel.js");

// utils
const {isValidObjectId} = require("../utils/functions");
const {chatType} = require("../utils/constants");

const router = express.Router();

router.get("/getAllChat", requireAuth, async (req, res) => {
    try {
        const chats = await Chat.find({
            $and: [
                {participantIds: {$in: [res.locals.user._id]}},
                // {messages: {$exists: true, $not: {$size: 0}}}
            ]
        })
            .sort({createAt: -1})
            .populate("groupId")
            .populate("participantIds")
            .exec();

        res.status(200).json({data: chats, status: "success"});
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.get("/getChat", requireAuth, async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({status: "failure"});
        }

        const chat = await Chat.findById(chatid)
            .populate("groupId")
            .populate("participantIds")

        res.status(200).json({data: chat, status: "success"});
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.post("/addChat", requireAuth, async (req, res) => {
    try {
        const {receiverid} = req.body;

        if (!isValidObjectId(receiverid)) {
            return res.status(409).json({status: "failure"});
        }

        const chat = await Chat.findOne({participantIds: {$all: [res.locals.user._id, receiverid]}})
            .populate("participantIds")
            .exec();

        if (chat) {
            return res.status(200).json({data: null, status: "success"});
        }

        const newChat = new Chat({
            type: chatType.user,
            participantIds: [res.locals.user._id, receiverid],
        });
        await newChat.save();

        const newChat2 = await Chat.findById(newChat._id)
            .populate("participantIds")
            .exec();

        res.status(200).json({data: newChat2, status: "success"});
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.post("/addGroup", [requireAuth, upload.single("avatar")], async (req, res) => {
    try {
        const {name, description, receiverIds} = req.body;

        for (let i = 0; i < receiverIds.length; i++) {
            if (!isValidObjectId(receiverIds[i])) {
                return res.status(409).json({status: "failure"});
            }
        }

        let avatarPath;

        if (req.file) {

            if (avatarPath) {
                const fileName = path.basename(avatarPath);
                const filePath = path.resolve("uploads" , "avatar" , fileName);

                if (fs.existsSync(filePath)){
                    await fs.unlinkSync(filePath);
                }
            }

            const fileName = req.file.filename;
            const oldFilePath = req.file.path;
            const newFilePath = path.resolve("uploads" , "avatar", fileName);

            await sharp(oldFilePath)
                .resize({width: 240, height: 240, fit: "cover"})
                .toFile(newFilePath);

            await fs.unlinkSync(oldFilePath);

            avatarPath = process.env.ASSET_URL + "/avatar/" + fileName;

        }

        const newGroup = new Group({
            name,
            avatar: avatarPath,
            description
        });
        await newGroup.save();

        const newChat = new Chat({
            type: chatType.group,
            participantIds: [res.locals.user._id, ...receiverIds],
            groupId: newGroup?._id
        });
        await newChat.save();

        const newChat2 = await Chat.findById(newChat._id)
            .populate("groupId")
            .populate("participantIds")
            .exec();

        res.status(200).json({data: newChat2, status: "success"});
    } catch (err) {
        console.log(err);
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.delete("/deleteChat", requireAuth, async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({status: "failure"});
        }

        const chat = await Chat.findById(chatid)
            .populate("participantIds")
            .exec();

        if (!chat) {
            return res.status(409).json({status: "failure"});
        }

        if (chat?.groupId){
            await Group.deleteOne({_id: chat?.groupId});
        }

        await Chat.deleteOne({_id: chatid});
        await Message.deleteMany({chatId: {$eq: chatid}});

        res.status(200).json({data: chat, status: "success"});
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

module.exports = router;