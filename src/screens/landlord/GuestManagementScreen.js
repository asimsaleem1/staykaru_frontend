import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const GuestManagementScreen = ({ navigation, route }) => {
    const { guestId } = route.params || {};
    
    const [guests, setGuests] = useState([]);
    const [filteredGuests, setFilteredGuests] = useState([]);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [guestNotes, setGuestNotes] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filterOptions = [
        { key: 'all', label: 'All Guests', icon: 'people-outline' },
        { key: 'active', label: 'Active Bookings', icon: 'calendar-outline' },
        { key: 'returning', label: 'Returning Guests', icon: 'repeat-outline' },
        { key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
    ];

    useEffect(() => {
        loadGuests();
        if (guestId) {
            loadGuestDetails(guestId);
        }
    }, [guestId]);

    useEffect(() => {
        filterGuests();
    }, [guests, searchQuery, filterType]);

    const loadGuests = async () => {
        try {
            setLoading(true);
            const response = await fetchFromBackend('/landlord/guests');
            
            if (response.success) {
                setGuests(response.data);
                console.log('✅ Guests loaded successfully');
            } else {
                Alert.alert('Error', 'Failed to load guests');
            }
        } catch (error) {
            console.error('❌ Error loading guests:', error);
            Alert.alert('Error', 'Failed to load guests');
        } finally {
            setLoading(false);
        }
    };

    const loadGuestDetails = async (guestId) => {
        try {
            const response = await fetchFromBackend(`/landlord/guests/${guestId}`);
            
            if (response.success) {
                setSelectedGuest(response.data);
                setShowGuestModal(true);
                console.log('✅ Guest details loaded successfully');
            } else {
                Alert.alert('Error', 'Failed to load guest details');
            }
        } catch (error) {
            console.error('❌ Error loading guest details:', error);
            Alert.alert('Error', 'Failed to load guest details');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadGuests();
        setRefreshing(false);
    };

    const filterGuests = () => {
        let filtered = guests;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(guest =>
                guest.name.toLowerCase().includes(query) ||
                guest.email.toLowerCase().includes(query) ||
                guest.phone.includes(query)
            );
        }

        // Apply type filter
        switch (filterType) {
            case 'active':
                filtered = filtered.filter(guest => guest.hasActiveBooking);
                break;
            case 'returning':
                filtered = filtered.filter(guest => guest.totalBookings > 1);
                break;
            case 'favorites':
                filtered = filtered.filter(guest => guest.isFavorite);
                break;
            default:
                break;
        }

        setFilteredGuests(filtered);
    };

    const toggleFavoriteGuest = async (guestId) => {
        try {
            const response = await fetchFromBackend(`/landlord/guests/${guestId}/favorite`, {
                method: 'PUT',
                body: JSON.stringify({ isFavorite: !guests.find(g => g.id === guestId)?.isFavorite }),
            });

            if (response.success) {
                setGuests(prev => prev.map(guest => 
                    guest.id === guestId 
                        ? { ...guest, isFavorite: !guest.isFavorite }
                        : guest
                ));
                console.log('✅ Guest favorite status updated');
            } else {
                Alert.alert('Error', 'Failed to update favorite status');
            }
        } catch (error) {
            console.error('❌ Error updating favorite status:', error);
            Alert.alert('Error', 'Failed to update favorite status');
        }
    };

    const addGuestNote = async () => {
        if (!selectedGuest || !guestNotes.trim()) return;

        try {
            const response = await fetchFromBackend(`/landlord/guests/${selectedGuest.id}/notes`, {
                method: 'POST',
                body: JSON.stringify({ note: guestNotes.trim() }),
            });

            if (response.success) {
                Alert.alert('Success', 'Note added successfully');
                setGuestNotes('');
                setShowNotesModal(false);
                // Refresh guest details
                loadGuestDetails(selectedGuest.id);
                console.log('✅ Guest note added successfully');
            } else {
                Alert.alert('Error', 'Failed to add note');
            }
        } catch (error) {
            console.error('❌ Error adding guest note:', error);
            Alert.alert('Error', 'Failed to add note');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getGuestStatusColor = (guest) => {
        if (guest.hasActiveBooking) return '#4CAF50';
        if (guest.totalBookings > 1) return '#2196F3';
        return '#757575';
    };

    const getGuestStatusText = (guest) => {
        if (guest.hasActiveBooking) return 'Active';
        if (guest.totalBookings > 1) return 'Returning';
        return 'New';
    };

    const renderGuestCard = ({ item: guest }) => (
        <TouchableOpacity
            style={styles.guestCard}
            onPress={() => {
                setSelectedGuest(guest);
                setShowGuestModal(true);
            }}
        >
            <View style={styles.guestHeader}>
                <View style={styles.guestAvatar}>
                    <Text style={styles.guestInitial}>
                        {guest.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.guestInfo}>
                    <Text style={styles.guestName}>{guest.name}</Text>
                    <Text style={styles.guestEmail}>{guest.email}</Text>
                    <Text style={styles.guestPhone}>{guest.phone}</Text>
                </View>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavoriteGuest(guest.id)}
                >
                    <Ionicons 
                        name={guest.isFavorite ? 'heart' : 'heart-outline'} 
                        size={20} 
                        color={guest.isFavorite ? '#F44336' : '#ccc'} 
                    />
                </TouchableOpacity>
            </View>
            
            <View style={styles.guestStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{guest.totalBookings}</Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{formatCurrency(guest.totalSpent)}</Text>
                    <Text style={styles.statLabel}>Total Spent</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statusBadge, { backgroundColor: getGuestStatusColor(guest) }]}>
                        <Text style={styles.statusText}>{getGuestStatusText(guest)}</Text>
                    </View>
                </View>
            </View>
            
            {guest.lastBookingDate && (
                <Text style={styles.lastBooking}>
                    Last booking: {formatDate(guest.lastBookingDate)}
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderGuestModal = () => (
        <Modal
            visible={showGuestModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowGuestModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Guest Details</Text>
                    <TouchableOpacity
                        onPress={() => setShowNotesModal(true)}
                        style={styles.addNoteButton}
                    >
                        <Ionicons name="add" size={20} color="#6B73FF" />
                        <Text style={styles.addNoteText}>Note</Text>
                    </TouchableOpacity>
                </View>
                
                {selectedGuest && (
                    <ScrollView style={styles.modalContent}>
                        {/* Guest Profile */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileHeader}>
                                <View style={styles.profileAvatar}>
                                    <Text style={styles.profileInitial}>
                                        {selectedGuest.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.profileName}>{selectedGuest.name}</Text>
                                    <Text style={styles.profileEmail}>{selectedGuest.email}</Text>
                                    <Text style={styles.profilePhone}>{selectedGuest.phone}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getGuestStatusColor(selectedGuest) }]}>
                                    <Text style={styles.statusText}>{getGuestStatusText(selectedGuest)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Quick Stats */}
                        <View style={styles.quickStats}>
                            <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{selectedGuest.totalBookings}</Text>
                                <Text style={styles.quickStatLabel}>Total Bookings</Text>
                            </View>
                            <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{formatCurrency(selectedGuest.totalSpent)}</Text>
                                <Text style={styles.quickStatLabel}>Total Spent</Text>
                            </View>
                            <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{selectedGuest.avgRating.toFixed(1)}</Text>
                                <Text style={styles.quickStatLabel}>Avg Rating</Text>
                            </View>
                        </View>

                        {/* Recent Bookings */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Bookings</Text>
                            {selectedGuest.recentBookings && selectedGuest.recentBookings.length > 0 ? (
                                selectedGuest.recentBookings.map(booking => (
                                    <View key={booking.id} style={styles.bookingItem}>
                                        <View style={styles.bookingHeader}>
                                            <Text style={styles.bookingProperty}>{booking.propertyName}</Text>
                                            <Text style={styles.bookingAmount}>{formatCurrency(booking.totalAmount)}</Text>
                                        </View>
                                        <Text style={styles.bookingDates}>
                                            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getGuestStatusColor({ hasActiveBooking: booking.status === 'active' }) }]}>
                                            <Text style={styles.statusText}>{booking.status}</Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No recent bookings</Text>
                            )}
                        </View>

                        {/* Guest Notes */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            {selectedGuest.notes && selectedGuest.notes.length > 0 ? (
                                selectedGuest.notes.map(note => (
                                    <View key={note.id} style={styles.noteItem}>
                                        <Text style={styles.noteText}>{note.content}</Text>
                                        <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No notes added</Text>
                            )}
                        </View>

                        {/* Actions */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    // Contact guest functionality
                                    Alert.alert('Contact Guest', 'Feature coming soon!');
                                }}
                            >
                                <Ionicons name="chatbubble-outline" size={20} color="#6B73FF" />
                                <Text style={styles.actionButtonText}>Message</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('BookingManagement', { guestId: selectedGuest.id })}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#6B73FF" />
                                <Text style={styles.actionButtonText}>View Bookings</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );

    const renderNotesModal = () => (
        <Modal
            visible={showNotesModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowNotesModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Note</Text>
                    <TouchableOpacity
                        onPress={addGuestNote}
                        style={styles.saveButton}
                        disabled={!guestNotes.trim()}
                    >
                        <Text style={[styles.saveButtonText, { opacity: guestNotes.trim() ? 1 : 0.5 }]}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                    <TextInput
                        style={styles.noteInput}
                        value={guestNotes}
                        onChangeText={setGuestNotes}
                        placeholder="Add a note about this guest..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B73FF', '#9575CD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Guest Management</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {/* Search and Filters */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search guests by name, email, or phone..."
                        placeholderTextColor="#999"
                    />
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    {filterOptions.map(filter => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterButton,
                                filterType === filter.key && styles.activeFilterButton
                            ]}
                            onPress={() => setFilterType(filter.key)}
                        >
                            <Ionicons 
                                name={filter.icon} 
                                size={16} 
                                color={filterType === filter.key ? '#fff' : '#6B73FF'} 
                            />
                            <Text style={[
                                styles.filterText,
                                filterType === filter.key && styles.activeFilterText
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Guests List */}
            <FlatList
                data={filteredGuests}
                renderItem={renderGuestCard}
                keyExtractor={(item) => item.id.toString()}
                style={styles.guestsList}
                contentContainerStyle={styles.guestsListContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No guests found</Text>
                        <Text style={styles.emptySubText}>
                            {searchQuery ? 'Try adjusting your search criteria' : 'Guests will appear here after they make bookings'}
                        </Text>
                    </View>
                }
            />

            {/* Modals */}
            {renderGuestModal()}
            {renderNotesModal()}

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="guests" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6B73FF',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    activeFilterButton: {
        backgroundColor: '#6B73FF',
    },
    filterText: {
        fontSize: 14,
        color: '#6B73FF',
        marginLeft: 5,
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
    guestsList: {
        flex: 1,
    },
    guestsListContent: {
        padding: 20,
    },
    guestCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    guestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    guestAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6B73FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    guestInitial: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    guestInfo: {
        flex: 1,
    },
    guestName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    guestEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    guestPhone: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    favoriteButton: {
        padding: 5,
    },
    guestStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    lastBooking: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addNoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#6B73FF',
    },
    addNoteText: {
        fontSize: 14,
        color: '#6B73FF',
        marginLeft: 5,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    profileSection: {
        marginBottom: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 15,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6B73FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileInitial: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    profilePhone: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    quickStatCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        width: '30%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    quickStatNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6B73FF',
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    bookingItem: {
        backgroundColor: '#f8f9ff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    bookingProperty: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    bookingAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    bookingDates: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    noteItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    noteText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    noteDate: {
        fontSize: 12,
        color: '#999',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#6B73FF',
        width: '48%',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
        marginLeft: 8,
    },
    noteInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        height: 150,
    },
});

export default GuestManagementScreen;
