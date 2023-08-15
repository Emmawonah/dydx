const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        default: "inactive"
    },
    url: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Url',
    }
});

module.exports = mongoose.model('User', userSchema);
