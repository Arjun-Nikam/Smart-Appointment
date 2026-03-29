import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Box, Card, CardContent, TextField,
    Button, Typography, Alert, CircularProgress
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/auth/login', { email, password });
            const { token, role, userProfile } = res.data;
            if (role !== 'ADMIN') {
                setError('Access denied. Admin only.');
                return;
            }
            login(token, role, { name: userProfile.name, email: userProfile.email });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Card sx={{ width: 420, borderRadius: 4, boxShadow: 6 }}>
                <CardContent sx={{ p: 5 }}>

                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            width: 70, height: 70,
                            backgroundColor: '#1E3A8A',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <MedicalServicesIcon sx={{ color: '#FFFFFF', fontSize: 36 }} />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="#1E3A8A">
                            DocTime
                        </Typography>
                        <Typography color="text.secondary" mt={0.5}>
                            Admin Panel
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}

                    <TextField
                        fullWidth label="Email" type="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }} variant="outlined"
                    />
                    <TextField
                        fullWidth label="Password" type="password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }} variant="outlined"
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <Button
                        fullWidth variant="contained" size="large"
                        onClick={handleLogin} disabled={loading}
                        sx={{
                            backgroundColor: '#1E3A8A',
                            borderRadius: 2, py: 1.5,
                            '&:hover': { backgroundColor: '#1E40AF' },
                        }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}