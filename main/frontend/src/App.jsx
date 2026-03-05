import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AlumniDashboard from './pages/AlumniDashboard';

const ProtectedRoute = ({ children, role }) => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) {
        return <Navigate to={user.role === 'Admin' ? '/admin' : '/'} replace />;
    }
    return children;
};

function App() {
    const { user } = useContext(AuthContext);

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={user.role === 'Admin' ? '/admin' : '/'} replace /> : <Login />} />

            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute role="Admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/*"
                element={
                    <ProtectedRoute role="Alumni User">
                        <AlumniDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
