// libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const limiter = require("../middlewares/rateLimit");

// models
const User = require("../models/userModel.js");
const Session = require("../models/sessionModel.js");

const router = express.Router();

router.post("/register", limiter, async (req, res) => {
    try {
        const {userName, phoneNumber} = req.body;

        const user = await User.findOne({phoneNumber: {$eq: phoneNumber}});

        if (user) {
            return res.status(200).json({message: res.__("userDuplicate"), status: "failure"});
        }

        const newUser = new User({userName, phoneNumber});
        await newUser.save();

        res.status(200).json({message: res.__("userRegistered"), status: "success"});
    } catch (err) {
        if (err.code === 11000 && err.keyPattern.userName === 1) {
            return res.status(200).json({message: res.__("userDuplicate"), status: "failure"});
        }

        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.post("/login", limiter, async (req, res) => {
    try {
        const {phoneNumber} = req.body;

        const user = await User.findOne({phoneNumber: {$eq: phoneNumber}});

        if (!user) {
            return res.status(200).json({message: res.__("userNotFound"), status: "failure"});
        }

        const randomNumber = Math.floor(100000 + Math.random() * 900000);

        // send sms
        const smsResponse = await fetch("https://api.sms.ir/v1/send/verify", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain',
                'x-api-key': process.env.SMS_KEY
            },
            body: JSON.stringify({
                "mobile": phoneNumber,
                "templateId": 587284,
                "parameters": [
                    {
                        "name": "Code",
                        "value": randomNumber.toString()
                    }
                ]
            })
        });

        const newSession = new Session({
            status: 0,
            content: randomNumber.toString(),
            expire: Math.floor((Date.now() / 1000) + (2 * 60)),
            userId: user?._id,
        });
        await newSession.save();

        res.status(200).json({
            data: {expire: newSession.expire, userId: user._id},
            message: res.__("verifyCodeSent"),
            status: "success"
        });
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.post("/verifyUser", limiter, async (req, res) => {
    try {
        const {code} = req.body;
        const {expire, userid} = req.headers;

        if (req.rateLimit.remaining === 0){
            return res.status(200).json({message: res.__("rateLimiter"), status: "failure"});
        }

        const user = await User.findById(userid);

        if (!user) {
            return res.status(200).json({message: res.__("userNotFound"), status: "failure"});
        }

        if (Math.floor(Date.now() / 1000) > expire) {
            return res.status(200).json({message: res.__("verifyCodeIsNotValid"), status: "failure"});
        }

        const session = await Session.findOne({
            $and: [
                {status: {$eq: 0}},
                {content: {$eq: code}},
                {expire: {$eq: expire}},
            ]
        });

        if (!session) {
            return res.status(200).json({message: res.__("sessionIsNotValid"), status: "failure"});
        }

        const token = jwt.sign(JSON.parse(JSON.stringify(user)), process.env.JWT_SECRET, {expiresIn: "1d"});

        await Session.deleteOne({_id: session._id});

        res.status(200).json({data: token, message: res.__("userEntered"), status: "success"});
    } catch (err) {
        console.log(err)
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

module.exports = router;