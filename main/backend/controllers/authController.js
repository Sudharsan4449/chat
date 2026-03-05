const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('batchId', 'batchName');

        if (user && (await bcrypt.compare(password, user.password))) {
            user.lastLogin = new Date();
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                batch: user.batchId,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.setupAdmin = async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'Admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@alumni.com',
            password: hashedPassword,
            role: 'Admin'
        });

        res.status(201).json({ message: 'Admin account created. Email: admin@alumni.com, Password: admin123' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
