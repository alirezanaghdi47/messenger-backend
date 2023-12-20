// libraries
const path = require("path");
const express = require("express");
const fs = require("fs");
const sharp = require('sharp');
const {PutObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");

// middlewares
const {upload, client} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication");

// models
const User = require("../models/userModel.js");

const router = express.Router();

router.put("/editProfile", [requireAuth, upload.single("avatar")], async (req, res) => {
    try {
        const {preview , userName, biography} = req.body;

        let avatarPath = preview;

        if (req.file) {
            const fileName = `avatar-compressed-${res.locals.user._id}-${req.file.filename.replace(path.extname(req.file.filename), ".webp")}`;
            const filePath = path.resolve("uploads", fileName);

            await sharp(req.file.path)
                .toFormat("webp")
                .resize({width: 240, height: 240, fit: "cover"})
                .toFile(filePath);

            if (avatarPath) {
                const fileName = path.basename(avatarPath);

                const params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: "avatar/" + fileName,
                };

                await client.send(new DeleteObjectCommand(params));
            }

            avatarPath = path.join(process.env.ASSETS_URL, "avatar" ,fileName);

            const params = {
                Body: fs.readFileSync(filePath),
                Bucket: process.env.BUCKET_NAME,
                Key: "avatar/" + fileName,
            };

            await client.send(new PutObjectCommand(params));

            await fs.unlinkSync(req.file.path);
            await fs.unlinkSync(filePath);
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