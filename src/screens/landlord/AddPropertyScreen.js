import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AddPropertyScreen = ({ navigation }) => {
    const [property, setProperty] = useState({
        title: '',
        description: '',
        type: 'apartment',
        price: '',
        location: '',
        amenities: [],
        images: [],
        bedrooms: '1',
        bathrooms: '1',
        area: '',
        furnishing: 'unfurnished'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!property.title || !property.price || !property.location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // API call to create property
            // await createProperty(property);
            Alert.alert('Success', 'Property added successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Property</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Property Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.title}
                            onChangeText={(text) => setProperty({...property, title: text})}
                            placeholder="Enter property title"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={property.description}
                            onChangeText={(text) => setProperty({...property, description: text})}
                            placeholder="Describe your property"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Monthly Rent *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.price}
                            onChangeText={(text) => setProperty({...property, price: text})}
                            placeholder="Enter monthly rent"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.location}
                            onChangeText={(text) => setProperty({...property, location: text})}
                            placeholder="Enter property location"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>
                    
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.flex1]}>
                            <Text style={styles.label}>Bedrooms</Text>
                            <TextInput
                                style={styles.input}
                                value={property.bedrooms}
                                onChangeText={(text) => setProperty({...property, bedrooms: text})}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                            <Text style={styles.label}>Bathrooms</Text>
                            <TextInput
                                style={styles.input}
                                value={property.bathrooms}
                                onChangeText={(text) => setProperty({...property, bathrooms: text})}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Area (sq ft)</Text>
                        <TextInput
                            style={styles.input}
                            value={property.area}
                            onChangeText={(text) => setProperty({...property, area: text})}
                            placeholder="Enter area in square feet"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabledButton]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Add Property</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2c3e50',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ecf0f1',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    marginLeft: {
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: '#3498db',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddPropertyScreen;
