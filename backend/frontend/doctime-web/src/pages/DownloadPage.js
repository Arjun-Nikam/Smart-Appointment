import React, { useEffect } from 'react';
import {
    Box, Typography, Button, Card, CardContent
} from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ANDROID_APK_LINK = 'https://drive.google.com/file/d/1A8UCGmn_bugB4F7Ly9KSg4YF1Q959T0q/view?usp=sharing';

const features = [
    'Book doctor appointments instantly',
    'Real-time queue tracking',
    'Smart slot assignment',
    'Find nearby doctors',
    'Appointment history',
];

export default function DownloadPage() {
    useEffect(() => {
        document.title = 'DocTime - Download App';
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
        }}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Box sx={{
                    width: 80, height: 80,
                    backgroundColor: '#1E3A8A',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    <MedicalServicesIcon sx={{ color: '#FFFFFF', fontSize: 40 }} />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="#1E3A8A">
                    DocTime
                </Typography>
                <Typography color="text.secondary" fontSize={18} mt={1}>
                    Smart Appointments, Zero Wait
                </Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 4, maxWidth: 500, width: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography fontWeight={600} fontSize={18} mb={2}>
                        Why DocTime?
                    </Typography>
                    {features.map((feature, index) => (
                        <Box key={index} sx={{
                            display: 'flex', alignItems: 'center',
                            gap: 1.5, mb: 1.5
                        }}>
                            <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                            <Typography fontSize={15} color="text.secondary">
                                {feature}
                            </Typography>
                        </Box>
                    ))}
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 500 }}>
                <Button
                    fullWidth variant="contained" size="large"
                    startIcon={<AndroidIcon />}
                    href={ANDROID_APK_LINK}
                    sx={{
                        backgroundColor: '#16A34A',
                        borderRadius: 3, py: 2, fontSize: 16,
                        '&:hover': { backgroundColor: '#15803D' },
                    }}>
                    Download for Android
                </Button>
                <Button
                    fullWidth variant="outlined" size="large"
                    startIcon={<AppleIcon />} disabled
                    sx={{
                        borderRadius: 3, py: 2, fontSize: 16,
                        borderColor: '#9CA3AF', color: '#9CA3AF',
                    }}>
                    iOS — Coming Soon
                </Button>
            </Box>

            <Typography color="text.secondary" fontSize={13} mt={3} textAlign="center">
                Android 8.0 or higher required
            </Typography>
        </Box>
    );
}