import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import imageService from '../services/imageService';
import { COLORS, SIZES } from '../utils/constants';

const ImagePicker = ({
    imageUri,
    onImageSelected,
    placeholder = "Add Profile Picture",
    size = 120,
    editable = true
}) => {
    const handleImagePicker = () => {
        if (!editable) return;

        imageService.showImagePicker((imageData) => {
            onImageSelected(imageData);
        });
    };

    const handleRemoveImage = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove your profile picture?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => onImageSelected(null),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.imageContainer,
                    { width: size, height: size, borderRadius: size / 2 },
                    !imageUri && styles.placeholderContainer
                ]}
                onPress={handleImagePicker}
                disabled={!editable}
            >
                {imageUri ? (
                    <>
                        <Image
                            source={{ uri: imageUri }}
                            style={[
                                styles.image,
                                { width: size, height: size, borderRadius: size / 2 }
                            ]}
                        />            {editable && (
                            <View style={styles.editOverlay}>
                                <Ionicons name="camera" size={20} color="white" />
                            </View>
                        )}
                    </>
                ) : (<View style={styles.placeholder}>
                    <Ionicons
                        name="camera"
                        size={size * 0.3}
                        color={COLORS.gray[400]}
                    />
                    <Text style={[
                        styles.placeholderText,
                        { fontSize: size * 0.1 }
                    ]}>
                        {placeholder}
                    </Text>
                </View>
                )}
            </TouchableOpacity>

            {imageUri && editable && (<TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveImage}
            >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
            )}

            {editable && (
                <Text style={styles.helpText}>
                    Tap to {imageUri ? 'change' : 'add'} photo
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
    },
    imageContainer: {
        position: 'relative',
        borderWidth: 2,
        borderColor: COLORS.gray[300],
        overflow: 'hidden',
    },
    placeholderContainer: {
        backgroundColor: COLORS.gray[100],
        borderStyle: 'dashed',
    },
    image: {
        resizeMode: 'cover',
    },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    helpText: {
        marginTop: 10,
        fontSize: SIZES.body3,
        color: COLORS.gray[500],
        textAlign: 'center',
    },
});

export default ImagePicker;
