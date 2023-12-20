// libraries
const express = require("express");

// middlewares
const {requireAuth} = require("../middlewares/authentication");

// models
const History = require("../models/historyModel.js");

const router = express.Router();

router.get("/getAllLoginHistory", requireAuth, async (req, res) => {
    try {
       const loginHistories = await History.find({userId: res.locals.user._id})
            .sort({'createdAt': -1})
            .exec();

        res.status(200).json({data:loginHistories});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;