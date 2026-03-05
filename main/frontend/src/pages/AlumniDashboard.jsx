import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const AlumniDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [batches, setBatches] = useState([]);
    const [alumniList, setAlumniList] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // { id, name, type: 'group' | 'private' }
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    useEffect(() => {
        // Determine socket URL based on environment window.location.origin in production
        socketRef.current = io(window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_user_room', user._id);
            if (user.batch) {
                socketRef.current.emit('join_batch', user.batch._id);
            }
        });

        socketRef.current.on('receive_group_message', (msg) => {
            setMessages(prev => {
                // Only append if we are currently looking at that batch chat
                if (activeChat?.type === 'group' && activeChat.id === msg.batchId) {
                    return [...prev, msg];
                }
                return prev;
            });
        });

        socketRef.current.on('receive_private_message', (msg) => {
            setMessages(prev => {
                // If we are currently chatting with this person
                if (activeChat?.type === 'private' &&
                    (activeChat.id === msg.senderId._id || activeChat.id === msg.receiverId)) {
                    return [...prev, msg];
                }
                return prev;
            });
        });

        fetchBatches();
        fetchAllAlumni();

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchMessages();
        }
    }, [activeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/api/alumni/batches', config);
            setBatches(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAllAlumni = async () => {
        try {
            const { data } = await axios.get('/api/alumni/all', config);
            setAlumniList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async () => {
        try {
            if (activeChat.type === 'group') {
                const { data } = await axios.get(`/api/alumni/messages/batch/${activeChat.id}`, config);
                setMessages(data);
            } else {
                const { data } = await axios.get(`/api/alumni/messages/private/${activeChat.id}`, config);
                setMessages(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChat) return;

        if (activeChat.type === 'group') {
            socketRef.current.emit('send_group_message', {
                senderId: user._id,
                batchId: activeChat.id,
                message: messageInput
            });
        } else {
            socketRef.current.emit('send_private_message', {
                senderId: user._id,
                receiverId: activeChat.id,
                message: messageInput
            });
        }

        setMessageInput('');
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col">
                <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
                    <span className="font-semibold truncate pr-2">{user.name}</span>
                    <button onClick={logout} className="text-xs bg-red-500 px-2 py-1 rounded hover:bg-red-600">Logout</button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-4">

                    {/* Batches Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Batch Chats</h3>
                        {batches.map(batch => (
                            <div
                                key={batch._id}
                                onClick={() => setActiveChat({ id: batch._id, name: batch.batchName, type: 'group' })}
                                className={`p-2 rounded cursor-pointer hover:bg-blue-50 transition-colors ${activeChat?.id === batch._id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                                <p className="font-medium text-gray-800"># {batch.batchName}</p>
                                {user.batch?._id !== batch._id && <p className="text-xs text-gray-400 pl-4">(View only)</p>}
                            </div>
                        ))}
                    </div>

                    <hr />

                    {/* Private Chats Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Private Chats</h3>
                        {alumniList.map(al => (
                            <div
                                key={al._id}
                                onClick={() => setActiveChat({ id: al._id, name: al.name, type: 'private' })}
                                className={`p-2 rounded cursor-pointer hover:bg-green-50 transition-colors flex items-center space-x-2 ${activeChat?.id === al._id ? 'bg-green-100 border-l-4 border-green-500' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white uppercase">
                                    {al.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{al.name}</p>
                                    <p className="text-xs text-gray-500">{al.batchId?.batchName || 'No Batch'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b flex items-center shadow-sm z-10">
                            <div className="text-xl font-semibold text-gray-800">
                                {activeChat.type === 'group' ? '#' : '@'} {activeChat.name}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId._id === user._id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                            {!isMe && activeChat.type === 'group' && (
                                                <p className="text-xs font-bold text-blue-600 mb-1">{msg.senderId.name}</p>
                                            )}
                                            <p className="text-sm break-words">{msg.message}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input form */}
                        <div className="p-4 bg-white border-t">
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder={`Message ${activeChat.type === 'group' ? '#' : '@'}${activeChat.name}...`}
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="bg-blue-600 text-white rounded-full p-2 px-6 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <p className="text-xl">Select a batch or person to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlumniDashboard;
