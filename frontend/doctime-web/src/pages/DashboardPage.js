import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
            <Box sx={{
                width: 56, height: 56, borderRadius: 2,
                backgroundColor: `${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
            </Box>
            <Box>
                <Typography color="text.secondary" fontSize={14}>{title}</Typography>
                <Typography variant="h4" fontWeight="bold">{value}</Typography>
            </Box>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalDoctors: 0, approvedDoctors: 0,
        pendingDoctors: 0, totalPatients: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [doctorsRes, patientsRes] = await Promise.all([
                api.get('/api/admin/all-doctors'),
                api.get('/api/admin/all-patients'),
            ]);
            const doctors  = doctorsRes.data;
            const patients = patientsRes.data;
            setStats({
                totalDoctors:    doctors.length,
                approvedDoctors: doctors.filter(d => d.status === 'APPROVED').length,
                pendingDoctors:  doctors.filter(d => d.status === 'PENDING').length,
                totalPatients:   patients.length,
            });
        } catch (error) {
            console.log('Stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
            <Sidebar />
            <Box sx={{ flex: 1, p: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1E3A8A" mb={1}>
                    Dashboard
                </Typography>
                <Typography color="text.secondary" mb={4}>
                    Welcome to DocTime Admin Panel
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Doctors" value={stats.totalDoctors}
                                icon={<PeopleIcon />} color="#1E3A8A" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Approved Doctors" value={stats.approvedDoctors}
                                icon={<CheckCircleIcon />} color="#16A34A" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Pending Approval" value={stats.pendingDoctors}
                                icon={<HourglassEmptyIcon />} color="#D97706" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Patients" value={stats.totalPatients}
                                icon={<PersonIcon />} color="#7C3AED" />
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    );
}