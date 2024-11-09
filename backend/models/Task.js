// // backend/models/Task.js
// import mongoose from 'mongoose';

// const taskSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     points: { type: Number, required: true }, // Add points field
//     status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
//     assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//     deadline: { type: Date, required: false }, // Optional field for deadline
// }, {
//     timestamps: true
// });

// export default mongoose.model('Task', taskSchema);

import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    points: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

export default mongoose.model('Task', taskSchema);