// Web-specific version of AccommodationDetailScreen without maps
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
    Share,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AccommodationDetailScreen = ({ navigation, route }) => {
    const { id } = route.params;
    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        loadAccommodationDetail();
    }, [id]);

    const loadAccommodationDetail = async () => {
        try {
            setLoading(true);
            const response = await authService.makeAuthenticatedRequest(`/accommodations/${id}`);
            setAccommodation(response.data);
        } catch (error) {
            console.error('Load accommodation detail error:', error);
            Alert.alert('Error', 'Failed to load accommodation details');
        } finally {
            setLoading(false);
        }
    };

    // Placeholder implementation - use the main file for full implementation
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Web version under development</Text>
            <Text>Please use mobile app for full functionality</Text>
        </View>
    );
};

export default AccommodationDetailScreen;
