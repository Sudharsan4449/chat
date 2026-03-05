import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [batches, setBatches] = useState([]);
    const [alumni, setAlumni] = useState([]);
    const [batchName, setBatchName] = useState('');
    const [batchDesc, setBatchDesc] = useState('');

    // Alumni Form
    const [newAlumniName, setNewAlumniName] = useState('');
    const [newAlumniEmail, setNewAlumniEmail] = useState('');
    const [newAlumniPassword, setNewAlumniPassword] = useState('');
    const [selectedBatchForAlumni, setSelectedBatchForAlumni] = useState('');

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    useEffect(() => {
        fetchBatches();
        fetchAlumni();
    }, []);

    const fetchBatches = async () => {
        try {
            const { data } = await axios.get('/api/admin/batches', config);
            setBatches(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAlumni = async () => {
        try {
            const { data } = await axios.get('/api/admin/alumni', config);
            setAlumni(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/batches', { batchName, description: batchDesc }, config);
            setBatchName('');
            setBatchDesc('');
            fetchBatches();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating batch');
        }
    };

    const handleDeleteBatch = async (id) => {
        if (window.confirm('Delete this batch?')) {
            try {
                await axios.delete(`/api/admin/batches/${id}`, config);
                fetchBatches();
                fetchAlumni(); // refresh alumni list as their batch might be deleted
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleCreateAlumni = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/alumni', {
                name: newAlumniName,
                email: newAlumniEmail,
                password: newAlumniPassword,
                batchId: selectedBatchForAlumni || null
            }, config);
            setNewAlumniName('');
            setNewAlumniEmail('');
            setNewAlumniPassword('');
            setSelectedBatchForAlumni('');
            fetchAlumni();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating alumni');
        }
    };

    const handleAssignBatch = async (userId, batchId) => {
        try {
            await axios.post('/api/admin/assign-batch', { userId, batchId }, config);
            fetchAlumni();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded shadow">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Batches Management */}
                    <div className="bg-white p-6 rounded shadow space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Manage Batches</h2>
                        <form onSubmit={handleCreateBatch} className="space-y-3">
                            <input type="text" placeholder="Batch Name" required value={batchName} onChange={(e) => setBatchName(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            <input type="text" placeholder="Description" value={batchDesc} onChange={(e) => setBatchDesc(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            <button type="submit" className="w-full bg-blue-600 text-white font-medium p-2 rounded hover:bg-blue-700 transition duration-150">Create Batch</button>
                        </form>

                        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-2">
                            {batches.map(batch => (
                                <div key={batch._id} className="flex justify-between items-center bg-gray-50 p-3 rounded border hover:bg-gray-100 transition duration-150">
                                    <div>
                                        <p className="font-semibold text-gray-900">{batch.batchName}</p>
                                        <p className="text-sm text-gray-600">{batch.description}</p>
                                    </div>
                                    <button onClick={() => handleDeleteBatch(batch._id)} className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alumni Management */}
                    <div className="bg-white p-6 rounded shadow space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Create Alumni</h2>
                        <form onSubmit={handleCreateAlumni} className="space-y-3">
                            <input type="text" placeholder="Name" required value={newAlumniName} onChange={(e) => setNewAlumniName(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            <input type="email" placeholder="Email" required value={newAlumniEmail} onChange={(e) => setNewAlumniEmail(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            <input type="password" placeholder="Password" required value={newAlumniPassword} onChange={(e) => setNewAlumniPassword(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            <select value={selectedBatchForAlumni} onChange={(e) => setSelectedBatchForAlumni(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                <option value="" className="text-gray-500">Select Batch (Optional)</option>
                                {batches.map(b => <option key={b._id} value={b._id} className="text-gray-900">{b.batchName}</option>)}
                            </select>
                            <button type="submit" className="w-full bg-green-600 text-white font-medium p-2 rounded hover:bg-green-700 transition duration-150">Add Alumni</button>
                        </form>
                    </div>
                </div>

                {/* Alumni List */}
                <div className="bg-white p-6 rounded shadow mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Alumni Directory</h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full text-left bg-white">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">Current Batch</th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider flex justify-end">Assign to Batch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alumni.map(al => (
                                    <tr key={al._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{al.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{al.email}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${al.batchId ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {al.batchId ? al.batchId.batchName : 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900 flex justify-end">
                                            <select
                                                value={al.batchId?._id || ''}
                                                onChange={(e) => handleAssignBatch(al._id, e.target.value)}
                                                className="border border-gray-300 rounded-md p-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="" className="text-gray-500">None</option>
                                                {batches.map(b => <option key={b._id} value={b._id} className="text-gray-900">{b.batchName}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
