const Batch = require('../models/Batch');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createBatch = async (req, res) => {
    try {
        const { batchName, description } = req.body;
        const batch = await Batch.create({ batchName, description });
        res.status(201).json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Error creating batch', error: error.message });
    }
};

exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.find().sort({ createdAt: -1 });
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching batches', error: error.message });
    }
};

exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Error updating batch', error: error.message });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        await Batch.findByIdAndDelete(req.params.id);
        await User.updateMany({ batchId: req.params.id }, { $set: { batchId: null } });
        res.json({ message: 'Batch removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting batch', error: error.message });
    }
};

exports.createAlumni = async (req, res) => {
    try {
        const { name, email, password, batchId } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const alumni = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'Alumni User',
            batchId: batchId || null
        });
        res.status(201).json({ _id: alumni.id, name: alumni.name, email: alumni.email, batchId: alumni.batchId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating alumni', error: error.message });
    }
};

exports.getAlumni = async (req, res) => {
    try {
        const alumni = await User.find({ role: 'Alumni User' }).populate('batchId', 'batchName').select('-password');
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alumni', error: error.message });
    }
};

exports.assignBatch = async (req, res) => {
    try {
        const { userId, batchId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.batchId = batchId;
        await user.save();
        res.json({ message: 'Batch assigned successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning batch', error: error.message });
    }
};
