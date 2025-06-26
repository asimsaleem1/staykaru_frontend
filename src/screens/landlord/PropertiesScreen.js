import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PropertiesScreen = ({ navigation }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            // Mock data for now
            setProperties([
                {
                    id: '1',
                    title: 'Modern Studio Apartment',
                    location: 'Downtown Campus',
                    price: 1200,
                    status: 'available',
                    bedrooms: 1,
                    bathrooms: 1
                },
                {
                    id: '2',
                    title: 'Shared Room in House',
                    location: 'University District',
                    price: 600,
                    status: 'occupied',
                    bedrooms: 1,
                    bathrooms: 1
                }
            ]);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProperties();
    };

    const renderProperty = ({ item }) => (
        <TouchableOpacity 
            style={styles.propertyCard}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
        >
            <View style={styles.propertyHeader}>
                <Text style={styles.propertyTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#2ecc71' : '#e74c3c' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <Text style={styles.propertyLocation}>
                <Ionicons name="location-outline" size={16} color="#7f8c8d" />
                {' '}{item.location}
            </Text>
            
            <View style={styles.propertyDetails}>
                <Text style={styles.propertyPrice}>${item.price}/month</Text>
                <Text style={styles.propertySpecs}>
                    {item.bedrooms} bed • {item.bathrooms} bath
                </Text>
            </View>
        </TouchableOpacity>
    );

    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Properties</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddProperty')}>
                    <Ionicons name="add" size={24} color="#3498db" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredProperties}
                renderItem={renderProperty}
                keyExtractor={(item) => item.id}
                style={styles.propertyList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="home-outline" size={64} color="#bdc3c7" />
                        <Text style={styles.emptyTitle}>No Properties Found</Text>
                        <Text style={styles.emptySubtitle}>Start by adding your first property</Text>
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => navigation.navigate('AddProperty')}
                        >
                            <Text style={styles.addButtonText}>Add Property</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ecf0f1',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2c3e50',
    },
    propertyList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    propertyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ecf0f1',
    },
    propertyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    propertyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    propertyLocation: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 12,
    },
    propertyDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    propertyPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3498db',
    },
    propertySpecs: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 30,
    },
    addButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PropertiesScreen;
