import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/patient/LoginScreen';
import SignupScreen from '../screens/patient/SignupScreen';

// Patient Screens
import PatientTabNavigator from './PatientTabNavigator';

// Doctor Screens
import DoctorTabNavigator from './DoctorTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isLoggedIn, isPatient, isDoctor, loading } = useAuth();

    // Show spinner while loading saved token
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                // Not logged in — show auth screens
                <>
                    <Stack.Screen name="Login"  component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            ) : isPatient ? (
                // Logged in as patient
                <Stack.Screen name="PatientHome" component={PatientTabNavigator} />
            ) : isDoctor ? (
                // Logged in as doctor
                <Stack.Screen name="DoctorHome" component={DoctorTabNavigator} />
            ) : null}
        </Stack.Navigator>
    );
}