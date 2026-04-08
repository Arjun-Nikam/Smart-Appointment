import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function SignupScreen({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        age: '',
        gender: '',
    });
    const [loading, setLoading]       = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const updateForm = (key, value) => setForm({ ...form, [key]: value });

    const handleSignup = async () => {
        if (!form.name || !form.email || !form.password ||
            !form.phoneNumber || !form.age || !form.gender) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/patient/signup', form);
            Alert.alert(
                'Success!',
                'Account created successfully. Please sign in.',
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
                        <Ionicons name="person-add" size={36} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>Create Account</Text>
                    <Text style={styles.tagline}>Join DocTime today</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {/* Full Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full name"
                            placeholderTextColor="#9CA3AF"
                            value={form.name}
                            onChangeText={(v) => updateForm('name', v)}
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
                            value={form.email}
                            onChangeText={(v) => updateForm('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone number (10 digits)"
                            placeholderTextColor="#9CA3AF"
                            value={form.phoneNumber}
                            onChangeText={(v) => updateForm('phoneNumber', v)}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>

                    {/* Age */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="calendar-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Age"
                            placeholderTextColor="#9CA3AF"
                            value={form.age}
                            onChangeText={(v) => updateForm('age', v)}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>

                    {/* Gender */}
                    <Text style={styles.genderLabel}>Gender</Text>
                    <View style={styles.genderRow}>
                        {['Male', 'Female', 'Other'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.genderButton,
                                    form.gender === g && styles.genderButtonActive
                                ]}
                                onPress={() => updateForm('gender', g)}>
                                <Text style={[
                                    styles.genderButtonText,
                                    form.gender === g && styles.genderButtonTextActive
                                ]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF"
                            style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            value={form.password}
                            onChangeText={(v) => updateForm('password', v)}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Password hint */}
                    <Text style={styles.hint}>
                        Password must have uppercase, number and special character
                    </Text>

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, loading && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}>
                        {loading
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.signupButtonText}>Create Account</Text>}
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
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: '#2563EB',
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
    },
    logoContainer: {
        width: 70,
        height: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    appName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    form: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    genderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    genderButtonActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    genderButtonText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    genderButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 20,
        marginTop: -8,
    },
    signupButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#6B7280',
        fontSize: 14,
    },
    loginLink: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '600',
    },
});