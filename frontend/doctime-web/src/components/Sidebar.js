import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText,
    Typography, Box, Divider, Button, Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const DRAWER_WIDTH = 260;

const navItems = [
    { label: 'Dashboard',       path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Pending Doctors', path: '/pending',   icon: <PendingIcon /> },
    { label: 'All Doctors',     path: '/doctors',   icon: <PeopleIcon /> },
    { label: 'All Patients',    path: '/patients',  icon: <PersonIcon /> },
];

export default function Sidebar() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#1E3A8A',
                    color: '#FFFFFF',
                },
            }}>

            {/* Logo */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MedicalServicesIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
                <Typography variant="h5" fontWeight="bold" color="white">
                    DocTime
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Admin Info */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    {user?.name?.charAt(0) || 'A'}
                </Avatar>
                <Box>
                    <Typography fontSize={14} fontWeight={600} color="white">
                        {user?.name || 'Admin'}
                    </Typography>
                    <Typography fontSize={12} color="rgba(255,255,255,0.6)">
                        Administrator
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Nav Items */}
            <List sx={{ flex: 1, pt: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                mx: 1, mb: 0.5,
                                borderRadius: 2,
                                cursor: 'pointer',
                                backgroundColor: isActive
                                    ? 'rgba(255,255,255,0.15)' : 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                },
                            }}>
                            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    color: '#FFFFFF',
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>

            {/* Logout */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        color: '#FFFFFF',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                            borderColor: '#FFFFFF',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                    }}>
                    Logout
                </Button>
            </Box>
        </Drawer>
    );
}