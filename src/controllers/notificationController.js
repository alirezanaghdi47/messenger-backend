// libraries
const express = require("express");
const webPush = require("web-push");

webPush.setVapidDetails(
    "https://localhost:3000",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
)

let subscriptions = [];

const router = express.Router();

router.post("/subscribe", async (req, res) => {
    try {

    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.post("/sendNotification", async (req, res) => {
    try {

    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

module.exports = router;