import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/LoadingSpinner';
import backendStatusService from './src/services/backendStatusService';
import realTimeApiService from './src/services/realTimeApiService';

const App = () => {
    const [isReady, setIsReady] = useState(false);
    const [backendStatus, setBackendStatus] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            console.log('🚀 Initializing StayKaru App...');
            
            // Initialize backend status monitoring
            console.log('🔍 Checking backend connectivity...');
            const isBackendHealthy = await backendStatusService.forceCheck();
            setBackendStatus(isBackendHealthy);
            
            if (isBackendHealthy) {
                console.log('✅ Backend is healthy and connected');
                
                // Initialize real-time services
                console.log('🔄 Initializing real-time services...');
                realTimeApiService.startRealTimeUpdates();
                
                // Add backend status listener
                backendStatusService.addListener((status) => {
                    setBackendStatus(status);
                    if (status) {
                        console.log('✅ Backend reconnected, restarting real-time services');
                        realTimeApiService.startRealTimeUpdates();
                    } else {
                        console.log('⚠️ Backend disconnected, pausing real-time services');
                        realTimeApiService.stopRealTimeUpdates();
                    }
                });
            } else {
                console.log('⚠️ Backend is currently unavailable, app will work with limited functionality');
            }
            
            // Simple delay to let Expo handle font loading
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 1000);

            return () => clearTimeout(timer);
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            setIsReady(true); // Still show app even if initialization fails
        }
    };

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
            <AppNavigator backendStatus={backendStatus} />
        </SafeAreaProvider>
    );
};

export default App;
