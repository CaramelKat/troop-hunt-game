const { Schema, model } = require('mongoose');

const settingsSchema = new Schema({
    period: {
        type: Number,
        default: 1
    }
});

const SETTINGS = model('SETTINGS', settingsSchema);

module.exports = {
    settingsSchema,
    SETTINGS
};
