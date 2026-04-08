import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar,
    Chip, CircularProgress, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

export default function AllDoctorsPage() {
    const [doctors, setDoctors]     = useState([]);
    const [filtered, setFiltered]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');

    useEffect(() => { fetchDoctors(); }, []);

    useEffect(() => {
        setFiltered(
            doctors.filter(d =>
                d.name.toLowerCase().includes(search.toLowerCase()) ||
                d.specialization.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, doctors]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/api/admin/all-doctors');
            setDoctors(res.data);
            setFiltered(res.data);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING':  return 'warning';
            case 'REJECTED': return 'error';
            default:         return 'default';
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
            <Sidebar />
            <Box sx={{ flex: 1, p: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1E3A8A" mb={1}>
                    All Doctors
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    {doctors.length} doctors registered
                </Typography>

                <TextField
                    fullWidth placeholder="Search by name or specialization..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 3, backgroundColor: '#FFFFFF', borderRadius: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    filtered.map((doctor) => (
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
                                <Box sx={{ textAlign: 'right' }}>
                                    <Chip
                                        label={doctor.status}
                                        color={getStatusColor(doctor.status)}
                                        size="small" sx={{ mb: 1 }}
                                    />
                                    <Typography fontSize={12} color="text.secondary" display="block">
                                        {doctor.averageConsultationTime} min/patient
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
}