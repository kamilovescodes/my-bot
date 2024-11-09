// // models/User.js
// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['user', 'admin'], default: 'user' }  // Added role
// });

// const User = mongoose.model('User', UserSchema);
// export default User;


// models/User.js

// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, default: 'user' } // Add a role field
// });

// export default mongoose.model('User', UserSchema);


// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Ensure this line is present
});

const User = mongoose.model('User', userSchema);

export default User;
