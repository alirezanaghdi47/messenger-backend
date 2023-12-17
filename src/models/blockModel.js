// libraries
const mongoose = require("mongoose");

const blockSchema = mongoose.Schema({
    participantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Block = mongoose.model("Block", blockSchema);

module.exports = Block;