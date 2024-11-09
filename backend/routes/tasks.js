// // backend/routes/tasks.js
// import express from 'express';
// import Task from '../models/Task.js';

// const router = express.Router();

// // Get all tasks
// router.get('/tasks', async (req, res) => {
//     const tasks = await Task.find({});
//     res.status(200).json({ tasks });
// });

// // Create a new task
// router.post('/tasks', async (req, res) => {
//     const { title, description, points, status } = req.body;
//     const task = await Task.create({ title, description, points, status });
//     res.status(201).json({ task });
// });

// // Update a task
// router.put('/tasks/:id', async (req, res) => {
//     const { title, description, points, status } = req.body;
//     const task = await Task.findByIdAndUpdate(
//         req.params.id,
//         { title, description, points, status },
//         { new: true }
//     );
//     res.status(200).json({ task });
// });

// // Delete a task
// router.delete('/tasks/:id', async (req, res) => {
//     await Task.findByIdAndDelete(req.params.id);
//     res.status(204).json({ message: 'Task deleted successfully' });
// });


// // Assign task to user
// router.put('/:id/assign', async (req, res) => {
//     const { assignedTo } = req.body; // Expecting assignedTo ID in the request body
//     try {
//         const task = await Task.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true });
//         if (!task) return res.status(404).json({ error: 'Task not found' });
//         res.json({ task });

// export default router;


// backend/routes/tasks.js
import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// Get all tasks with optional filtering
router.get('/tasks', async (req, res) => {
    try {
        const { status, assignedTo } = req.query; // Optional query parameters for filtering
        const filter = {};

        if (status) filter.status = status; // Filter by status
        if (assignedTo) filter.assignedTo = assignedTo; // Filter by assigned user

        const tasks = await Task.find(filter).populate('assignedTo'); // Populate user info
        res.status(200).json({ tasks });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create a new task
router.post('/tasks', async (req, res) => {
    const { title, description, points, status, assignedTo, deadline } = req.body;
    try {
        const task = await Task.create({ title, description, points, status, assignedTo, deadline });
        res.status(201).json({ task });
    } catch (err) {
        res.status(400).json({ error: 'Failed to create task' });
    }
});

// Update a task
router.put('/tasks/:id', async (req, res) => {
    const { title, description, points, status, assignedTo, deadline } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, points, status, assignedTo, deadline },
            { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json({ task });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update task' });
    }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(204).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Assign task to user
router.put('/tasks/:id/assign', async (req, res) => {
    const { assignedTo } = req.body; // Expecting assignedTo ID in the request body
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json({ task });
    } catch (err) {
        res.status(400).json({ error: 'Failed to assign task' });
    }
});

export default router;
