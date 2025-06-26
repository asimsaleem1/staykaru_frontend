import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';

const WriteReviewScreen = ({ navigation, route }) => {
    const { itemId, itemType, itemName } = route.params;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleStarPress = (star) => {
        setRating(star);
    };

    const validateReview = () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating before submitting');
            return false;
        }
        if (comment.trim().length < 10) {
            Alert.alert('Comment Too Short', 'Please write at least 10 characters in your review');
            return false;
        }
        return true;
    };

    const submitReview = async () => {
        if (!validateReview()) return;

        try {
            setSubmitting(true);
            
            const reviewData = {
                itemId,
                itemType,
                rating,
                comment: comment.trim()
            };

            await studentApiService.submitReview(reviewData);

            Alert.alert(
                'Review Submitted!',
                'Thank you for your feedback. Your review will help other students.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStarRating = () => (
        <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Rate your experience</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => handleStarPress(star)}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={40}
                            color={star <= rating ? '#ffc107' : '#dee2e6'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            
            <Text style={styles.ratingDescription}>
                {rating === 0 && 'Tap to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
            </Text>
        </View>
    );

    const renderCommentSection = () => (
        <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>Write your review</Text>
            <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder={`Tell others about your experience with ${itemName}...`}
                placeholderTextColor="#6c757d"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
            />
            
            <View style={styles.characterCount}>
                <Text style={styles.characterCountText}>
                    {comment.length}/500 characters
                </Text>
            </View>
        </View>
    );

    const renderGuidelines = () => (
        <View style={styles.guidelinesSection}>
            <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
            <View style={styles.guidelinesList}>
                <View style={styles.guidelineItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                    <Text style={styles.guidelineText}>
                        Be honest and fair in your review
                    </Text>
                </View>
                
                <View style={styles.guidelineItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                    <Text style={styles.guidelineText}>
                        Focus on your actual experience
                    </Text>
                </View>
                
                <View style={styles.guidelineItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                    <Text style={styles.guidelineText}>
                        Avoid personal attacks or offensive language
                    </Text>
                </View>
                
                <View style={styles.guidelineItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                    <Text style={styles.guidelineText}>
                        Include specific details that might help others
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Write Review</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Item Info */}
                    <View style={styles.itemInfoSection}>
                        <View style={styles.itemInfo}>
                            <Ionicons 
                                name={itemType === 'accommodation' ? 'home' : 'restaurant'} 
                                size={24} 
                                color="#007bff" 
                            />
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName}>{itemName}</Text>
                                <Text style={styles.itemType}>
                                    {itemType === 'accommodation' ? 'Accommodation' : 
                                     itemType === 'food_provider' ? 'Restaurant' : 'Service'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {renderStarRating()}
                    {renderCommentSection()}
                    {renderGuidelines()}
                    
                    <View style={styles.bottomSpacing} />
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (submitting || rating === 0 || comment.trim().length < 10) && styles.submitButtonDisabled
                        ]}
                        onPress={submitReview}
                        disabled={submitting || rating === 0 || comment.trim().length < 10}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="white" />
                                <Text style={styles.submitButtonText}>Submit Review</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    itemInfoSection: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 15,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemDetails: {
        marginLeft: 15,
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemType: {
        fontSize: 14,
        color: '#6c757d',
        textTransform: 'capitalize',
    },
    ratingSection: {
        backgroundColor: 'white',
        padding: 30,
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    starButton: {
        padding: 5,
        marginHorizontal: 5,
    },
    ratingDescription: {
        fontSize: 16,
        color: '#6c757d',
        fontWeight: '500',
    },
    commentSection: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 15,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
        color: '#333',
        height: 120,
    },
    characterCount: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    characterCountText: {
        fontSize: 12,
        color: '#6c757d',
    },
    guidelinesSection: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 15,
    },
    guidelinesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    guidelinesList: {
        gap: 12,
    },
    guidelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    guidelineText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
        flex: 1,
    },
    bottomSpacing: {
        height: 20,
    },
    footer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    submitButton: {
        backgroundColor: '#007bff',
        borderRadius: 25,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default WriteReviewScreen;
