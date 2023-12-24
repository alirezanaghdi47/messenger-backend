// libraries
const path = require("path");
const express = require("express");
const fs = require("fs");
const sharp = require('sharp');

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication");

// models
const User = require("../models/userModel.js");

const router = express.Router();

router.get("/getAllUser", requireAuth, async (req, res) => {
    try {
        const users = await User.find({_id: {$ne: res.locals.user._id}})
            .sort({createAt: -1})
            .exec();

        res.status(200).json({data: users, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getUser", requireAuth, async (req, res) => {
    try {
        const {userid} = req.body;

        const user = await User.findById(userid)
            .exec();

        res.status(200).json({data: user, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editProfile", [requireAuth, upload.single("avatar")], async (req, res) => {
    try {
        const {preview , userName, biography} = req.body;

        let avatarPath = preview;

        if (req.file) {

            if (avatarPath) {
                const fileName = path.basename(avatarPath);
                const filePath = path.resolve("uploads" , "avatar" , fileName);
                await fs.unlinkSync(filePath);
            }

            const fileName = `${res.locals.user._id}-${req.file.filename}`;
            const oldFilePath = req.file.path;
            const newFilePath = path.resolve("uploads" , "avatar", fileName);

            await sharp(oldFilePath)
                .resize({width: 240, height: 240, fit: "cover"})
                .toFile(newFilePath);

            await fs.unlinkSync(oldFilePath);

            avatarPath = process.env.ASSET_URL + "/avatar/" + fileName;
        }

        await User.findOneAndUpdate(
            {_id: res.locals.user._id},
            {
                avatar: avatarPath,
                userName,
                biography,
            },
            {new: true}
        );

        const result = {
            avatar: avatarPath,
            userName,
            biography,
        };

        res.status(200).json({data: result, message: "پروفایل اصلاح شد", status: "success"});
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editLanguage", requireAuth, async (req, res) => {
    try {
        const {language} = req.body;

        await User.findOneAndUpdate(
            {_id: res.locals.user._id},
            {language},
            {new: true}
        );

        res.status(200).json({data: language, message: "زبان اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editColor", requireAuth, async (req, res) => {
    try {
        const {color} = req.body;

        await User.findOneAndUpdate(
            {_id: res.locals.user._id},
            {color},
            {new: true}
        );

        res.status(200).json({data: color, message: "رنگ اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editBackground", requireAuth, async (req, res) => {
    try {
        const {background} = req.body;

        await User.findOneAndUpdate(
            {_id: res.locals.user._id},
            {background},
            {new: true}
        );

        res.status(200).json({data: background, message: "رنگ اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editFontSize", requireAuth, async (req, res) => {
    try {
        const {fontSize} = req.body;

        await User.findOneAndUpdate(
            {_id: res.locals.user._id},
            {fontSize},
            {new: true}
        );

        res.status(200).json({data: fontSize, message: "رنگ اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editTheme", requireAuth, async (req, res) => {
    try {
        const {darkMode} = req.body;

        await User.findOneAndUpdate(
            {_id: res.locals.user._id},
            {darkMode},
            {new: true}
        );

        res.status(200).json({data: darkMode, message: "تم اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;