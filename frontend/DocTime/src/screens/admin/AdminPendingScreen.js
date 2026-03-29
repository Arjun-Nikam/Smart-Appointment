import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, Alert, ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminPendingScreen() {
    const { logout } = useAuth();
    const [doctors, setDoctors]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchPending(); }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/api/admin/pending-doctors');
            setDoctors(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load pending doctors.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAction = (doctor, action) => {
        const msg = action === 'approve'
            ? `Approve Dr. ${doctor.name}?`
            : `Reject Dr. ${doctor.name}?`;

        Alert.alert('Confirm', msg, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: action === 'approve' ? 'Approve' : 'Reject',
                style: action === 'reject' ? 'destructive' : 'default',
                onPress: async () => {
                    try {
                        await api.put(`/api/admin/${action}/${doctor.id}`);
                        Alert.alert('Success', `Doctor ${action}d successfully!`);
                        fetchPending();
                    } catch (error) {
                        Alert.alert('Error', 'Action failed.');
                    }
                }
            }
        ]);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    try { await api.post('/api/auth/logout'); } catch (e) {}
                    await logout();
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#2563EB" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.specialty}>{item.specialization}</Text>
                    <Text style={styles.hospital}>
                        <Ionicons name="business-outline" size={12} color="#9CA3AF" />
                        {' '}{item.hospitalName}
                    </Text>
                    <Text style={styles.email}>{item.email}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleAction(item, 'approve')}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleAction(item, 'reject')}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                    <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Pending Approvals</Text>
                    <Text style={styles.headerSubtitle}>
                        {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} waiting
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            fetchPending();
                        }} colors={['#2563EB']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-circle" size={64} color="#DCFCE7" />
                            <Text style={styles.emptyTitle}>All Caught Up!</Text>
                            <Text style={styles.emptySubtitle}>No pending approvals</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container:      { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        backgroundColor: '#2563EB',
        paddingTop: 55, paddingBottom: 20, paddingHorizontal: 24,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    headerTitle:    { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    logoutButton: {
        width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    },
    loader:         { flex: 1 },
    listContent:    { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
        marginBottom: 12, elevation: 2,
    },
    cardHeader:     { flexDirection: 'row', marginBottom: 14 },
    avatar: {
        width: 48, height: 48, backgroundColor: '#EFF6FF',
        borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    info:           { flex: 1 },
    name:           { fontSize: 16, fontWeight: '600', color: '#111827' },
    specialty:      { fontSize: 13, color: '#2563EB', fontWeight: '500', marginTop: 2 },
    hospital:       { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    email:          { fontSize: 12, color: '#6B7280', marginTop: 2 },
    actions:        { flexDirection: 'row', gap: 10 },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', paddingVertical: 10,
        borderRadius: 10, gap: 6,
    },
    approveBtn:     { backgroundColor: '#16A34A' },
    rejectBtn:      { backgroundColor: '#DC2626' },
    actionText:     { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyTitle:     { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 16 },
    emptySubtitle:  { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});