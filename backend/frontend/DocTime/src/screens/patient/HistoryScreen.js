import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, RefreshControl, Alert,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function HistoryScreen() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [refreshing, setRefreshing]     = useState(false);

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/api/appointments/my-history');
            setAppointments(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load history.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/api/appointments/cancel/${appointmentId}`);
                            fetchHistory();
                        } catch (error) {
                            Alert.alert('Error',
                                error.response?.data || 'Cancellation failed.');
                        }
                    }
                }
            ]
        );
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'BOOKED':     return { color: '#2563EB', bg: '#EFF6FF', icon: 'calendar-outline' };
            case 'CHECKED_IN': return { color: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-circle-outline' };
            case 'COMPLETED':  return { color: '#6B7280', bg: '#F3F4F6', icon: 'checkmark-done-circle-outline' };
            case 'CANCELLED':  return { color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle-outline' };
            case 'NO_SHOW':    return { color: '#D97706', bg: '#FFFBEB', icon: 'warning-outline' };
            default:           return { color: '#6B7280', bg: '#F3F4F6', icon: 'help-circle-outline' };
        }
    };

    const renderItem = ({ item }) => {
        const config = getStatusConfig(item.status);
        const canCancel = item.status === 'BOOKED';
        const date = new Date(item.appointmentTime);

        return (
            <View style={styles.card}>
                {/* Top Row */}
                <View style={styles.cardHeader}>
                    <View style={styles.doctorInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={22} color="#2563EB" />
                        </View>
                        <View>
                            <Text style={styles.doctorName}>{item.doctor.name}</Text>
                            <Text style={styles.specialty}>{item.doctor.specialization}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                        <Ionicons name={config.icon} size={14} color={config.color} />
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.detailText}>
                            {date.toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.detailText}>
                            {date.toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="business-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.detailText} numberOfLines={1}>
                            {item.doctor.hospitalName}
                        </Text>
                    </View>
                </View>

                {/* Queue position if booked */}
                {item.queuePosition && (
                    <View style={styles.queueRow}>
                        <Ionicons name="people-outline" size={14} color="#6B7280" />
                        <Text style={styles.queueText}>
                            Queue position: #{item.queuePosition}
                        </Text>
                        {item.lateArrival && (
                            <View style={styles.lateBadge}>
                                <Text style={styles.lateText}>Late arrival</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Cancel Button */}
                {canCancel && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancel(item.id)}>
                        <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                        <Text style={styles.cancelText}>Cancel Appointment</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <Text style={styles.headerSubtitle}>Your booking history</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchHistory}
                            colors={['#2563EB']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color="#E5E7EB" />
                            <Text style={styles.emptyTitle}>No Appointments Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Your booking history will appear here
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
    loader: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        backgroundColor: '#EFF6FF',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    specialty: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    detailText: {
        fontSize: 12,
        color: '#6B7280',
    },
    queueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    queueText: {
        fontSize: 13,
        color: '#6B7280',
    },
    lateBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    lateText: {
        fontSize: 11,
        color: '#D97706',
        fontWeight: '500',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        backgroundColor: '#FFF5F5',
    },
    cancelText: {
        fontSize: 14,
        color: '#DC2626',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
});