import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar,
    CircularProgress, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

export default function AllPatientsPage() {
    const [patients, setPatients]   = useState([]);
    const [filtered, setFiltered]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');

    useEffect(() => { fetchPatients(); }, []);

    useEffect(() => {
        setFiltered(
            patients.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, patients]);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/api/admin/all-patients');
            setPatients(res.data);
            setFiltered(res.data);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
            <Sidebar />
            <Box sx={{ flex: 1, p: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1E3A8A" mb={1}>
                    All Patients
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    {patients.length} patients registered
                </Typography>

                <TextField
                    fullWidth placeholder="Search by name or email..."
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
                    filtered.map((patient) => (
                        <Card key={patient.id} sx={{ borderRadius: 3, mb: 2, boxShadow: 2 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#F5F3FF', color: '#7C3AED' }}>
                                    {patient.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600} fontSize={16}>
                                        {patient.name}
                                    </Typography>
                                    <Typography fontSize={14} color="text.secondary">
                                        {patient.email}
                                    </Typography>
                                    <Typography fontSize={13} color="text.secondary" mt={0.5}>
                                        {patient.age} yrs • {patient.gender}
                                    </Typography>
                                </Box>
                                <Typography fontSize={13} color="text.secondary">
                                    ID: #{patient.id}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
}