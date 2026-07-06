const mongoose = require("mongoose");

module.exports = new mongoose.Schema(
    {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);