const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    capstone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Capstone",
        required: true
    },
    status: {
        type: String,
        enum: ["Menunggu Review", "Diterima", "Ditolak"],
        default: "Menunggu Review"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Request", requestSchema);