// // middleware/authorizeRole.js
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// const authorizeRole = (roles) => {
//     return async (req, res, next) => {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) return res.status(401).json({ error: 'Unauthorized' });

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             const user = await User.findById(decoded.id);
//             if (!user) return res.status(404).json({ error: 'User not found' });

//             if (!roles.includes(user.role)) {
//                 return res.status(403).json({ error: 'Forbidden: You do not have the necessary permissions' });
//             }

//             next();
//         } catch (err) {
//             res.status(500).json({ error: err.message });
//         }
//     };
// };

// export default authorizeRole;


// // middleware/authorizeRole.js
// import jwt from 'jsonwebtoken';

// const authorizeRole = (roles) => {
//     return (req, res, next) => {
//         const token = req.headers['authorization']?.split(' ')[1]; // Get token from header
//         if (!token) return res.status(403).json({ error: 'No token provided' });

//         jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//             if (err) return res.status(403).json({ error: 'Invalid token' });

//             req.user = user; // Save user information to request
//             if (!roles.includes(user.role)) {
//                 return res.status(403).json({ error: 'Forbidden: You do not have the necessary permissions' });
//             }
//             next(); // Proceed to the next middleware or route handler
//         });
//     };
// };

// export default authorizeRole;


// import jwt from 'jsonwebtoken';


// const authorizeRole = (roles) => {
//     return async (req, res, next) => {
//         const authHeader = req.headers.authorization;
//         console.log('Auth Header:', authHeader); // Log the authorization header for debugging
//         const token = authHeader?.split(' ')[1];
        
//         if (!token) {
//             console.log('No token provided');
//             return res.status(401).json({ error: 'Unauthorized' });
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             console.log('Decoded Token:', decoded); // Log decoded token for debugging

//             const user = await User.findById(decoded.id);
//             if (!user) {
//                 console.log('User not found');
//                 return res.status(404).json({ error: 'User not found' });
//             }

//             console.log('User Role:', user.role); // Log user role for debugging
//             if (!roles.includes(user.role)) {
//                 console.log('Forbidden: Role mismatch');
//                 return res.status(403).json({ error: 'Forbidden: You do not have the necessary permissions' });
//             }

//             next();
//         } catch (err) {
//             console.error('Authorization error:', err.message); // Log detailed error for debugging
//             res.status(500).json({ error: err.message });
//         }
//     };
// };
// export default authorizeRole;


// middleware/authorizeRole.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// const authorizeRole = (roles) => {
//     return async (req, res, next) => {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) return res.status(401).json({ error: 'Unauthorized' });

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             const user = await User.findById(decoded.id);
//             if (!user) return res.status(404).json({ error: 'User not found' });

//             if (!roles.includes(user.role)) {
//                 return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
//             }

//             req.user = user; // Pass user info to the next middleware
//             next();
//         } catch (err) {
//             res.status(500).json({ error: err.message });
//         }
//     };
// };

const authorizeRole = (roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id); // Ensure this line uses User
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

export default authorizeRole;
