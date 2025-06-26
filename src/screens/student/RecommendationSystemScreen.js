import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';

const { width } = Dimensions.get('window');

const RecommendationSystemScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    city: '',
    accommodationType: '',
    priceRange: '',
    location: '',
    amenities: [],
    cuisineType: '',
    dietaryRestrictions: [],
    mealFrequency: '',
    serviceType: ''
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      id: 'city',
      title: 'Which city are you looking for accommodation in?',
      type: 'single',
      options: [
        { id: 'lahore', label: 'Lahore', icon: 'location-outline', description: 'Cultural capital with universities' },
        { id: 'karachi', label: 'Karachi', icon: 'location-outline', description: 'Business hub and coastal city' },
        { id: 'islamabad', label: 'Islamabad', icon: 'location-outline', description: 'Capital city, modern infrastructure' },
        { id: 'rawalpindi', label: 'Rawalpindi', icon: 'location-outline', description: 'Twin city with Islamabad' },
        { id: 'faisalabad', label: 'Faisalabad', icon: 'location-outline', description: 'Industrial and textile hub' },
        { id: 'multan', label: 'Multan', icon: 'location-outline', description: 'Historic city in Punjab' },
        { id: 'peshawar', label: 'Peshawar', icon: 'location-outline', description: 'Gateway to Afghanistan' },
        { id: 'quetta', label: 'Quetta', icon: 'location-outline', description: 'Provincial capital of Balochistan' }
      ]
    },
    {
      id: 'accommodationType',
      title: 'What type of accommodation do you prefer?',
      type: 'single',
      options: [
        { id: 'shared_room', label: 'Shared Room', icon: 'people-outline', description: 'Budget-friendly, social environment' },
        { id: 'private_room', label: 'Private Room', icon: 'bed-outline', description: 'Privacy with shared common areas' },
        { id: 'studio', label: 'Studio Apartment', icon: 'home-outline', description: 'Complete privacy and independence' },
        { id: 'hostel', label: 'Student Hostel', icon: 'business-outline', description: 'University-managed accommodation' }
      ]
    },
    {
      id: 'priceRange',
      title: 'What is your budget range for accommodation?',
      type: 'single',
      options: [
        { id: 'budget', label: 'Budget (Rs. 5,000 - 15,000)', icon: 'wallet-outline', description: 'Affordable options' },
        { id: 'mid', label: 'Mid-range (Rs. 15,000 - 30,000)', icon: 'card-outline', description: 'Good value for money' },
        { id: 'premium', label: 'Premium (Rs. 30,000 - 50,000)', icon: 'diamond-outline', description: 'High-end comfort' },
        { id: 'luxury', label: 'Luxury (Rs. 50,000+)', icon: 'star-outline', description: 'Ultimate luxury experience' }
      ]
    },
    {
      id: 'location',
      title: 'Which area do you prefer?',
      type: 'single',
      options: [
        { id: 'university', label: 'Near University', icon: 'school-outline', description: 'Walking distance to campus' },
        { id: 'city_center', label: 'City Center', icon: 'business-outline', description: 'Urban lifestyle, lots of amenities' },
        { id: 'residential', label: 'Residential Area', icon: 'home-outline', description: 'Quiet, family-friendly neighborhood' },
        { id: 'transport_hub', label: 'Near Transport', icon: 'train-outline', description: 'Easy commute options' }
      ]
    },
    {
      id: 'amenities',
      title: 'Which amenities are important to you?',
      type: 'multiple',
      options: [
        { id: 'wifi', label: 'High-Speed WiFi', icon: 'wifi-outline' },
        { id: 'gym', label: 'Gym/Fitness Center', icon: 'fitness-outline' },
        { id: 'laundry', label: 'Laundry Service', icon: 'shirt-outline' },
        { id: 'parking', label: 'Parking Space', icon: 'car-outline' },
        { id: 'security', label: '24/7 Security', icon: 'shield-outline' },
        { id: 'kitchen', label: 'Kitchen Access', icon: 'restaurant-outline' },
        { id: 'study_room', label: 'Study Rooms', icon: 'library-outline' },
        { id: 'ac', label: 'Air Conditioning', icon: 'snow-outline' }
      ]
    },
    {
      id: 'cuisineType',
      title: 'What type of cuisine do you prefer?',
      type: 'single',
      options: [
        { id: 'pakistani', label: 'Pakistani/Desi', icon: 'restaurant-outline', description: 'Traditional local flavors' },
        { id: 'international', label: 'International', icon: 'globe-outline', description: 'Chinese, Italian, etc.' },
        { id: 'fast_food', label: 'Fast Food', icon: 'fast-food-outline', description: 'Quick and convenient' },
        { id: 'healthy', label: 'Healthy/Organic', icon: 'leaf-outline', description: 'Nutritious and fresh options' }
      ]
    },
    {
      id: 'dietaryRestrictions',
      title: 'Do you have any dietary preferences?',
      type: 'multiple',
      options: [
        { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf-outline' },
        { id: 'vegan', label: 'Vegan', icon: 'flower-outline' },
        { id: 'halal', label: 'Halal Only', icon: 'checkmark-circle-outline' },
        { id: 'gluten_free', label: 'Gluten-Free', icon: 'ban-outline' },
        { id: 'dairy_free', label: 'Dairy-Free', icon: 'water-outline' },
        { id: 'none', label: 'No Restrictions', icon: 'happy-outline' }
      ]
    },
    {
      id: 'serviceType',
      title: 'How do you prefer to get your food?',
      type: 'single',
      options: [
        { id: 'delivery', label: 'Home Delivery', icon: 'bicycle-outline', description: 'Convenient and fast' },
        { id: 'pickup', label: 'Self Pickup', icon: 'walk-outline', description: 'Save on delivery charges' },
        { id: 'dine_in', label: 'Dine-in', icon: 'restaurant-outline', description: 'Enjoy restaurant atmosphere' },
        { id: 'mixed', label: 'All Options', icon: 'options-outline', description: 'Flexible preferences' }
      ]
    }
  ];

  const handleAnswerSelect = (questionId, answerId, isMultiple = false) => {
    setPreferences(prev => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(answerId)
          ? currentAnswers.filter(id => id !== answerId)
          : [...currentAnswers, answerId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: answerId };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Generate personalized recommendations based on preferences
      const accommodationRecs = await generateAccommodationRecommendations();
      const foodRecs = await generateFoodRecommendations();
      
      setRecommendations({
        accommodations: accommodationRecs,
        foodProviders: foodRecs,
        preferences: preferences
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAccommodationRecommendations = async () => {
    try {
      console.log('Generating accommodation recommendations...');
      const allAccommodations = await studentApiService.getAccommodations();
      console.log('Accommodation data:', allAccommodations);
      
      // Safely access the accommodations array
      const accommodationsArray = allAccommodations?.accommodations || allAccommodations?.properties || allAccommodations || [];
      
      if (!Array.isArray(accommodationsArray)) {
        console.warn('Accommodations data is not an array:', accommodationsArray);
        return [];
      }
      
      // Filter and score accommodations based on preferences
      return accommodationsArray
        .map(acc => {
          let score = 0;
          
          // Type matching
          if (acc.type === preferences.accommodationType) score += 25;
          
          // Price range matching
          const price = acc.price || 0;
          switch (preferences.priceRange) {
            case 'budget':
              if (price >= 5000 && price <= 15000) score += 20;
              break;
            case 'mid':
              if (price >= 15000 && price <= 30000) score += 20;
              break;
            case 'premium':
              if (price >= 30000 && price <= 50000) score += 20;
              break;
            case 'luxury':
              if (price >= 50000) score += 20;
              break;
          }
          
          // City matching (high priority)
          if (acc.city && acc.city.toLowerCase() === preferences.city.toLowerCase()) {
            score += 30;
          }
          
          // Amenities matching
          const accAmenities = acc.amenities || [];
          const preferredAmenities = preferences.amenities || [];
          const matchingAmenities = preferredAmenities.filter(amenity => 
            accAmenities.some(accAmenity => 
              (typeof accAmenity === 'string' ? accAmenity : accAmenity.name || '')
                .toLowerCase().includes(amenity)
            )
          );
          score += (matchingAmenities.length / Math.max(preferredAmenities.length, 1)) * 25;
          
          // Location preference
          if (acc.location && acc.location.toLowerCase().includes(preferences.location)) {
            score += 15;
          }
          
          // Rating boost
          if (acc.rating) {
            score += (acc.rating / 5) * 15;
          }
          
          return { ...acc, recommendationScore: Math.round(score) };
        })
        .filter(acc => acc.recommendationScore > 30)
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating accommodation recommendations:', error);
      return [];
    }
  };

  const generateFoodRecommendations = async () => {
    try {
      console.log('Generating food recommendations...');
      const allProviders = await studentApiService.getFoodProviders();
      console.log('Food providers data:', allProviders);
      
      // Safely access the food providers array
      const providersArray = allProviders?.food_providers || allProviders?.providers || allProviders || [];
      
      if (!Array.isArray(providersArray)) {
        console.warn('Food providers data is not an array:', providersArray);
        return [];
      }
      
      return providersArray
        .map(provider => {
          let score = 0;
          
          // City matching (high priority)
          if (provider.city && provider.city.toLowerCase() === preferences.city.toLowerCase()) {
            score += 30;
          }
          
          // Cuisine type matching
          if (provider.cuisine_type === preferences.cuisineType) score += 25;
          
          // Dietary restrictions matching
          const dietaryRestrictions = preferences.dietaryRestrictions || [];
          if (dietaryRestrictions.includes('vegetarian') && provider.vegetarian_options) score += 20;
          if (dietaryRestrictions.includes('halal') && provider.halal_certified) score += 20;
          if (dietaryRestrictions.includes('vegan') && provider.vegan_options) score += 20;
          
          // Service type matching
          const serviceTypes = provider.service_types || [];
          if (serviceTypes.includes(preferences.serviceType)) score += 15;
          
          // Rating boost
          if (provider.rating) {
            score += (provider.rating / 5) * 15;
          }
          
          // Delivery availability
          if (provider.delivery_available) score += 10;
          
          return { ...provider, recommendationScore: Math.round(score) };
        })
        .filter(provider => provider.recommendationScore > 25)
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating food recommendations:', error);
      return [];
    }
  };

  const resetRecommendations = () => {
    setRecommendations(null);
    setCurrentStep(0);
    setPreferences({
      accommodationType: '',
      priceRange: '',
      location: '',
      amenities: [],
      cuisineType: '',
      dietaryRestrictions: [],
      mealFrequency: '',
      serviceType: ''
    });
  };

  const renderQuestion = (question) => {
    const currentAnswer = preferences[question.id];
    const isMultiple = question.type === 'multiple';
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{question.title}</Text>
        <Text style={styles.questionSubtitle}>
          {isMultiple ? 'Select all that apply' : 'Choose one option'}
        </Text>
        
        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = isMultiple 
              ? currentAnswer?.includes(option.id)
              : currentAnswer === option.id;
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, isSelected && styles.selectedOption]}
                onPress={() => handleAnswerSelect(question.id, option.id, isMultiple)}
              >
                <View style={styles.optionContent}>
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={isSelected ? '#007BFF' : '#666'} 
                  />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, isSelected && styles.selectedText]}>
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#007BFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations) return null;

    return (
      <ScrollView style={styles.recommendationsContainer}>
        <View style={styles.recommendationsHeader}>
          <Ionicons name="sparkles" size={24} color="#007BFF" />
          <Text style={styles.recommendationsTitle}>Your Personalized Recommendations</Text>
        </View>

        {/* Accommodation Recommendations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🏠 Recommended Accommodations</Text>
          {recommendations.accommodations.map((acc, index) => (
            <TouchableOpacity
              key={acc._id}
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('AccommodationDetails', { accommodationId: acc._id })}
            >
              <Image source={{ uri: acc.images?.[0] || 'https://via.placeholder.com/100x80' }} style={styles.recImage} />
              <View style={styles.recContent}>
                <Text style={styles.recTitle}>{acc.title}</Text>
                <Text style={styles.recSubtitle}>{acc.location}</Text>
                <View style={styles.recMeta}>
                  <Text style={styles.recPrice}>Rs. {acc.price}/month</Text>
                  <View style={styles.recRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.recRatingText}>{acc.rating || 4.0}</Text>
                  </View>
                </View>
                <Text style={styles.matchScore}>
                  {Math.round(acc.recommendationScore)}% match
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Food Provider Recommendations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🍽️ Recommended Food Providers</Text>
          {recommendations.foodProviders.map((provider, index) => (
            <TouchableOpacity
              key={provider._id}
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('FoodProviderDetails', { providerId: provider._id })}
            >
              <Image source={{ uri: provider.images?.[0] || 'https://via.placeholder.com/100x80' }} style={styles.recImage} />
              <View style={styles.recContent}>
                <Text style={styles.recTitle}>{provider.name}</Text>
                <Text style={styles.recSubtitle}>{provider.cuisine_type}</Text>
                <View style={styles.recMeta}>
                  <Text style={styles.recDelivery}>
                    {provider.delivery_time || '30-45'} min
                  </Text>
                  <View style={styles.recRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.recRatingText}>{provider.rating || 4.0}</Text>
                  </View>
                </View>
                <Text style={styles.matchScore}>
                  {Math.round(provider.recommendationScore)}% match
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetRecommendations}>
          <Ionicons name="refresh-outline" size={20} color="#007BFF" />
          <Text style={styles.resetButtonText}>Retake Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="sparkles" size={48} color="#007BFF" />
        <Text style={styles.loadingText}>Generating your personalized recommendations...</Text>
      </View>
    );
  }

  if (recommendations) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recommendations</Text>
        </View>
        {renderRecommendations()}
      </View>
    );
  }

  const currentQuestion = questions[currentStep];
  const isAnswered = currentQuestion.type === 'multiple' 
    ? preferences[currentQuestion.id]?.length > 0
    : preferences[currentQuestion.id];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommendation Quiz</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {renderQuestion(currentQuestion)}
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton]}
          onPress={prevStep}
          disabled={currentStep === 0}
        >
          <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !isAnswered && styles.disabledButton]}
          onPress={nextStep}
          disabled={!isAnswered}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {currentStep === questions.length - 1 ? 'Get Recommendations' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  progressContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  selectedOption: {
    borderColor: '#007BFF',
    backgroundColor: '#F8F9FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedText: {
    color: '#007BFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  prevButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  nextButton: {
    backgroundColor: '#007BFF',
  },
  disabledButton: {
    backgroundColor: '#DEE2E6',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#666',
  },
  nextButtonText: {
    color: '#FFF',
  },
  disabledText: {
    color: '#CCC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  recommendationsContainer: {
    flex: 1,
    padding: 16,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  recDelivery: {
    fontSize: 14,
    color: '#666',
  },
  recRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  matchScore: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RecommendationSystemScreen;
