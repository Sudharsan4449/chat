const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
    message: { type: String, required: true },
    chatType: { type: String, enum: ['group', 'private'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
