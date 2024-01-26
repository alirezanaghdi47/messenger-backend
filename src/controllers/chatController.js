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
        const {receiverId} = req.body;

        if (!isValidObjectId(receiverId)) {
            return res.status(409).json({status: "failure"});
        }

        const chat = await Chat.findOne({participantIds: {$all: [res.locals.user._id, receiverId]}})
            .populate("participantIds")
            .exec();

        if (chat) {
            return res.status(200).json({data: null, status: "success"});
        }

        const newChat = new Chat({
            type: chatType.user,
            participantIds: [res.locals.user._id, receiverId],
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

router.post("/addGroupChat", [requireAuth, upload.single("avatar")], async (req, res) => {
    try {
        const {name, description} = req.body;

        let avatarPath;

        if (req.file) {

            if (avatarPath) {
                const fileName = path.basename(avatarPath);
                const filePath = path.resolve("uploads", "avatar", fileName);

                if (fs.existsSync(filePath)) {
                    await fs.unlinkSync(filePath);
                }
            }

            const fileName = req.file.filename;
            const oldFilePath = req.file.path;
            const newFilePath = path.resolve("uploads", "avatar", fileName);

            await sharp(oldFilePath)
                .resize({width: 240, height: 240, fit: "cover"})
                .toFile(newFilePath);

            if (fs.existsSync(oldFilePath)) {
                await fs.unlinkSync(oldFilePath);
            }

            avatarPath = process.env.ASSET_URL + "/avatar/" + fileName;
        }

        const newGroup = new Group({
            name,
            avatar: avatarPath,
            description,
            adminId: res.locals.user._id
        });
        await newGroup.save();

        const newChat = new Chat({
            type: chatType.group,
            groupId: newGroup?._id,
            participantIds: [res.locals.user._id],
        });
        await newChat.save();

        const newChat2 = await Chat.findById(newChat._id)
            .populate("groupId")
            .populate("participantIds")
            .exec();

        res.status(200).json({data: newChat2, status: "success"});
    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({message: res.__("groupNameDuplicate"), status: "failure"});
        }

        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.put("/joinGroupChat", requireAuth, async (req, res) => {
    try {
        const {receiverIds} = req.body;
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({status: "failure"});
        }

        await Chat.findOneAndUpdate(
            {_id: chatid},
            {participantIds: [...chat.participantIds.filter(userId => !receiverIds?.map(user => user._id).includes(userId.toString())), ...receiverIds?.map(user => user._id)]},
            {new: true}
        );

        const chat2 = await Chat.findById(chatid)
            .populate("groupId")
            .populate("participantIds")
            .exec();

        res.status(200).json({data: chat2, status: "success"});
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.put("/leaveGroupChat", requireAuth, async (req, res) => {
    try {
        const {chatid} = req.headers;

        if (!isValidObjectId(chatid)) {
            return res.status(409).json({status: "failure"});
        }

        const chat = await Chat.findById(chatid);

        if (!chat) {
            return res.status(409).json({status: "failure"});
        }

        const chat2 = await Chat.findOneAndUpdate(
            {_id: chatid},
            {participantIds: chat.participantIds.filter(userId => userId.toString() !== res.locals.user._id.toString())},
            {new: true}
        )
            .populate("groupId")
            .populate("participantIds")
            .exec();

        res.status(200).json({data: chat2, status: "success"});
    } catch (err) {
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
            .populate("groupId")
            .populate("participantIds")
            .exec();

        if (!chat) {
            return res.status(409).json({status: "failure"});
        }

        if (chat?.groupId) {
            if (chat?.groupId?.avatar) {
                const fileName = path.basename(chat?.groupId?.avatar);
                const filePath = path.resolve("uploads", "avatar", fileName);

                if (fs.existsSync(filePath)) {
                    await fs.unlinkSync(filePath);
                }
            }

            await Group.deleteOne({_id: chat?.groupId?._id});
        }

        const messages = await Message.find({chatId: chatid}).exec();

        for (let i = 0; i < messages.length; i++) {
            if (messages[i].type === 1) {
                const fileName = path.basename(messages[i]?.content);
                const filePath = path.resolve("uploads", "file", fileName);

                if (fs.existsSync(filePath)) {
                    await fs.unlinkSync(filePath);
                }
            }

            if (messages[i].type === 2) {
                const fileName = path.basename(messages[i]?.content);
                const filePath = path.resolve("uploads", "image", fileName);

                if (fs.existsSync(filePath)) {
                    await fs.unlinkSync(filePath);
                }
            }

            if (messages[i].type === 3) {
                const fileName = path.basename(messages[i]?.content);
                const filePath = path.resolve("uploads", "music", fileName);

                if (fs.existsSync(filePath)) {
                    await fs.unlinkSync(filePath);
                }
            }

            if (messages[i].type === 4) {
                const fileName1 = path.basename(messages[i]?.content);
                const fileName2 = path.basename(messages[i]?.thumbnail);
                const filePath1 = path.resolve("uploads", "video", fileName1);
                const filePath2 = path.resolve("uploads", "thumbnail", fileName2);

                if (fs.existsSync(filePath1)) {
                    await fs.unlinkSync(filePath1);
                }

                if (fs.existsSync(filePath2)) {
                    await fs.unlinkSync(filePath2);
                }
            }
        }

        await Chat.deleteOne({_id: chatid});
        await Message.deleteMany({chatId: {$eq: chatid}});

        res.status(200).json({data: chat, status: "success"});
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

module.exports = router;