import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function QueuePositionScreen() {
    const [queueData, setQueueData]   = useState(null);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchQueuePosition();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchQueuePosition, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchQueuePosition = async () => {
        try {
            const res = await api.get('/api/queue/my-position');
            setQueueData(res.data);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.log('Queue error:', error);
            }
            setQueueData(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchQueuePosition();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'BOOKED':     return { bg: '#EFF6FF', text: '#2563EB' };
            case 'CHECKED_IN': return { bg: '#DCFCE7', text: '#16A34A' };
            case 'COMPLETED':  return { bg: '#F3F4F6', text: '#6B7280' };
            default:           return { bg: '#FEE2E2', text: '#DC2626' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'BOOKED':     return 'calendar-outline';
            case 'CHECKED_IN': return 'checkmark-circle';
            case 'COMPLETED':  return 'checkmark-done-circle';
            default:           return 'time-outline';
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!queueData) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Queue</Text>
                    <Text style={styles.headerSubtitle}>Track your position live</Text>
                </View>
                <ScrollView
                    contentContainerStyle={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                            colors={['#2563EB']} />
                    }>
                    <View style={styles.emptyCard}>
                        <Ionicons name="calendar-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyTitle}>No Active Appointment</Text>
                        <Text style={styles.emptySubtitle}>
                            You don't have any appointment today.{'\n'}
                            Book one from the Home tab!
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    const statusColors = getStatusColor(queueData.status);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Queue</Text>
                <Text style={styles.headerSubtitle}>Track your position live</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                        colors={['#2563EB']} />
                }>

                {/* Queue Position Card */}
                <View style={styles.positionCard}>
                    <Text style={styles.positionLabel}>Your Effective Position</Text>
                    {/* Show patientsAhead + 1 instead of raw queuePosition */}
                    <Text style={styles.positionNumber}>
                        #{queueData.patientsAhead + 1}
                    </Text>
                    <Text style={styles.positionSubLabel}>
                        {queueData.patientsAhead} patient{queueData.patientsAhead !== 1 ? 's' : ''} ahead of you
                    </Text>

                    <View style={[styles.statusBadge,
                        { backgroundColor: statusColors.bg }]}>
                        <Ionicons name={getStatusIcon(queueData.status)}
                            size={16} color={statusColors.text} />
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {queueData.status.replace('_', ' ')}
                        </Text>
                    </View>

                    {queueData.isLateArrival && (
                        <View style={styles.lateArrivalBadge}>
                            <Ionicons name="warning-outline" size={14} color="#D97706" />
                            <Text style={styles.lateArrivalText}>Late arrival — slot adjusted</Text>
                        </View>
                    )}
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="people-outline" size={24} color="#2563EB" />
                        <Text style={styles.statValue}>{queueData.patientsAhead}</Text>
                        <Text style={styles.statLabel}>Ahead of you</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time-outline" size={24} color="#F59E0B" />
                        <Text style={styles.statValue}>{queueData.estimatedWaitMinutes}</Text>
                        <Text style={styles.statLabel}>Est. wait (min)</Text>
                    </View>
                </View>

                {/* Appointment Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Appointment Details</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                        <Text style={styles.detailLabel}>Doctor</Text>
                        <Text style={styles.detailValue}>{queueData.doctorName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="business-outline" size={18} color="#9CA3AF" />
                        <Text style={styles.detailLabel}>Hospital</Text>
                        <Text style={styles.detailValue}>{queueData.hospitalName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                        <Text style={styles.detailLabel}>Slot Time</Text>
                        <Text style={styles.detailValue}>
                            {new Date(queueData.appointmentTime).toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>

                <Text style={styles.refreshHint}>
                    <Ionicons name="refresh-outline" size={12} color="#9CA3AF" />
                    {' '}Pull down to refresh • Auto-updates every 30 seconds
                </Text>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#2563EB',
        paddingTop: 55,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
    },
    positionCard: {
        backgroundColor: '#2563EB',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
   
 positionSubLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    marginBottom: 8,
    },
    positionLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    positionNumber: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 80,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        marginTop: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    lateArrivalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        marginTop: 10,
    },
    lateArrivalText: {
        fontSize: 12,
        color: '#D97706',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        gap: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        flex: 2,
        textAlign: 'right',
    },
    refreshHint: {
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF',
    },
});