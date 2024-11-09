// models/TelegramUser.js
const mongoose = require('mongoose');

const telegramUserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    name: String, // Optional: to store their Telegram username or display name
    points: { type: Number, default: 0 },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }] // Link to assigned tasks
});

const TelegramUser = mongoose.model('TelegramUser', telegramUserSchema);
module.exports = TelegramUser;
