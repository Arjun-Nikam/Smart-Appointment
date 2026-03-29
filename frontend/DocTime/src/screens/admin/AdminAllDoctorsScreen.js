import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function AdminAllDoctorsScreen() {
    const [doctors, setDoctors]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchDoctors(); }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/api/admin/all-doctors');
            setDoctors(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load doctors.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'APPROVED': return { color: '#16A34A', bg: '#DCFCE7', label: 'Approved' };
            case 'PENDING':  return { color: '#D97706', bg: '#FEF3C7', label: 'Pending' };
            case 'REJECTED': return { color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' };
            default:         return { color: '#6B7280', bg: '#F3F4F6', label: status };
        }
    };

    const renderItem = ({ item }) => {
        const config = getStatusConfig(item.status);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color="#2563EB" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.specialty}>{item.specialization}</Text>
                        <Text style={styles.hospital}>{item.hospitalName}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Doctors</Text>
                <Text style={styles.headerSubtitle}>
                    {doctors.length} total
                </Text>
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
                            fetchDoctors();
                        }} colors={['#2563EB']} />
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
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    headerTitle:    { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    loader:         { flex: 1 },
    listContent:    { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16,
        padding: 16, marginBottom: 12, elevation: 2,
    },
    cardHeader:     { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 48, height: 48, backgroundColor: '#EFF6FF',
        borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    info:           { flex: 1 },
    name:           { fontSize: 15, fontWeight: '600', color: '#111827' },
    specialty:      { fontSize: 13, color: '#2563EB', fontWeight: '500', marginTop: 2 },
    hospital:       { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    email:          { fontSize: 12, color: '#6B7280', marginTop: 2 },
    statusBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusText:     { fontSize: 12, fontWeight: '600' },
});