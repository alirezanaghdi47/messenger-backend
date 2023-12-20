// libraries
const express = require("express");

// middlewares
const {requireAuth} = require("../middlewares/authentication");

// models
const Block = require("../models/blockModel");

// utils
const {isValidObjectId} = require("../utils/functions");

const router = express.Router();

router.post("/addBlockUser", requireAuth, async (req, res) => {
    try {
        const {userid} = req.headers;

        const newBlock = new Block({
            participantId: userid,
            userId: res.locals.user._id
        });
        await newBlock.save();

        res.status(200).json({message: "کاربر مسدود شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/deleteBlockUser", requireAuth, async (req, res) => {
    try {
        const {userid} = req.headers;

        if (!isValidObjectId(userid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const block = await Block.findOne({
            $and: [
                {userId: {$eq: res.locals.user._id}},
                {participantId: {$eq: userid}}
            ]
        });

        if (!block) {
            return res.status(409).json({message: "کاربری با این مشخصات مسدود نمی باشد", status: "failure"});
        }

        await Block.deleteOne({_id: block._id });

        res.status(200).json({message: "کاربر آزاد شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getAllBlockUser", requireAuth, async (req, res) => {
    try {
        const blockedUsers = await Block.find({userId: res.locals.user._id})
            .sort({'createdAt': -1})
            .exec();

        res.status(200).json({data: blockedUsers});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;