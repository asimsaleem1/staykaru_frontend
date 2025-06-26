import React from 'react';
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
    Modal,
} from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

const LoadingSpinner = ({
    size = 'large',
    color = COLORS.primary,
    text = '',
    overlay = false,
    visible = true,
    transparent = false
}) => {
    const renderContent = () => (
        <View style={[
            styles.container,
            overlay && styles.overlay,
            transparent && styles.transparent
        ]}>
            <View style={styles.spinnerContainer}>
                <ActivityIndicator size={size} color={color} />
                {text && <Text style={[styles.text, { color }]}>{text}</Text>}
            </View>
        </View>
    );

    if (overlay) {
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={visible}
                statusBarTranslucent
            >
                {renderContent()}
            </Modal>
        );
    }

    return visible ? renderContent() : null;
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
    transparent: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    spinnerContainer: {
        backgroundColor: 'white',
        borderRadius: SIZES.radius * 2,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        marginTop: 15,
        fontSize: SIZES.body1,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default LoadingSpinner;
