// import express from 'express';
// import User from '../models/userModel.js';

// const router = express.Router();

// // Sample GET route to fetch users
// router.get('/', async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// });

// // Sample POST route to create a new user
// router.post('/', async (req, res) => {
//   const { name, email, password } = req.body;

//   const newUser = new User({ name, email, password });
//   await newUser.save();
  
//   res.json({ message: 'User created successfully' });
// });

// export default router;

import express from 'express';

const router = express.Router();

// Example route to get users
router.get('/users', (req, res) => {
  res.json({ message: 'Get all users' });
});

// Example route to add a user
router.post('/users', (req, res) => {
  const { name, email } = req.body;
  res.json({ message: `User ${name} added with email ${email}` });
});

export default router;
