import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen       from '../screens/patient/DashboardScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import QueueScreen           from '../screens/patient/QueuePositionScreen';
import HistoryScreen         from '../screens/patient/HistoryScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain"   component={DashboardScreen} />
            <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        </Stack.Navigator>
    );
}

export default function PatientTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor:   '#2563EB',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 5,
                    paddingTop: 5,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if      (route.name === 'Home')    iconName = focused ? 'home'           : 'home-outline';
                    else if (route.name === 'Queue')   iconName = focused ? 'time'           : 'time-outline';
                    else if (route.name === 'History') iconName = focused ? 'calendar-clear' : 'calendar-clear-outline';
                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home"    component={DashboardStack} />
            <Tab.Screen name="Queue"   component={QueueScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
        </Tab.Navigator>
    );
}