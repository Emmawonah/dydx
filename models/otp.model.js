const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true
    },
    token: { type: String, required: true },
    expiry: {
        type: Date
    }
});

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;