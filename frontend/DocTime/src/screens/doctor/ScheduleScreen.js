import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const TIME_SLOTS = [
    '06:00:00', '07:00:00', '08:00:00', '09:00:00',
    '10:00:00', '11:00:00', '12:00:00', '13:00:00',
    '14:00:00', '15:00:00', '16:00:00', '17:00:00',
    '18:00:00', '19:00:00', '20:00:00', '21:00:00',
    '22:00:00'
];

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
};

export default function ScheduleScreen() {
    const { logout } = useAuth();

    const [available, setAvailable] = useState(true);
    const [shifts, setShifts]       = useState([
        { startTime: '09:00:00', endTime: '13:00:00' }
    ]);
    const [loading, setLoading] = useState(false);

    const addShift = () => {
        if (shifts.length >= 3) {
            Alert.alert('Limit reached', 'Maximum 3 shifts allowed.');
            return;
        }
        setShifts([...shifts, { startTime: '09:00:00', endTime: '17:00:00' }]);
    };

    const removeShift = (index) => {
        setShifts(shifts.filter((_, i) => i !== index));
    };

    const updateShift = (index, field, value) => {
        const updated = [...shifts];
        updated[index] = { ...updated[index], [field]: value };
        setShifts(updated);
    };

    const handleSave = async () => {
        // Validate shifts
        for (let shift of shifts) {
            if (shift.startTime >= shift.endTime) {
                Alert.alert('Invalid Shift',
                    'End time must be after start time.');
                return;
            }
        }

        setLoading(true);
        try {
            await api.put('/api/doctors/my-schedule', { available, shifts });
            Alert.alert('Success ✅', 'Schedule updated successfully!');
        } catch (error) {
            Alert.alert('Error', error.response?.data || 'Update failed.');
        } finally {
            setLoading(false);
        }
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Schedule</Text>
                    <Text style={styles.headerSubtitle}>Manage your availability</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Availability Toggle */}
                <View style={styles.card}>
                    <View style={styles.availabilityRow}>
                        <View>
                            <Text style={styles.cardTitle}>Accepting Patients</Text>
                            <Text style={styles.cardSubtitle}>
                                {available ? 'You are available today' : 'You are unavailable today'}
                            </Text>
                        </View>
                        <Switch
                            value={available}
                            onValueChange={setAvailable}
                            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                            thumbColor={available ? '#2563EB' : '#9CA3AF'}
                        />
                    </View>
                </View>

                {/* Shifts */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Working Shifts</Text>
                        <TouchableOpacity
                            style={styles.addShiftBtn}
                            onPress={addShift}>
                            <Ionicons name="add" size={18} color="#2563EB" />
                            <Text style={styles.addShiftText}>Add Shift</Text>
                        </TouchableOpacity>
                    </View>

                    {shifts.length === 0 && (
                        <Text style={styles.noShiftsText}>
                            No shifts added. Tap "Add Shift" to add one.
                        </Text>
                    )}

                    {shifts.map((shift, index) => (
                        <View key={index} style={styles.shiftCard}>
                            <View style={styles.shiftHeader}>
                                <Text style={styles.shiftTitle}>Shift {index + 1}</Text>
                                <TouchableOpacity onPress={() => removeShift(index)}>
                                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                                </TouchableOpacity>
                            </View>

                            {/* Start Time */}
                            <Text style={styles.timeLabel}>Start Time</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.timeScroll}>
                                {TIME_SLOTS.slice(0, -1).map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeChip,
                                            shift.startTime === time && styles.timeChipActive
                                        ]}
                                        onPress={() => updateShift(index, 'startTime', time)}>
                                        <Text style={[
                                            styles.timeChipText,
                                            shift.startTime === time && styles.timeChipTextActive
                                        ]}>
                                            {formatTime(time)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* End Time */}
                            <Text style={styles.timeLabel}>End Time</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.timeScroll}>
                                {TIME_SLOTS.slice(1).map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeChip,
                                            shift.endTime === time && styles.timeChipActive
                                        ]}
                                        onPress={() => updateShift(index, 'endTime', time)}>
                                        <Text style={[
                                            styles.timeChipText,
                                            shift.endTime === time && styles.timeChipTextActive
                                        ]}>
                                            {formatTime(time)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.saveButtonText}>Save Schedule</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
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
    logoutButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    availabilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addShiftBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    addShiftText: {
        fontSize: 13,
        color: '#2563EB',
        fontWeight: '600',
    },
    noShiftsText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingVertical: 20,
    },
    shiftCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    shiftHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    shiftTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    timeLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 8,
    },
    timeScroll: {
        marginBottom: 12,
    },
    timeChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
    },
    timeChipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    timeChipText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    timeChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
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
    saveButton: {
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
    saveButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});