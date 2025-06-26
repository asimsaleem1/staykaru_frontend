import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

class ImageService {
    // Show image picker options
    showImagePicker(callback) {
        Alert.alert(
            'Select Profile Picture',
            'Choose how you want to select your profile picture',
            [
                {
                    text: 'Camera',
                    onPress: () => this.openCamera(callback),
                },
                {
                    text: 'Gallery',
                    onPress: () => this.openGallery(callback),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    }

  // Open camera
  async openCamera(callback) {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      this.handleImageResponse(result, callback);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  }

  // Open gallery
  async openGallery(callback) {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos');
        return;
      }      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      this.handleImageResponse(result, callback);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  }

    // Handle image picker response
    handleImageResponse(result, callback) {
        if (result.canceled) {
            console.log('User cancelled image picker');
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];

            // Validate file size (max 5MB)
            if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                Alert.alert('Error', 'Image size should be less than 5MB');
                return;
            }

            const imageData = {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                fileName: asset.fileName || `profile_${Date.now()}.jpg`,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
            };

            callback(imageData);
        }
    }

    // Resize image (if needed)
    resizeImage(imageUri, maxWidth = 800, maxHeight = 800, quality = 0.8) {
        // This would typically use a library like react-native-image-resizer
        // For now, we'll return the original image
        return Promise.resolve(imageUri);
    }

    // Get image info
    getImageInfo(uri) {
        return new Promise((resolve, reject) => {
            if (Platform.OS === 'ios') {
                // For iOS, we can get image info directly
                resolve({
                    width: 0,
                    height: 0,
                    size: 0,
                });
            } else {
                // For Android, we might need additional libraries
                resolve({
                    width: 0,
                    height: 0,
                    size: 0,
                });
            }
        });
    }

    // Upload image to server
    async uploadImage(imageData, endpoint, token) {
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageData.uri,
                type: imageData.type,
                name: imageData.fileName,
            });

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Upload failed');
            }

            return {
                success: true,
                imageUrl: result.imageUrl,
                message: 'Image uploaded successfully',
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                message: error.message || 'Failed to upload image',
            };
        }
    }

    // Delete image from server
    async deleteImage(imageUrl, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/upload/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ imageUrl }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Delete failed');
            }

            return {
                success: true,
                message: 'Image deleted successfully',
            };
        } catch (error) {
            console.error('Image delete error:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete image',
            };
        }
    }
}

export default new ImageService();
