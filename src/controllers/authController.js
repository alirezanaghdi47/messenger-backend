// libraries
const express = require("express");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const requestIp = require('request-ip');
const UA = require('ua-parser-js');

// models
const User = require("../models/userModel.js");
const History = require("../models/historyModel.js");

const router = express.Router();

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(409).json({message: "دریافت اطلاعات کاربر از گوگل با مشکل مواجه شده است", status: "failure"});
        }

        const userAgent = new UA(req.get('user-agent'));

        // const response = await fetch(`http://ip-api.com/json/${requestIp.getClientIp(req)}`);
        const response = await fetch("http://ip-api.com/json/2.190.220.28");
        const data = await response.json();

        if (!data) {
            return res.status(409).json({message: "دریافت اطلاعات سیستمی با مشکل مواجه شده است", status: "failure"});
        }

        let user = await User.findOne({email: {$eq: req.user.email}});
        let token;

        if (!user) {
            const newUser = new User({
                avatar: req.user.picture,
                userName: req.user.email.replace("@gmail.com", ""),
                email: req.user.email,
            });
            await newUser.save();

            const newHistory = new History({
                ip: data?.query,
                country: data?.country,
                city: data?.city,
                browser: userAgent?.getResult()?.browser?.name,
                userId: newUser?._id
            });
            await newHistory.save();

            token = jwt.sign({user: newUser}, process.env.JWT_SECRET, {expiresIn: "1d"});
        } else {
            const newHistory = new History({
                ip: data?.query,
                country: data?.country,
                city: data?.city,
                browser: userAgent?.getResult()?.browser?.name,
                userId: user?._id
            });
            await newHistory.save();

            token = jwt.sign({user: user}, process.env.JWT_SECRET, {expiresIn: "1d"});
        }

        res.cookie("token", token, {maxAge: 24 * 60 * 60 * 1000});
        res.redirect(process.env.ORIGIN);
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get('/logout', (req, res) => {
    req.logout(req.user, err => {
        if(err) return next(err);
        res.redirect(process.env.ORIGIN);
    });
});


module.exports = router;