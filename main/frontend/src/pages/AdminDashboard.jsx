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
                        <h2 className="text-xl font-semibold border-b pb-2">Manage Batches</h2>
                        <form onSubmit={handleCreateBatch} className="space-y-3">
                            <input type="text" placeholder="Batch Name" required value={batchName} onChange={(e) => setBatchName(e.target.value)} className="w-full border p-2 rounded" />
                            <input type="text" placeholder="Description" value={batchDesc} onChange={(e) => setBatchDesc(e.target.value)} className="w-full border p-2 rounded" />
                            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create Batch</button>
                        </form>

                        <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                            {batches.map(batch => (
                                <div key={batch._id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                                    <div>
                                        <p className="font-semibold">{batch.batchName}</p>
                                        <p className="text-sm text-gray-500">{batch.description}</p>
                                    </div>
                                    <button onClick={() => handleDeleteBatch(batch._id)} className="text-red-500 hover:text-red-700">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alumni Management */}
                    <div className="bg-white p-6 rounded shadow space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Create Alumni</h2>
                        <form onSubmit={handleCreateAlumni} className="space-y-3">
                            <input type="text" placeholder="Name" required value={newAlumniName} onChange={(e) => setNewAlumniName(e.target.value)} className="w-full border p-2 rounded" />
                            <input type="email" placeholder="Email" required value={newAlumniEmail} onChange={(e) => setNewAlumniEmail(e.target.value)} className="w-full border p-2 rounded" />
                            <input type="password" placeholder="Password" required value={newAlumniPassword} onChange={(e) => setNewAlumniPassword(e.target.value)} className="w-full border p-2 rounded" />
                            <select value={selectedBatchForAlumni} onChange={(e) => setSelectedBatchForAlumni(e.target.value)} className="w-full border p-2 rounded">
                                <option value="">Select Batch (Optional)</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                            </select>
                            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Add Alumni</button>
                        </form>
                    </div>
                </div>

                {/* Alumni List */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4">Alumni Directory</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4">Name</th>
                                    <th className="py-2 px-4">Email</th>
                                    <th className="py-2 px-4">Current Batch</th>
                                    <th className="py-2 px-4">Assign to Batch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumni.map(al => (
                                    <tr key={al._id} className="border-b">
                                        <td className="py-2 px-4">{al.name}</td>
                                        <td className="py-2 px-4">{al.email}</td>
                                        <td className="py-2 px-4">{al.batchId ? al.batchId.batchName : 'None'}</td>
                                        <td className="py-2 px-4">
                                            <select
                                                value={al.batchId?._id || ''}
                                                onChange={(e) => handleAssignBatch(al._id, e.target.value)}
                                                className="border rounded p-1"
                                            >
                                                <option value="">None</option>
                                                {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
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
