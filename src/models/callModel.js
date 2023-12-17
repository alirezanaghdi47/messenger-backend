// libraries
const mongoose = require("mongoose");

const callSchema = mongoose.Schema({
    type: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
}, {timestamps: true});

const Call = mongoose.model("Call", callSchema);

module.exports = Call;