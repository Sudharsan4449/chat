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
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen bg-cover bg-center p-6 bg-fixed" style={{ backgroundImage: "url('/bg-admin.png')" }}>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-150">Logout</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Batches Management */}
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 space-y-4">
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
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Create Alumni</h2>
                        <form onSubmit={handleCreateAlumni} className="space-y-5 pt-2">
                            <div className="relative">
                                <input type="text" id="newAlumniName" required value={newAlumniName} onChange={(e) => setNewAlumniName(e.target.value)} className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-green-600 peer" placeholder=" " />
                                <label htmlFor="newAlumniName" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Name</label>
                            </div>

                            <div className="relative">
                                <input type="email" id="newAlumniEmail" required value={newAlumniEmail} onChange={(e) => setNewAlumniEmail(e.target.value)} className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-green-600 peer" placeholder=" " />
                                <label htmlFor="newAlumniEmail" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Email</label>
                            </div>

                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} id="newAlumniPassword" required value={newAlumniPassword} onChange={(e) => setNewAlumniPassword(e.target.value)} className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-green-600 peer" placeholder=" " />
                                <label htmlFor="newAlumniPassword" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Password</label>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <select value={selectedBatchForAlumni} onChange={(e) => setSelectedBatchForAlumni(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-0 focus:border-green-600">
                                <option value="" className="text-gray-500">Select Batch (Optional)</option>
                                {batches.map(b => <option key={b._id} value={b._id} className="text-gray-900">{b.batchName}</option>)}
                            </select>
                            <button type="submit" className="w-full bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-green-700 transition duration-150">Add Alumni</button>
                        </form>
                    </div>
                </div>

                {/* Alumni List */}
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 mt-6">
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
