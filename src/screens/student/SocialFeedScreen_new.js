import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { studentApiService } from '../../services/studentApiService_new';

const SocialFeedScreen_new = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postingInProgress, setPostingInProgress] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // In a production app, we would call an API
      // const response = await studentApiService.getSocialFeedPosts();
      // setPosts(response.data);

      // Using mock data for now
      const mockPosts = [
        {
          id: '1',
          userId: 'user1',
          username: 'John Doe',
          userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          text: 'Just moved into my new accommodation! The place is amazing, great views and friendly neighbors. #NewBeginnings #StudentLife',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          likes: 24,
          comments: 5,
          timePosted: '2 hours ago',
          liked: false,
        },
        {
          id: '2',
          userId: 'user2',
          username: 'Sarah Williams',
          userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          text: 'Anyone interested in forming a study group for finals? We can meet at the library or the campus cafe! #StudyBuddies',
          image: null,
          likes: 18,
          comments: 12,
          timePosted: '3 hours ago',
          liked: true,
        },
        {
          id: '3',
          userId: 'user3',
          username: 'Mike Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          text: 'The new food court on campus has the best pizza I\'ve ever tried! Highly recommended 🍕',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
          likes: 32,
          comments: 8,
          timePosted: '5 hours ago',
          liked: false,
        },
        {
          id: '4',
          userId: 'user4',
          username: 'Emma Brown',
          userAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          text: 'Looking for roommates for next semester. 3-bedroom apartment close to campus, utilities included. DM if interested!',
          image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
          likes: 15,
          comments: 23,
          timePosted: '6 hours ago',
          liked: false,
        },
        {
          id: '5',
          userId: 'user5',
          username: 'David Clark',
          userAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
          text: 'Campus event alert: Free concert this Friday at 7PM in the main quad! #CampusLife #WeekendFun',
          image: null,
          likes: 42,
          comments: 11,
          timePosted: '1 day ago',
          liked: true,
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setPosts(mockPosts);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load social feed posts');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPostImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !newPostImage) {
      Alert.alert('Error', 'Post cannot be empty. Please add some text or an image.');
      return;
    }

    try {
      setPostingInProgress(true);

      // In a production app, we would call an API
      // await studentApiService.createSocialPost({
      //   text: newPostText,
      //   image: newPostImage,
      // });

      // Mock creating a new post
      const newPost = {
        id: String(Date.now()),
        userId: 'currentUser',
        username: 'You',
        userAvatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        text: newPostText,
        image: newPostImage,
        likes: 0,
        comments: 0,
        timePosted: 'Just now',
        liked: false,
      };

      // Simulate API delay
      setTimeout(() => {
        setPosts([newPost, ...posts]);
        setNewPostText('');
        setNewPostImage(null);
        setCreatingPost(false);
        setPostingInProgress(false);
        Alert.alert('Success', 'Your post has been shared!');
      }, 1000);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
      setPostingInProgress(false);
    }
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikedState = !post.liked;
        return {
          ...post, 
          liked: newLikedState,
          likes: newLikedState ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const navigateToComments = (postId) => {
    // In a real app, navigate to comments screen
    Alert.alert('Comments', 'Navigate to comments for post ' + postId);
    // navigation.navigate('PostComments', { postId });
  };

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timePosted}>{item.timePosted}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.postText}>{item.text}</Text>
        
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.postImage} 
            resizeMode="cover"
          />
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons 
              name={item.liked ? "heart" : "heart-outline"} 
              size={22} 
              color={item.liked ? "#e74c3c" : "#333"} 
            />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToComments(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#333" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Feed</Text>
        {!creatingPost && (
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={() => setCreatingPost(true)}
          >
            <Ionicons name="add-circle" size={26} color="#4b7bec" />
            <Text style={styles.createPostText}>Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {creatingPost ? (
        <View style={styles.createPostContainer}>
          <View style={styles.createPostHeader}>
            <TouchableOpacity onPress={() => {
              setCreatingPost(false);
              setNewPostText('');
              setNewPostImage(null);
            }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.createPostTitle}>Create Post</Text>
            <TouchableOpacity 
              style={[
                styles.postButton, 
                (!newPostText.trim() && !newPostImage) && styles.postButtonDisabled
              ]}
              onPress={handleCreatePost}
              disabled={(!newPostText.trim() && !newPostImage) || postingInProgress}
            >
              {postingInProgress ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Share</Text>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            multiline
            value={newPostText}
            onChangeText={setNewPostText}
          />

          {newPostImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: newPostImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setNewPostImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.postOptions}>
            <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color="#4b7bec" />
              <Text style={styles.optionText}>Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton}>
              <Ionicons name="location" size={24} color="#2ecc71" />
              <Text style={styles.optionText}>Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton}>
              <Ionicons name="pricetag" size={24} color="#e67e22" />
              <Text style={styles.optionText}>Tag</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4b7bec" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4b7bec']}
              />
            }
            ListHeaderComponent={
              <View style={styles.filterContainer}>
                <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
                  <Text style={styles.filterButtonTextActive}>All Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterButtonText}>Trending</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterButtonText}>Academic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterButtonText}>Events</Text>
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="newspaper-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>No posts to display</Text>
                <Text style={styles.emptySubText}>Be the first to post something!</Text>
              </View>
            }
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  createPostText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#4b7bec',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  feedContainer: {
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: '#4b7bec',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  timePosted: {
    fontSize: 12,
    color: '#888',
  },
  moreButton: {
    marginLeft: 'auto',
  },
  postText: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  postActions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  createPostContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  createPostTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginLeft: -24, // To offset the back button and center the text
  },
  postButton: {
    backgroundColor: '#4b7bec',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  postButtonDisabled: {
    backgroundColor: '#b3c8f7',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  postInput: {
    padding: 16,
    fontSize: 16,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  postOptions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default SocialFeedScreen_new;
