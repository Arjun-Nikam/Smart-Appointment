import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PendingDoctorsPage from './pages/PendingDoctorsPage';
import AllDoctorsPage from './pages/AllDoctorsPage';
import AllPatientsPage from './pages/AllPatientsPage';
import DownloadPage from './pages/DownloadPage';

function ProtectedRoute({ children }) {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn || !isAdmin) return <Navigate to="/admin" />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/"          element={<DownloadPage />} />
                    <Route path="/admin"     element={<LoginPage />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><DashboardPage /></ProtectedRoute>
                    } />
                    <Route path="/pending"   element={
                        <ProtectedRoute><PendingDoctorsPage /></ProtectedRoute>
                    } />
                    <Route path="/doctors"   element={
                        <ProtectedRoute><AllDoctorsPage /></ProtectedRoute>
                    } />
                    <Route path="/patients"  element={
                        <ProtectedRoute><AllPatientsPage /></ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
