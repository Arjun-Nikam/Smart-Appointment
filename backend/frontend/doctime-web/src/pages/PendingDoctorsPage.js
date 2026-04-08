import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar,
    Button, Chip, CircularProgress, Alert
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

export default function PendingDoctorsPage() {
    const [doctors, setDoctors]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [message, setMessage]   = useState('');

    useEffect(() => { fetchPending(); }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/api/admin/pending-doctors');
            setDoctors(res.data);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (doctorId, action) => {
        try {
            await api.put(`/api/admin/${action}/${doctorId}`);
            setMessage(`Doctor ${action}d successfully!`);
            fetchPending();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.log('Action error:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
            <Sidebar />
            <Box sx={{ flex: 1, p: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1E3A8A" mb={1}>
                    Pending Approvals
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    Review and approve doctor registrations
                </Typography>

                {message && (
                    <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : doctors.length === 0 ? (
                    <Card sx={{ borderRadius: 3, textAlign: 'center', p: 6 }}>
                        <Typography variant="h6" color="text.secondary">
                            🎉 No pending approvals!
                        </Typography>
                    </Card>
                ) : (
                    doctors.map((doctor) => (
                        <Card key={doctor.id} sx={{ borderRadius: 3, mb: 2, boxShadow: 2 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#EFF6FF', color: '#1E3A8A' }}>
                                    {doctor.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600} fontSize={16}>
                                        {doctor.name}
                                    </Typography>
                                    <Typography color="#2563EB" fontSize={14}>
                                        {doctor.specialization}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <BusinessIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                        <Typography fontSize={13} color="text.secondary">
                                            {doctor.hospitalName}
                                        </Typography>
                                    </Box>
                                    <Typography fontSize={13} color="text.secondary">
                                        {doctor.email}
                                    </Typography>
                                </Box>
                                <Chip label="Pending" color="warning" size="small" sx={{ mr: 2 }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained" startIcon={<CheckIcon />}
                                        onClick={() => handleAction(doctor.id, 'approve')}
                                        sx={{ backgroundColor: '#16A34A',
                                            '&:hover': { backgroundColor: '#15803D' } }}>
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained" startIcon={<CloseIcon />}
                                        onClick={() => handleAction(doctor.id, 'reject')}
                                        sx={{ backgroundColor: '#DC2626',
                                            '&:hover': { backgroundColor: '#B91C1C' } }}>
                                        Reject
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
}