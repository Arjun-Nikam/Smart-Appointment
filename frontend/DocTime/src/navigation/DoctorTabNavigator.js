import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LiveQueueScreen  from '../screens/doctor/LiveQueueScreen';
import ScheduleScreen   from '../screens/doctor/ScheduleScreen';

const Tab = createBottomTabNavigator();

export default function DoctorTabNavigator() {
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
                    paddingBottom: 20,
                    paddingTop: 5,
                    height: 80,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if      (route.name === 'LiveQueue') iconName = focused ? 'list'     : 'list-outline';
                    else if (route.name === 'Schedule')  iconName = focused ? 'calendar' : 'calendar-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="LiveQueue" component={LiveQueueScreen} />
            <Tab.Screen name="Schedule"  component={ScheduleScreen} />
        </Tab.Navigator>
    );
}