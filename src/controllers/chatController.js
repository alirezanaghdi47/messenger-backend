// libraries
const express = require("express");

// middlewares
const {requireAuth} = require("../middlewares/authentication");

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
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getChat", requireAuth, async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid)
            .populate("groupId")
            .populate("participantIds")

        res.status(200).json({data: chat, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addChat", requireAuth, async (req, res) => {
    try {
        const {receiverid} = req.headers;

        if (!isValidObjectId(receiverid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
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
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/addGroupChat", requireAuth, async (req, res) => {
    try {
        const {userName, avatar, biography} = req.body;
        const {participantids} = req.headers;

        for (let i = 0; i < participantsids.length; i++) {
            if (!isValidObjectId(participantsids[i])) {
                return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
            }
        }

        const newGroup = new Group({
            userName,
            avatar,
            biography
        });
        await newGroup.save();

        const newChat = new Chat({
            type: chatType.group,
            participantIds: [res.locals.user._id, ...participantids],
            groupId: newGroup?._id
        });
        await newChat.save();

        res.status(200).json({data: newChat, status: "success"});
    } catch
        (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/deleteChat", requireAuth, async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const chat = await Chat.findById(chatid)
            .populate("participantIds")
            .exec();

        if (!chat) {
            return res.status(409).json({message: "چت با این مشخصات وجود ندارد", status: "failure"});
        }

        await Chat.deleteOne({_id: chatid});
        await Message.deleteMany({chatId: {$eq: chatid}});

        res.status(200).json({data: chat, message: "چت حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;