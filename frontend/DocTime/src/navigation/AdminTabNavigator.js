import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdminPendingScreen from '../screens/admin/AdminPendingScreen';
import AdminAllDoctorsScreen from '../screens/admin/AdminAllDoctorsScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
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
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'Pending')    iconName = focused ? 'time'   : 'time-outline';
                    else if (route.name === 'AllDoctors') iconName = focused ? 'people' : 'people-outline';
                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}>
            <Tab.Screen name="Pending"    component={AdminPendingScreen}
                options={{ tabBarLabel: 'Pending' }} />
            <Tab.Screen name="AllDoctors" component={AdminAllDoctorsScreen}
                options={{ tabBarLabel: 'All Doctors' }} />
        </Tab.Navigator>
    );
}