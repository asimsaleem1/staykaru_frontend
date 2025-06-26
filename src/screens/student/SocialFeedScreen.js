import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';

const SocialFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [newPostText, setNewPostText] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadSocialFeed();
  }, []);

  const loadSocialFeed = async () => {
    try {
      setLoading(true);
      // Mock data for social feed until backend endpoint is available
      const mockPosts = [
        {
          id: '1',
          user: {
            id: 'user1',
            name: 'Sarah Ahmed',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
            university: 'Karachi University'
          },
          content: 'Just found an amazing accommodation near campus! The landlord is super helpful and the place is exactly as advertised. Highly recommend! 🏠✨',
          type: 'accommodation',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 15,
          comments: 3,
          liked: false,
          images: ['https://picsum.photos/400/300?random=1'],
          tags: ['accommodation', 'near-campus', 'recommended']
        },
        {
          id: '2',
          user: {
            id: 'user2',
            name: 'Ahmed Khan',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
            university: 'LUMS'
          },
          content: 'Anyone know good food places near LUMS? Looking for budget-friendly options with home delivery. Thanks! 🍽️',
          type: 'food',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          comments: 12,
          liked: false,
          images: [],
          tags: ['food', 'budget-friendly', 'delivery']
        },
        {
          id: '3',
          user: {
            id: 'user3',
            name: 'Fatima Ali',
            avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
            university: 'Punjab University'
          },
          content: 'Ordered from Tasty Bites yesterday and the food was amazing! Fast delivery and great taste. Will definitely order again! 🌟',
          type: 'review',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          likes: 22,
          comments: 5,
          liked: true,
          images: ['https://picsum.photos/400/300?random=2'],
          tags: ['food-review', 'tasty-bites', 'recommended']
        },
        {
          id: '4',
          user: {
            id: 'user4',
            name: 'Hassan Mahmood',
            avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
            university: 'NUST'
          },
          content: 'PSA: Be careful when booking accommodations. Always verify the property and read reviews first. Had a bad experience recently but the StayKaru support team helped resolve it quickly. 👍',
          type: 'safety',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          likes: 35,
          comments: 8,
          liked: false,
          images: [],
          tags: ['safety', 'booking-tips', 'support']
        },
        {
          id: '5',
          user: {
            id: 'user5',
            name: 'Zara Sheikh',
            avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
            university: 'IBA Karachi'
          },
          content: 'Just discovered the map feature in StayKaru! Super useful for finding accommodations and food places near campus. The real-time navigation is a game changer! 🗺️',
          type: 'app-feature',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          likes: 18,
          comments: 4,
          liked: false,
          images: [],
          tags: ['app-feature', 'map', 'navigation']
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading social feed:', error);
      Alert.alert('Error', 'Failed to load social feed');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSocialFeed();
    setRefreshing(false);
  };

  const filters = [
    { id: 'all', name: 'All', icon: 'list' },
    { id: 'accommodation', name: 'Stay', icon: 'business' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'review', name: 'Reviews', icon: 'star' },
    { id: 'safety', name: 'Safety', icon: 'shield' },
  ];

  const filteredPosts = posts.filter(post => 
    selectedFilter === 'all' || post.type === selectedFilter
  );

  const toggleLike = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              liked: !post.liked, 
              likes: post.liked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  const createPost = async () => {
    if (!newPostText.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    try {
      const newPost = {
        id: Date.now().toString(),
        user: {
          id: 'current_user',
          name: 'You',
          avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
          university: 'Your University'
        },
        content: newPostText,
        type: 'general',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        liked: false,
        images: [],
        tags: []
      };

      setPosts(prev => [newPost, ...prev]);
      setNewPostText('');
      setShowCreatePost(false);
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.university}>{item.user.university}</Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.images.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.postImage} />
      )}

      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleLike(item.id)}
        >
          <Ionicons 
            name={item.liked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.liked ? "#e74c3c" : "#7f8c8d"} 
          />
          <Text style={[styles.actionText, item.liked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#7f8c8d" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#7f8c8d" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading social feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Feed</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Ionicons name="add" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.selectedFilter
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon} 
                size={18} 
                color={selectedFilter === filter.id ? '#fff' : '#3498db'} 
              />
              <Text 
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.selectedFilterText
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
      />

      {showCreatePost && (
        <View style={styles.createPostModal}>
          <View style={styles.createPostContainer}>
            <View style={styles.createPostHeader}>
              <Text style={styles.createPostTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.createPostInput}
              placeholder="What's on your mind?"
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.createPostActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreatePost(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postButton}
                onPress={createPost}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    marginRight: 8,
  },
  selectedFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    marginLeft: 6,
    fontWeight: '500',
    color: '#3498db',
  },
  selectedFilterText: {
    color: '#fff',
  },
  feedContainer: {
    paddingVertical: 8,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  university: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#7f8c8d',
  },
  likedText: {
    color: '#e74c3c',
  },
  createPostModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createPostContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '70%',
  },
  createPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createPostInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SocialFeedScreen;