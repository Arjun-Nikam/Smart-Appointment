import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LiveQueueScreen from '../screens/doctor/LiveQueueScreen';
import ScheduleScreen  from '../screens/doctor/ScheduleScreen';

const Tab = createBottomTabNavigator();

export default function DoctorTabNavigator() {
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
                    if      (route.name === 'LiveQueue') iconName = focused ? 'list'     : 'list-outline';
                    else if (route.name === 'Schedule')  iconName = focused ? 'calendar' : 'calendar-outline';
                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="LiveQueue" component={LiveQueueScreen} />
            <Tab.Screen name="Schedule"  component={ScheduleScreen} />
        </Tab.Navigator>
    );
}