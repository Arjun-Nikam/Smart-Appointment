import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, RefreshControl,
    TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function LiveQueueScreen() {
    const [queue, setQueue]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await api.get('/api/queue/my-queue');
            setQueue(res.data);
        } catch (error) {
            console.log('Queue error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAction = (appointment, action) => {
        const messages = {
            checkin:  `Check in ${appointment.patient.name}?`,
            complete: `Mark ${appointment.patient.name} as completed?`,
            noshow:   `Mark ${appointment.patient.name} as No Show?`,
            swap:     `Swap ${appointment.patient.name} with next present patient?`,
        };

        Alert.alert('Confirm', messages[action], [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                style: action === 'noshow' ? 'destructive' : 'default',
                onPress: () => executeAction(appointment.id, action)
            }
        ]);
    };

    const executeAction = async (appointmentId, action) => {
        try {
            const endpoints = {
                checkin:  `/api/queue/checkin/${appointmentId}`,
                complete: `/api/queue/complete/${appointmentId}`,
                noshow:   `/api/queue/noshow/${appointmentId}`,
                swap:     `/api/queue/swap/${appointmentId}`,
            };
            await api.put(endpoints[action]);
            fetchQueue();
        } catch (error) {
            Alert.alert('Error', error.response?.data || 'Action failed.');
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'BOOKED':      return { color: '#2563EB', bg: '#EFF6FF', label: 'Booked' };
            case 'CHECKED_IN':  return { color: '#16A34A', bg: '#DCFCE7', label: 'Checked In' };
            case 'IN_PROGRESS': return { color: '#7C3AED', bg: '#F5F3FF', label: 'In Progress' };
            default:            return { color: '#6B7280', bg: '#F3F4F6', label: status };
        }
    };

    const renderItem = ({ item, index }) => {
        const config = getStatusConfig(item.status);
        const time = new Date(item.appointmentTime).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        });

        return (
            <View style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.positionBadge}>
                        <Text style={styles.positionText}>#{item.queuePosition}</Text>
                    </View>
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{item.patient.name}</Text>
                        <Text style={styles.patientMeta}>
                            {item.patient.age} yrs • {item.patient.gender}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                {/* Time and late arrival */}
                <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.timeText}>Slot: {time}</Text>
                    {item.lateArrival && (
                        <View style={styles.lateBadge}>
                            <Ionicons name="warning-outline" size={12} color="#D97706" />
                            <Text style={styles.lateText}>Late arrival</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    {item.status === 'BOOKED' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.checkinBtn]}
                                onPress={() => handleAction(item, 'checkin')}>
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                <Text style={styles.actionBtnText}>Check In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.swapBtn]}
                                onPress={() => handleAction(item, 'swap')}>
                                <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                                <Text style={styles.actionBtnText}>Swap</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.noshowBtn]}
                                onPress={() => handleAction(item, 'noshow')}>
                                <Ionicons name="close" size={16} color="#FFFFFF" />
                                <Text style={styles.actionBtnText}>No Show</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {item.status === 'CHECKED_IN' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.completeBtn]}
                            onPress={() => handleAction(item, 'complete')}>
                            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Mark Complete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live Queue</Text>
                <Text style={styles.headerSubtitle}>
                    {queue.length} patient{queue.length !== 1 ? 's' : ''} today
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
            ) : (
                <FlatList
                    data={queue}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            fetchQueue();
                        }} colors={['#2563EB']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color="#E5E7EB" />
                            <Text style={styles.emptyTitle}>No Patients Today</Text>
                            <Text style={styles.emptySubtitle}>
                                Your queue will appear here when patients book appointments
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
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    positionBadge: {
        width: 40,
        height: 40,
        backgroundColor: '#EFF6FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    positionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    patientMeta: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    timeText: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
    },
    lateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    lateText: {
        fontSize: 11,
        color: '#D97706',
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 4,
    },
    actionBtnText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    checkinBtn:  { backgroundColor: '#16A34A' },
    swapBtn:     { backgroundColor: '#2563EB' },
    noshowBtn:   { backgroundColor: '#DC2626' },
    completeBtn: { backgroundColor: '#7C3AED' },
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
        paddingHorizontal: 40,
    },
});