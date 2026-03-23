import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function DoctorSignupScreen({ navigation }) {
    const [name, setName]                 = useState('');
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [specialization, setSpecialization] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [consultationTime, setConsultationTime] = useState('');
    const [loading, setLoading]           = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password || !specialization || !hospitalName || !consultationTime) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/doctor/signup', {
                name,
                email,
                password,
                specialization,
                hospitalName,
                averageConsultationTime: parseInt(consultationTime),
                latitude: 0.0,
                longitude: 0.0,
            });
            Alert.alert(
                'Application Submitted! ✅',
                'Your account is pending admin approval. You will be able to login once approved.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Error', error.response?.data || 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.logoContainer}>
                        <Ionicons name="medical" size={40} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>Join DocTime</Text>
                    <Text style={styles.tagline}>Register as a Doctor</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.title}>Doctor Registration</Text>
                    <Text style={styles.subtitle}>
                        Fill in your details. Admin will review and approve your account.
                    </Text>

                    {/* Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor="#9CA3AF"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Specialization */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="ribbon-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Specialization (e.g. Cardiologist)"
                            placeholderTextColor="#9CA3AF"
                            value={specialization}
                            onChangeText={setSpecialization}
                        />
                    </View>

                    {/* Hospital */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="business-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Hospital Name"
                            placeholderTextColor="#9CA3AF"
                            value={hospitalName}
                            onChangeText={setHospitalName}
                        />
                    </View>

                    {/* Consultation Time */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="time-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Avg. Consultation Time (minutes)"
                            placeholderTextColor="#9CA3AF"
                            value={consultationTime}
                            onChangeText={setConsultationTime}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
                        <Text style={styles.infoText}>
                            Your application will be reviewed by admin before activation.
                        </Text>
                    </View>

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}>
                        {loading
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.signupButtonText}>Submit Application</Text>}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container:          { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent:      { flexGrow: 1 },
    header: {
        backgroundColor: '#2563EB',
        paddingTop: 60, paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: 'absolute',
        top: 55, left: 24,
    },
    logoContainer: {
        width: 80, height: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    appName:    { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    tagline:    { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    form:       { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
    title:      { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
    subtitle:   { fontSize: 13, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1,
    },
    inputIcon:  { marginRight: 12 },
    input:      { flex: 1, fontSize: 15, color: '#111827' },
    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: '#EFF6FF', borderRadius: 10,
        padding: 12, marginBottom: 20, gap: 8,
    },
    infoText:   { flex: 1, fontSize: 13, color: '#2563EB', lineHeight: 18 },
    signupButton: {
        backgroundColor: '#2563EB', borderRadius: 12,
        paddingVertical: 16, alignItems: 'center',
        elevation: 4,
    },
    signupButtonDisabled: { opacity: 0.7 },
    signupButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    loginRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    loginText:  { color: '#6B7280', fontSize: 14 },
    loginLink:  { color: '#2563EB', fontSize: 14, fontWeight: '600' },
});