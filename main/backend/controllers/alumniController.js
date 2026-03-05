const Batch = require('../models/Batch');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.find().sort({ createdAt: -1 });
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching batches', error: error.message });
    }
};

exports.getBatchMembers = async (req, res) => {
    try {
        const members = await User.find({ batchId: req.params.batchId, role: 'Alumni User' }).select('-password');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members', error: error.message });
    }
};

exports.getAllAlumni = async (req, res) => {
    try {
        const alumni = await User.find({ role: 'Alumni User', _id: { $ne: req.user.id } }).populate('batchId', 'batchName').select('-password');
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alumni', error: error.message });
    }
};

exports.getBatchMessages = async (req, res) => {
    try {
        const messages = await Message.find({ batchId: req.params.batchId, chatType: 'group' })
            .populate('senderId', 'name email')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

exports.getPrivateMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const messages = await Message.find({
            chatType: 'private',
            $or: [
                { senderId: req.user.id, receiverId },
                { senderId: receiverId, receiverId: req.user.id }
            ]
        }).populate('senderId', 'name email').sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching private messages', error: error.message });
    }
};
