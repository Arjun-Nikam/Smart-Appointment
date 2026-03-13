import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function BookAppointmentScreen({ route, navigation }) {
    const { doctor } = route.params;
    const [loading, setLoading] = useState(false);
        const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const isInShift = doctor.shifts && doctor.shifts.some(shift => {
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH,   endM]   = shift.endTime.split(':').map(Number);
        return currentTime >= (startH * 60 + startM) &&
               currentTime <= (endH   * 60 + endM);
    });
    const statusText  = !doctor.available ? 'Unavailable'   :
                         isInShift        ? 'Available Now' : 'Outside Hours';
    const statusColor = !doctor.available ? '#DC2626'       :
                         isInShift        ? '#16A34A'       : '#D97706';

    const handleBookAppointment = async () => {
        Alert.alert(
            'Confirm Booking',
            `Book appointment with ${doctor.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await api.post('/api/appointments/book', {
                                doctorId: doctor.id
                            });
                            Alert.alert(
                                'Booked! ✅',
                                'Your appointment has been booked successfully.',
                                [{
                                    text: 'View Queue',
                                    onPress: () => navigation.navigate('Queue')
                                }]
                            );
                        } catch (error) {
                            Alert.alert('Error',
                                error.response?.data || 'Booking failed.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book Appointment</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Doctor Profile Card */}
                <View style={styles.doctorCard}>
                    <View style={styles.doctorAvatar}>
                        <Ionicons name="person" size={40} color="#2563EB" />
                    </View>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>

                    <View style={styles.divider} />

                    {/* Doctor Details */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="business-outline" size={20} color="#2563EB" />
                            <Text style={styles.detailLabel}>Hospital</Text>
                            <Text style={styles.detailValue}>{doctor.hospitalName}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={20} color="#2563EB" />
                            <Text style={styles.detailLabel}>Duration</Text>
                            <Text style={styles.detailValue}>
                                {doctor.averageConsultationTime} min
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="checkmark-circle-outline" size={20}
                                color={statusColor} />
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={[styles.detailValue, { color: statusColor }]}>
                                {statusText}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Shifts */}
                {doctor.shifts && doctor.shifts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Shifts</Text>
                        {doctor.shifts.map((shift, index) => (
                            <View key={index} style={styles.shiftCard}>
                                <Ionicons name="sunny-outline" size={20} color="#F59E0B" />
                                <Text style={styles.shiftText}>
                                    {shift.startTime} — {shift.endTime}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* How it works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    {[
                        { icon: 'calendar-outline',      text: 'Your slot is auto-assigned based on queue' },
                        { icon: 'location-outline',      text: 'Arrive at the hospital on time' },
                        { icon: 'checkmark-circle-outline', text: 'Check in at reception' },
                        { icon: 'time-outline',          text: 'Track your queue position live' },
                    ].map((item, index) => (
                        <View key={index} style={styles.howItWorksRow}>
                            <View style={styles.howItWorksIcon}>
                                <Ionicons name={item.icon} size={18} color="#2563EB" />
                            </View>
                            <Text style={styles.howItWorksText}>{item.text}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                    styles.bookButton,
                    (!isInShift || !doctor.available || loading) && styles.bookButtonDisabled
                ]}
                onPress={handleBookAppointment}
                disabled={!isInShift || !doctor.available || loading}>
                {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <>
                        <Ionicons name="calendar" size={20} color="#FFFFFF" />
                        <Text style={styles.bookButtonText}>
                            {isInShift && doctor.available ? 'Book Appointment' : statusText}
                        </Text>
                    </>
                }
                </TouchableOpacity>
            </View>
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
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    doctorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    doctorAvatar: {
        width: 80,
        height: 80,
        backgroundColor: '#EFF6FF',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    doctorName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 15,
        color: '#2563EB',
        fontWeight: '500',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    detailItem: {
        alignItems: 'center',
        gap: 4,
    },
    detailLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    section: {
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    shiftCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        gap: 10,
    },
    shiftText: {
        fontSize: 14,
        color: '#92400E',
        fontWeight: '500',
    },
    howItWorksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    howItWorksIcon: {
        width: 36,
        height: 36,
        backgroundColor: '#EFF6FF',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    howItWorksText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    bookButton: {
        backgroundColor: '#2563EB',
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    bookButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});