// routes/telegramUsers.js
const express = require('express');
const TelegramUser = require('../models/TelegramUser');
const Task = require('../models/Task');
const router = express.Router();

// Create or find a user by telegramId
router.post('/findOrCreate', async (req, res) => {
    const { telegramId, name } = req.body;
    try {
        let user = await TelegramUser.findOne({ telegramId });
        if (!user) {
            user = await TelegramUser.create({ telegramId, name });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to find or create user' });
    }
});

// Fetch user's tasks by telegramId
router.get('/:telegramId/tasks', async (req, res) => {
    const { telegramId } = req.params;
    try {
        const user = await TelegramUser.findOne({ telegramId }).populate('tasks');
        if (user) {
            res.status(200).json({ tasks: user.tasks });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

module.exports = router;
