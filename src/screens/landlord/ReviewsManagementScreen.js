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
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const { width } = Dimensions.get('window');

const ReviewsManagementScreen = ({ navigation }) => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        },
        responseRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

    const filterOptions = [
        { key: 'all', label: 'All Reviews', icon: 'star-outline' },
        { key: 'pending', label: 'Pending Response', icon: 'time-outline' },
        { key: 'responded', label: 'Responded', icon: 'checkmark-outline' },
        { key: 'high', label: '4+ Stars', icon: 'happy-outline' },
        { key: 'low', label: '1-3 Stars', icon: 'sad-outline' },
    ];

    const responseTemplates = [
        {
            id: 1,
            title: 'Thank You',
            content: 'Thank you for your wonderful review! We\'re delighted that you enjoyed your stay with us.'
        },
        {
            id: 2,
            title: 'Apology & Improvement',
            content: 'Thank you for your honest feedback. We sincerely apologize for any inconvenience and are taking steps to improve.'
        },
        {
            id: 3,
            title: 'Future Stay',
            content: 'We appreciate your review and look forward to welcoming you back for another great stay!'
        },
    ];

    useEffect(() => {
        loadReviews();
    }, []);

    useEffect(() => {
        filterReviews();
    }, [reviews, filterType]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            
            const [reviewsRes, statsRes] = await Promise.all([
                fetchFromBackend('/landlord/reviews'),
                fetchFromBackend('/landlord/reviews/statistics')
            ]);

            if (reviewsRes.success) {
                setReviews(reviewsRes.data);
                console.log('✅ Reviews loaded successfully');
            }

            if (statsRes.success) {
                setReviewStats(statsRes.data);
                console.log('✅ Review statistics loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading reviews:', error);
            Alert.alert('Error', 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadReviews();
        setRefreshing(false);
    };

    const filterReviews = () => {
        let filtered = reviews;

        switch (filterType) {
            case 'pending':
                filtered = reviews.filter(review => !review.response);
                break;
            case 'responded':
                filtered = reviews.filter(review => review.response);
                break;
            case 'high':
                filtered = reviews.filter(review => review.rating >= 4);
                break;
            case 'low':
                filtered = reviews.filter(review => review.rating <= 3);
                break;
            default:
                break;
        }

        setFilteredReviews(filtered);
    };

    const submitResponse = async () => {
        if (!selectedReview || !responseText.trim()) return;

        try {
            const response = await fetchFromBackend(`/reviews/${selectedReview.id}/response`, {
                method: 'POST',
                body: JSON.stringify({ response: responseText.trim() }),
            });

            if (response.success) {
                Alert.alert('Success', 'Response submitted successfully');
                setResponseText('');
                setShowResponseModal(false);
                loadReviews(); // Refresh reviews
                console.log('✅ Review response submitted successfully');
            } else {
                Alert.alert('Error', response.message || 'Failed to submit response');
            }
        } catch (error) {
            console.error('❌ Error submitting review response:', error);
            Alert.alert('Error', 'Failed to submit response');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStarRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={16}
                    color={i <= rating ? '#FFD700' : '#ccc'}
                />
            );
        }
        return <View style={styles.starContainer}>{stars}</View>;
    };

    const renderRatingBar = (rating, count, total) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <View style={styles.ratingBarContainer}>
                <Text style={styles.ratingNumber}>{rating}</Text>
                <Ionicons name="star" size={16} color="#FFD700" />
                <View style={styles.ratingBarTrack}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.ratingCount}>{count}</Text>
            </View>
        );
    };

    const renderReviewCard = ({ item: review }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.guestName}</Text>
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
                <View style={styles.reviewRating}>
                    {renderStarRating(review.rating)}
                    <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
                </View>
            </View>

            <Text style={styles.propertyName}>{review.propertyName}</Text>
            
            <Text style={styles.reviewText}>{review.comment}</Text>

            {review.response ? (
                <View style={styles.responseContainer}>
                    <View style={styles.responseHeader}>
                        <Ionicons name="arrow-undo-outline" size={16} color="#6B73FF" />
                        <Text style={styles.responseLabel}>Your Response</Text>
                        <Text style={styles.responseDate}>{formatDate(review.response.createdAt)}</Text>
                    </View>
                    <Text style={styles.responseText}>{review.response.content}</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.respondButton}
                    onPress={() => {
                        setSelectedReview(review);
                        setShowResponseModal(true);
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={16} color="#6B73FF" />
                    <Text style={styles.respondButtonText}>Respond</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderOverviewStats = () => (
        <View style={styles.overviewSection}>
            <View style={styles.overviewCards}>
                <View style={styles.overviewCard}>
                    <View style={styles.ratingDisplay}>
                        <Text style={styles.averageRating}>{reviewStats.averageRating.toFixed(1)}</Text>
                        <View style={styles.averageStars}>
                            {renderStarRating(Math.round(reviewStats.averageRating))}
                        </View>
                    </View>
                    <Text style={styles.totalReviews}>{reviewStats.totalReviews} reviews</Text>
                </View>

                <View style={styles.overviewCard}>
                    <Text style={styles.responseRateNumber}>{reviewStats.responseRate}%</Text>
                    <Text style={styles.responseRateLabel}>Response Rate</Text>
                    <TouchableOpacity
                        style={styles.improveButton}
                        onPress={() => setShowAnalyticsModal(true)}
                    >
                        <Text style={styles.improveButtonText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.ratingBreakdown}>
                <Text style={styles.breakdownTitle}>Rating Breakdown</Text>
                {[5, 4, 3, 2, 1].map(rating => 
                    renderRatingBar(
                        rating, 
                        reviewStats.ratingBreakdown[rating] || 0, 
                        reviewStats.totalReviews
                    )
                )}
            </View>
        </View>
    );

    const renderResponseModal = () => (
        <Modal
            visible={showResponseModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowResponseModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Respond to Review</Text>
                    <TouchableOpacity
                        onPress={submitResponse}
                        style={[styles.submitButton, { opacity: responseText.trim() ? 1 : 0.5 }]}
                        disabled={!responseText.trim()}
                    >
                        <Text style={styles.submitButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
                
                {selectedReview && (
                    <ScrollView style={styles.modalContent}>
                        {/* Original Review */}
                        <View style={styles.originalReview}>
                            <View style={styles.originalReviewHeader}>
                                <Text style={styles.originalReviewTitle}>Original Review</Text>
                                {renderStarRating(selectedReview.rating)}
                            </View>
                            <Text style={styles.originalReviewText}>{selectedReview.comment}</Text>
                            <Text style={styles.originalReviewMeta}>
                                By {selectedReview.guestName} • {formatDate(selectedReview.createdAt)}
                            </Text>
                        </View>

                        {/* Response Templates */}
                        <View style={styles.templatesSection}>
                            <Text style={styles.templatesTitle}>Quick Templates</Text>
                            {responseTemplates.map(template => (
                                <TouchableOpacity
                                    key={template.id}
                                    style={styles.templateButton}
                                    onPress={() => setResponseText(template.content)}
                                >
                                    <Text style={styles.templateTitle}>{template.title}</Text>
                                    <Text style={styles.templatePreview}>
                                        {template.content.substring(0, 80)}...
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Response Input */}
                        <View style={styles.responseInputSection}>
                            <Text style={styles.responseInputTitle}>Your Response</Text>
                            <TextInput
                                style={styles.responseInput}
                                value={responseText}
                                onChangeText={setResponseText}
                                placeholder="Write your response to this review..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                            <Text style={styles.characterCount}>
                                {responseText.length}/500 characters
                            </Text>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );

    const renderAnalyticsModal = () => (
        <Modal
            visible={showAnalyticsModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowAnalyticsModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Review Analytics</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <ScrollView style={styles.modalContent}>
                    {/* Performance Metrics */}
                    <View style={styles.analyticsSection}>
                        <Text style={styles.analyticsSectionTitle}>Performance Metrics</Text>
                        
                        <View style={styles.metricsGrid}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricNumber}>{reviewStats.averageRating.toFixed(1)}</Text>
                                <Text style={styles.metricLabel}>Average Rating</Text>
                                <Text style={styles.metricTrend}>+0.2 this month</Text>
                            </View>
                            
                            <View style={styles.metricCard}>
                                <Text style={styles.metricNumber}>{reviewStats.responseRate}%</Text>
                                <Text style={styles.metricLabel}>Response Rate</Text>
                                <Text style={styles.metricTrend}>+5% this month</Text>
                            </View>
                        </View>
                    </View>

                    {/* Common Themes */}
                    <View style={styles.analyticsSection}>
                        <Text style={styles.analyticsSectionTitle}>Common Feedback Themes</Text>
                        
                        <View style={styles.themeItem}>
                            <View style={styles.themeHeader}>
                                <Ionicons name="home-outline" size={20} color="#4CAF50" />
                                <Text style={styles.themeName}>Cleanliness</Text>
                                <Text style={styles.themeScore}>4.8/5</Text>
                            </View>
                            <Text style={styles.themeDescription}>
                                Guests frequently praise the cleanliness of your properties
                            </Text>
                        </View>
                        
                        <View style={styles.themeItem}>
                            <View style={styles.themeHeader}>
                                <Ionicons name="location-outline" size={20} color="#4CAF50" />
                                <Text style={styles.themeName}>Location</Text>
                                <Text style={styles.themeScore}>4.6/5</Text>
                            </View>
                            <Text style={styles.themeDescription}>
                                Great feedback on convenient locations and nearby amenities
                            </Text>
                        </View>
                        
                        <View style={styles.themeItem}>
                            <View style={styles.themeHeader}>
                                <Ionicons name="people-outline" size={20} color="#FF9800" />
                                <Text style={styles.themeName}>Communication</Text>
                                <Text style={styles.themeScore}>4.2/5</Text>
                            </View>
                            <Text style={styles.themeDescription}>
                                Some guests suggest faster response times for inquiries
                            </Text>
                        </View>
                    </View>

                    {/* Improvement Suggestions */}
                    <View style={styles.analyticsSection}>
                        <Text style={styles.analyticsSectionTitle}>Improvement Suggestions</Text>
                        
                        <View style={styles.suggestionItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#6B73FF" />
                            <Text style={styles.suggestionText}>
                                Respond to reviews within 24 hours to improve response rate
                            </Text>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#6B73FF" />
                            <Text style={styles.suggestionText}>
                                Consider adding communication guidelines for faster responses
                            </Text>
                        </View>
                        
                        <View style={styles.suggestionItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#6B73FF" />
                            <Text style={styles.suggestionText}>
                                Highlight your strong points (cleanliness, location) in property descriptions
                            </Text>
                        </View>
                    </View>
                </ScrollView>
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
                    <Text style={styles.headerTitle}>Reviews & Feedback</Text>
                    <TouchableOpacity
                        style={styles.analyticsButton}
                        onPress={() => setShowAnalyticsModal(true)}
                    >
                        <Ionicons name="analytics-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Overview Stats */}
                {renderOverviewStats()}

                {/* Filter Tabs */}
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterContainer}>
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
                        </View>
                    </ScrollView>
                </View>

                {/* Reviews List */}
                <View style={styles.reviewsSection}>
                    {filteredReviews.length > 0 ? (
                        <FlatList
                            data={filteredReviews}
                            renderItem={renderReviewCard}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="star-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No reviews found</Text>
                            <Text style={styles.emptySubText}>
                                {filterType === 'all' 
                                    ? 'Reviews will appear here after guests complete their stays'
                                    : 'No reviews match the selected filter'
                                }
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modals */}
            {renderResponseModal()}
            {renderAnalyticsModal()}

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="reviews" />
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
    analyticsButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    overviewSection: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    overviewCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    overviewCard: {
        width: '48%',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f8f9ff',
    },
    ratingDisplay: {
        alignItems: 'center',
        marginBottom: 10,
    },
    averageRating: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    averageStars: {
        marginTop: 5,
    },
    totalReviews: {
        fontSize: 14,
        color: '#666',
    },
    responseRateNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#6B73FF',
    },
    responseRateLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    improveButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    improveButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    ratingBreakdown: {
        marginTop: 15,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    breakdownTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    ratingBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingNumber: {
        fontSize: 14,
        color: '#333',
        width: 15,
    },
    ratingBarTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
    },
    ratingCount: {
        fontSize: 14,
        color: '#666',
        width: 25,
        textAlign: 'right',
    },
    filterSection: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6B73FF',
        marginHorizontal: 5,
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
    reviewsSection: {
        margin: 20,
    },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    reviewDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    reviewRating: {
        alignItems: 'flex-end',
    },
    starContainer: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    propertyName: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
        marginBottom: 10,
    },
    reviewText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 15,
    },
    responseContainer: {
        backgroundColor: '#f8f9ff',
        borderRadius: 8,
        padding: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#6B73FF',
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    responseLabel: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
        marginLeft: 5,
        flex: 1,
    },
    responseDate: {
        fontSize: 12,
        color: '#999',
    },
    responseText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    respondButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9ff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6B73FF',
    },
    respondButtonText: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
        marginLeft: 5,
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
    submitButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    originalReview: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 25,
    },
    originalReviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    originalReviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    originalReviewText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 10,
    },
    originalReviewMeta: {
        fontSize: 12,
        color: '#666',
    },
    templatesSection: {
        marginBottom: 25,
    },
    templatesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    templateButton: {
        backgroundColor: '#f8f9ff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    templateTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B73FF',
        marginBottom: 5,
    },
    templatePreview: {
        fontSize: 13,
        color: '#666',
    },
    responseInputSection: {
        marginBottom: 20,
    },
    responseInputTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    responseInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        height: 120,
        textAlignVertical: 'top',
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
    },
    // Analytics Modal Styles
    analyticsSection: {
        marginBottom: 30,
    },
    analyticsSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricCard: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        width: '48%',
    },
    metricNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#6B73FF',
    },
    metricLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    metricTrend: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 5,
    },
    themeItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    themeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    themeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginLeft: 10,
    },
    themeScore: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    themeDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    suggestionText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginLeft: 10,
        flex: 1,
    },
});

export default ReviewsManagementScreen;
