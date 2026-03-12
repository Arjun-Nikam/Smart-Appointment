import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, FlatList, ActivityIndicator,
    Alert, RefreshControl, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function DashboardScreen({ navigation }) {
    const { user, logout } = useAuth();

    const [doctors, setDoctors]         = useState([]);
    const [categories, setCategories]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [searchText, setSearchText]   = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [doctorsRes, categoriesRes] = await Promise.all([
                api.get('/api/dashboard/all'),
                api.get('/api/dashboard/categories'),
            ]);
            setDoctors(doctorsRes.data);
            setCategories(['All', ...categoriesRes.data]);
        } catch (error) {
            Alert.alert('Error', 'Failed to load doctors.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleSearch = async (text) => {
        setSearchText(text);
        if (text.length < 2) {
            fetchData();
            return;
        }
        try {
            const res = await api.get(`/api/dashboard/search?name=${text}`);
            setDoctors(res.data);
        } catch (error) {
            console.log('Search error:', error);
        }
    };

    const handleCategoryFilter = async (category) => {
        setSelectedCategory(category);
        setSearchText('');
        if (category === 'All') {
            fetchData();
            return;
        }
        try {
            const res = await api.get(`/api/dashboard/specialty/${category}`);
            setDoctors(res.data);
        } catch (error) {
            console.log('Filter error:', error);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    try {
                        await api.post('/api/auth/logout');
                    } catch (e) {}
                    await logout();
                }
            }
        ]);
    };

    const renderDoctorCard = ({ item }) => (
        <TouchableOpacity
            style={styles.doctorCard}
            onPress={() => navigation.navigate('BookAppointment', { doctor: item })}>
            <View style={styles.doctorCardLeft}>
                <View style={styles.doctorAvatar}>
                    <Ionicons name="person" size={28} color="#2563EB" />
                </View>
                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <Text style={styles.doctorSpecialty}>{item.specialization}</Text>
                    <Text style={styles.doctorHospital}>
                        <Ionicons name="business-outline" size={12} color="#9CA3AF" />
                        {' '}{item.hospitalName}
                    </Text>
                    <View style={styles.doctorMeta}>
                        <View style={styles.metaBadge}>
                            <Ionicons name="time-outline" size={12} color="#2563EB" />
                            <Text style={styles.metaText}>
                                {item.averageConsultationTime} min
                            </Text>
                        </View>
                        <View style={[
                            styles.availableBadge,
                            !item.available && styles.unavailableBadge
                        ]}>
                            <Text style={[
                                styles.availableText,
                                !item.available && styles.unavailableText
                            ]}>
                                {item.available ? 'Available' : 'Unavailable'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Hello, {user?.name?.split(' ')[0]} 👋
                    </Text>
                    <Text style={styles.subGreeting}>Find your doctor today</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#9CA3AF"
                    style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search doctors by name..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={handleSearch}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat && styles.categoryChipActive
                        ]}
                        onPress={() => handleCategoryFilter(cat)}>
                        <Text style={[
                            styles.categoryChipText,
                            selectedCategory === cat && styles.categoryChipTextActive
                        ]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Doctors List */}
            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderDoctorCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                            colors={['#2563EB']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search" size={48} color="#E5E7EB" />
                            <Text style={styles.emptyText}>No doctors found</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subGreeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    logoutButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    categoriesContainer: {
        maxHeight: 50,
        marginBottom: 12,
    },
    categoriesContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    categoryChipText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    doctorCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        backgroundColor: '#EFF6FF',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    doctorSpecialty: {
        fontSize: 13,
        color: '#2563EB',
        fontWeight: '500',
        marginBottom: 2,
    },
    doctorHospital: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 6,
    },
    doctorMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 3,
    },
    metaText: {
        fontSize: 11,
        color: '#2563EB',
        fontWeight: '500',
    },
    availableBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    unavailableBadge: {
        backgroundColor: '#FEE2E2',
    },
    availableText: {
        fontSize: 11,
        color: '#16A34A',
        fontWeight: '500',
    },
    unavailableText: {
        color: '#DC2626',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        marginTop: 12,
    },
});