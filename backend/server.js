import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/User.js'; // Your user model
import authenticateToken from './middleware/auth.js';
import authorizeRole from './middleware/authorizeRole.js';
import RefreshToken from './models/RefreshToken.js';
import Task from './models/Task.js';
import tasksRouter from './routes/tasks.js';






dotenv.config();

// Check for required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.JWT_SECRET_REFRESH) {
    console.error('Please define MONGO_URI, JWT_SECRET, and JWT_SECRET_REFRESH in your .env file');
    process.exit(1);
}

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000', // Change this to the frontend's URL
    credentials: true,
}));
app.use(express.json());

app.use('/api', tasksRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User registration endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: 'Email already in use' });
        } else {
            res.status(400).json({ error: err.message });
        }
    }
});

// Update user role endpoint (Admins only)
app.put('/api/user/:id/role', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User role updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '7d' });

        const refreshTokenDoc = new RefreshToken({
            token: refreshToken,
            user: user._id,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        await refreshTokenDoc.save();

        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Refresh token endpoint
app.post('/api/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    try {
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc) return res.status(403).json({ error: 'Invalid refresh token' });

        jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, async (err, decoded) => {
            if (err) return res.status(403).json({ error: 'Invalid or expired refresh token' });

            const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '7d' });

            tokenDoc.token = newRefreshToken;
            tokenDoc.expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await tokenDoc.save();

            res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User profile endpoint
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile endpoint
app.put('/api/profile', authenticateToken, async (req, res) => {
    const { name, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Profile updated', user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change password endpoint
app.put('/api/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    
    }
});

// Admin-only route for deleting users
app.delete('/api/delete-user/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user account endpoint
app.delete('/api/delete-account', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'User account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get paginated list of users
app.get('/api/users', authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 5;
    
    try {
        const users = await User.find().skip((page - 1) * size).limit(size);
        const total = await User.countDocuments(); // Get total number of users
        res.json({ users, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a user by ID
app.delete('/api/user/:id', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN route

// Get all users with pagination (admin only)
app.get('/api/admin/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    try {
        const users = await User.find().skip((page - 1) * size).limit(size);
        const total = await User.countDocuments();
        res.json({ users, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user role (admin only)
app.put('/api/admin/user/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { role } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User role updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user (admin only)
app.delete('/api/admin/user/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




// Create a new task (admin only)
app.post('/api/admin/tasks', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { title, description, points } = req.body;
    try {
        const task = new Task({ title, description, points });
        await task.save();
        res.status(201).json({ message: 'Task created', task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tasks
app.get('/api/admin/tasks', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task (admin only)
app.put('/api/admin/task/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { title, description, points } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { title, description, points }, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task updated', task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task (admin only)
app.delete('/api/admin/task/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.delete('/api/delete-user/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Update user role endpoint (Admins only)
app.put('/api/user/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { role } = req.body; // role should be 'user' or 'admin'

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User role updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description } = req.body;
        const task = new Task({ title, description });
        await task.save();
        res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
