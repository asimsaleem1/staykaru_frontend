import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    Image,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchFromBackend } from '../../utils/networkUtils';
import { COLORS, SIZES } from '../../utils/constants';
import { pickImage } from '../../services/imageService';
import authService from '../../services/authService';

const ReviewsRatingsScreen = ({ navigation }) => {
    const [reviews, setReviews] = useState([]);
    const [overallStats, setOverallStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviewDetailsVisible, setReviewDetailsVisible] = useState(false);
    const [responseModalVisible, setResponseModalVisible] = useState(false);
    const [responseText, setResponseText] = useState('');

    const filterOptions = [
        { id: 'all', label: 'All Reviews' },
        { id: '5', label: '5 Stars' },
        { id: '4', label: '4 Stars' },
        { id: '3', label: '3 Stars' },
        { id: '2', label: '2 Stars' },
        { id: '1', label: '1 Star' },
        { id: 'unresponded', label: 'Unresponded' },
        { id: 'reported', label: 'Reported' },
    ];

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/reviews/provider/${user.id}`);
            if (response?.success) {
                const reviewsData = response.data || [];
                setReviews(reviewsData);
                calculateStats(reviewsData);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            Alert.alert('Error', 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (reviewsData) => {
        const totalReviews = reviewsData.length;
        const averageRating = totalReviews > 0 
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
            : 0;

        const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(review => {
            ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
        });

        setOverallStats({
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews,
            ratingBreakdown
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReviews();
        setRefreshing(false);
    };

    const respondToReview = async (reviewId, response) => {
        try {
            const apiResponse = await fetchFromBackend(`/api/reviews/${reviewId}/respond`, {
                method: 'POST',
                body: JSON.stringify({ response })
            });

            if (apiResponse?.success) {
                Alert.alert('Success', 'Response submitted successfully');
                setResponseModalVisible(false);
                setResponseText('');
                setSelectedReview(null);
                await loadReviews();
            }
        } catch (error) {
            console.error('Error responding to review:', error);
            Alert.alert('Error', 'Failed to submit response');
        }
    };

    const reportReview = async (reviewId, reason) => {
        try {
            const response = await fetchFromBackend(`/api/reviews/${reviewId}/report`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });

            if (response?.success) {
                Alert.alert('Success', 'Review reported successfully');
                await loadReviews();
            }
        } catch (error) {
            console.error('Error reporting review:', error);
            Alert.alert('Error', 'Failed to report review');
        }
    };

    const getFilteredReviews = () => {
        if (selectedFilter === 'all') return reviews;
        if (selectedFilter === 'unresponded') {
            return reviews.filter(review => !review.provider_response);
        }
        if (selectedFilter === 'reported') {
            return reviews.filter(review => review.is_reported);
        }
        return reviews.filter(review => review.rating === parseInt(selectedFilter));
    };

    const renderStars = (rating, size = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={size}
                    color={i <= rating ? COLORS.warning : COLORS.gray}
                />
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    const renderRatingBar = (rating, count, total) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
            <View style={styles.ratingBar}>
                <Text style={styles.ratingNumber}>{rating}</Text>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.ratingCount}>{count}</Text>
            </View>
        );
    };

    const renderReviewCard = (review, index) => (
        <TouchableOpacity
            key={review.id || `review-${index}`}
            style={styles.reviewCard}
            onPress={() => {
                setSelectedReview(review);
                setReviewDetailsVisible(true);
            }}
        >
            <View style={styles.reviewHeader}>
                <View style={styles.customerInfo}>
                    <View style={styles.customerAvatar}>
                        {review.customer_avatar ? (
                            <Image source={{ uri: review.customer_avatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {review.customer_name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.customerDetails}>
                        <Text style={styles.customerName}>{review.customer_name || 'Anonymous'}</Text>
                        <Text style={styles.reviewDate}>
                            {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                    <Text style={styles.ratingText}>{review.rating}/5</Text>
                </View>
            </View>

            {review.order_items && (
                <View style={styles.orderItems}>
                    <Text style={styles.orderItemsLabel}>Ordered:</Text>
                    <Text style={styles.orderItemsText}>
                        {review.order_items.join(', ')}
                    </Text>
                </View>
            )}

            <Text style={styles.reviewText} numberOfLines={3}>
                {review.comment || 'No comment provided'}
            </Text>

            {review.images && review.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                    {review.images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.reviewImage}
                        />
                    ))}
                </ScrollView>
            )}

            <View style={styles.reviewFooter}>
                <View style={styles.reviewStats}>
                    {review.helpful_count > 0 && (
                        <View style={styles.helpfulCount}>
                            <Ionicons name="thumbs-up" size={14} color={COLORS.success} />
                            <Text style={styles.helpfulText}>{review.helpful_count} helpful</Text>
                        </View>
                    )}
                </View>
                <View style={styles.reviewActions}>
                    {!review.provider_response && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                setSelectedReview(review);
                                setResponseModalVisible(true);
                            }}
                        >
                            <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.actionButtonText}>Respond</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            Alert.alert(
                                'Report Review',
                                'Why are you reporting this review?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Inappropriate content', onPress: () => reportReview(review.id, 'inappropriate') },
                                    { text: 'Fake review', onPress: () => reportReview(review.id, 'fake') },
                                    { text: 'Spam', onPress: () => reportReview(review.id, 'spam') },
                                ]
                            );
                        }}
                    >
                        <Ionicons name="flag-outline" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {review.provider_response && (
                <View style={styles.providerResponse}>
                    <View style={styles.responseHeader}>
                        <Ionicons name="business" size={16} color={COLORS.primary} />
                        <Text style={styles.responseLabel}>Your Response</Text>
                        <Text style={styles.responseDate}>
                            {new Date(review.response_date).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={styles.responseText}>{review.provider_response}</Text>
                </View>
            )}

            {review.is_reported && (
                <View style={styles.reportedBadge}>
                    <Ionicons name="flag" size={12} color={COLORS.white} />
                    <Text style={styles.reportedText}>Reported</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderOverallStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.overallRating}>
                <Text style={styles.averageRating}>{overallStats.averageRating}</Text>
                <View style={styles.averageStars}>
                    {renderStars(Math.round(overallStats.averageRating), 20)}
                </View>
                <Text style={styles.totalReviews}>
                    Based on {overallStats.totalReviews} reviews
                </Text>
            </View>            <View style={styles.ratingDistribution}>
                {[5, 4, 3, 2, 1].map(rating => (
                    <View key={rating}>
                        {renderRatingBar(
                            rating, 
                            overallStats.ratingBreakdown[rating], 
                            overallStats.totalReviews
                        )}
                    </View>
                ))}
            </View>
        </View>
    );

    const renderResponseModal = () => (
        <Modal
            visible={responseModalVisible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.responseModal}>
                    <View style={styles.responseModalHeader}>
                        <Text style={styles.responseModalTitle}>Respond to Review</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setResponseModalVisible(false);
                                setResponseText('');
                                setSelectedReview(null);
                            }}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                    </View>

                    {selectedReview && (
                        <View style={styles.reviewPreview}>
                            <View style={styles.previewHeader}>
                                <Text style={styles.previewCustomer}>{selectedReview.customer_name}</Text>
                                {renderStars(selectedReview.rating)}
                            </View>
                            <Text style={styles.previewComment} numberOfLines={3}>
                                {selectedReview.comment}
                            </Text>
                        </View>
                    )}

                    <View style={styles.responseInput}>
                        <Text style={styles.responseInputLabel}>Your Response</Text>
                        <TextInput
                            style={styles.responseTextInput}
                            value={responseText}
                            onChangeText={setResponseText}
                            placeholder="Write a professional response to this review..."
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                        />
                        <Text style={styles.characterCount}>{responseText.length}/500</Text>
                    </View>

                    <View style={styles.responseActions}>
                        <TouchableOpacity
                            style={[styles.responseButton, { backgroundColor: COLORS.gray }]}
                            onPress={() => {
                                setResponseModalVisible(false);
                                setResponseText('');
                                setSelectedReview(null);
                            }}
                        >
                            <Text style={styles.responseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.responseButton, 
                                { 
                                    backgroundColor: responseText.trim() ? COLORS.primary : COLORS.lightGray 
                                }
                            ]}
                            onPress={() => {
                                if (responseText.trim() && selectedReview) {
                                    respondToReview(selectedReview.id, responseText.trim());
                                }
                            }}
                            disabled={!responseText.trim()}
                        >
                            <Text style={[
                                styles.responseButtonText,
                                { color: responseText.trim() ? COLORS.white : COLORS.gray }
                            ]}>
                                Submit Response
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const filteredReviews = getFilteredReviews();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reviews & Ratings</Text>
                <TouchableOpacity
                    onPress={loadReviews}
                    style={styles.refreshButton}
                >
                    <Ionicons name="refresh" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {renderOverallStats()}

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
            >
                {filterOptions.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterOption,
                            selectedFilter === filter.id && styles.activeFilterOption
                        ]}
                        onPress={() => setSelectedFilter(filter.id)}
                    >
                        <Text style={[
                            styles.filterOptionText,
                            selectedFilter === filter.id && styles.activeFilterOptionText
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review, index) => renderReviewCard(review, index))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons 
                            name={selectedFilter === 'all' ? 'star-outline' : 'filter-outline'} 
                            size={64} 
                            color={COLORS.gray} 
                        />
                        <Text style={styles.emptyTitle}>
                            {selectedFilter === 'all' ? 'No Reviews Yet' : 'No Reviews Match Filter'}
                        </Text>
                        <Text style={styles.emptyDescription}>
                            {selectedFilter === 'all' 
                                ? 'Reviews from customers will appear here' 
                                : 'Try selecting a different filter'
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>

            {renderResponseModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    refreshButton: {
        padding: 8,
    },
    statsContainer: {
        backgroundColor: COLORS.white,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overallRating: {
        alignItems: 'center',
        marginBottom: 20,
    },
    averageRating: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 5,
    },
    averageStars: {
        marginBottom: 5,
    },
    totalReviews: {
        fontSize: 14,
        color: COLORS.gray,
    },
    ratingDistribution: {
        marginTop: 10,
    },
    ratingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingNumber: {
        fontSize: 14,
        color: COLORS.dark,
        width: 15,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.lightGray,
        borderRadius: 4,
        marginHorizontal: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.warning,
        borderRadius: 4,
    },
    ratingCount: {
        fontSize: 14,
        color: COLORS.gray,
        width: 30,
        textAlign: 'right',
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filtersContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: 15,
        paddingHorizontal: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterOption: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 10,
    },
    activeFilterOption: {
        backgroundColor: COLORS.primary,
    },
    filterOptionText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeFilterOptionText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    reviewCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    customerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 12,
        color: COLORS.gray,
    },
    reviewRating: {
        alignItems: 'flex-end',
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    orderItems: {
        marginBottom: 10,
        padding: 8,
        backgroundColor: COLORS.lightGray,
        borderRadius: 6,
    },
    orderItemsLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 2,
    },
    orderItemsText: {
        fontSize: 14,
        color: COLORS.dark,
    },
    reviewText: {
        fontSize: 16,
        color: COLORS.dark,
        lineHeight: 22,
        marginBottom: 10,
    },
    reviewImages: {
        marginBottom: 10,
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewStats: {
        flex: 1,
    },
    helpfulCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpfulText: {
        fontSize: 12,
        color: COLORS.success,
        marginLeft: 4,
    },
    reviewActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 10,
    },
    actionButtonText: {
        fontSize: 12,
        color: COLORS.primary,
        marginLeft: 4,
    },
    providerResponse: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    responseLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 5,
        flex: 1,
    },
    responseDate: {
        fontSize: 12,
        color: COLORS.gray,
    },
    responseText: {
        fontSize: 14,
        color: COLORS.dark,
        lineHeight: 18,
    },
    reportedBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    reportedText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 15,
        marginBottom: 5,
    },
    emptyDescription: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    responseModal: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        margin: 20,
        width: '90%',
        maxHeight: '80%',
    },
    responseModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    responseModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        flex: 1,
    },
    modalCloseButton: {
        padding: 4,
    },
    reviewPreview: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    previewCustomer: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    previewComment: {
        fontSize: 14,
        color: COLORS.dark,
        lineHeight: 18,
    },
    responseInput: {
        marginBottom: 20,
    },
    responseInputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    responseTextInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.dark,
        textAlignVertical: 'top',
        marginBottom: 5,
    },
    characterCount: {
        fontSize: 12,
        color: COLORS.gray,
        textAlign: 'right',
    },
    responseActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    responseButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    responseButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ReviewsRatingsScreen;
