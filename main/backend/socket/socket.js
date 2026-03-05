const { Server } = require('socket.io');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a personal room to receive private messages
        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
        });

        // Join a batch room
        socket.on('join_batch', (batchId) => {
            socket.join(`batch_${batchId}`);
            console.log(`User joined batch room: batch_${batchId}`);
        });

        // Handle sending a group message
        socket.on('send_group_message', async (data) => {
            try {
                const { senderId, batchId, message } = data;

                // Save to database
                const savedMessage = await Message.create({
                    senderId,
                    batchId,
                    message,
                    chatType: 'group'
                });

                const populatedMessage = await savedMessage.populate('senderId', 'name email');

                // Broadcast to batch room
                io.to(`batch_${batchId}`).emit('receive_group_message', populatedMessage);
            } catch (error) {
                console.error('Error saving group message:', error);
            }
        });

        // Handle sending a private message
        socket.on('send_private_message', async (data) => {
            try {
                const { senderId, receiverId, message } = data;

                // Save to database
                const savedMessage = await Message.create({
                    senderId,
                    receiverId,
                    message,
                    chatType: 'private'
                });

                const populatedMessage = await savedMessage.populate('senderId', 'name email');

                // Update or create conversation
                await Conversation.findOneAndUpdate(
                    { participants: { $all: [senderId, receiverId] } },
                    {
                        $set: { lastMessage: message },
                        $addToSet: { participants: { $each: [senderId, receiverId] } }
                    },
                    { upsert: true, new: true }
                );

                // Emit to receiver's personal room
                io.to(`user_${receiverId}`).emit('receive_private_message', populatedMessage);
                // Emit back to sender
                io.to(`user_${senderId}`).emit('receive_private_message', populatedMessage);
            } catch (error) {
                console.error('Error saving private message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

module.exports = setupSocket;
