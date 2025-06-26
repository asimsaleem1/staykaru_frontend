import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/LoadingSpinner';

const App = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Simple delay to let Expo handle font loading
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (!isReady) {
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <LoadingSpinner size="large" text="Loading StayKaru..." />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <AppNavigator />
        </SafeAreaProvider>
    );
};

export default App;
