// libraries
const express = require("express");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const requestIp = require('request-ip');
const UA1 = require('ua-parser-js');
const UA2 = require('user-agents');

// models
const User = require("../models/userModel.js");
const History = require("../models/historyModel.js");
const Setting = require("../models/settingModel");
const Privacy = require("../models/privacyModel.js");

const router = express.Router();

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/google/callback', passport.authenticate('google'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(409).json({
                message: "دریافت اطلاعات کاربر از گوگل با مشکل مواجه شده است",
                status: "failure"
            });
        }

        const userAgent1 = new UA1(req.get('user-agent'));
        const userAgent2 = new UA2(req.get('user-agent'));

        // const ipLocationResponse = await fetch(`http://ip-api.com/json/${requestIp.getClientIp(req)}`);
        const ipLocationResponse = await fetch("http://ip-api.com/json/2.190.220.28");
        const ipLocationData = await ipLocationResponse.json();

        if (!ipLocationData) {
            return res.status(409).json({
                message: "دریافت اطلاعات سیستمی با مشکل مواجه شده است",
                status: "failure"
            });
        }

        let user = await User.findOne({email: {$eq: req.user.email}});
        let token;

        if (!user) {
            const newSetting = new Setting();
            await newSetting.save();

            const newPrivacy = new Privacy();
            await newPrivacy.save();

            const newUser = new User({
                avatar: req.user.picture,
                userName: req.user.email.replace("@gmail.com", ""),
                email: req.user.email,
                settingId: newSetting?._id,
                privacyId: newPrivacy?._id,
            });
            await newUser.save();

            const newHistory = new History({
                ip: ipLocationData?.query,
                country: ipLocationData?.country,
                city: ipLocationData?.city,
                browser: userAgent1?.getResult()?.browser?.name,
                device: userAgent2?.data?.deviceCategory,
                userId: newUser?._id
            });
            await newHistory.save();

            token = jwt.sign({user: newUser}, process.env.JWT_SECRET, {expiresIn: "1d"});
        } else {
            const newHistory = new History({
                ip: ipLocationData?.query,
                country: ipLocationData?.country,
                city: ipLocationData?.city,
                browser: userAgent1?.getResult()?.browser?.name,
                device: userAgent2?.data?.deviceCategory,
                userId: user?._id
            });
            await newHistory.save();

            token = jwt.sign({user: user}, process.env.JWT_SECRET, {expiresIn: "1d"});
        }

        res.status(200).json({data: token, message: "خوش آمدید", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


module.exports = router;