import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/patient/LoginScreen';
import SignupScreen from '../screens/patient/SignupScreen';
import DoctorSignupScreen from '../screens/doctor/DoctorSignupScreen';

// Navigators
import PatientTabNavigator from './PatientTabNavigator';
import DoctorTabNavigator from './DoctorTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isLoggedIn, isPatient, isDoctor, isAdmin, loading } = useAuth();

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
                <>
                    <Stack.Screen name="Login"        component={LoginScreen} />
                    <Stack.Screen name="Signup"       component={SignupScreen} />
                    <Stack.Screen name="DoctorSignup" component={DoctorSignupScreen} />
                </>
            ) : isPatient ? (
                <Stack.Screen name="PatientHome" component={PatientTabNavigator} />
            ) : isDoctor ? (
                <Stack.Screen name="DoctorHome"  component={DoctorTabNavigator} />
            ) : isAdmin ? (
                <Stack.Screen name="AdminHome"   component={AdminTabNavigator} />
            ) : null}
        </Stack.Navigator>
    );
}