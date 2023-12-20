// libraries
const express = require("express");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// models
const User = require("../models/userModel.js");

const router = express.Router();

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(409).json({message: "دریافت اطلاعات کاربر از گوگل با مشکل مواجه شده است", status: "failure"});
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

            token = jwt.sign({user: newUser}, process.env.JWT_SECRET, {expiresIn: "1d"});
        } else {
            token = jwt.sign({user: user}, process.env.JWT_SECRET, {expiresIn: "1d"});
        }

        res.cookie("token", token, {maxAge: 24 * 60 * 60 * 1000});
        res.redirect(process.env.ORIGIN);
    } catch (err) {
        console.log(err)
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