import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';

const FormField = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    error,
    multiline = false,
    numberOfLines = 1,
    editable = true,
    maxLength,
    leftIcon,
    rightIcon,
    onRightIconPress,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                error && styles.errorContainer,
                isFocused && styles.focusedContainer
            ]}>        {leftIcon && (
                <View style={styles.leftIcon}>
                    <Ionicons name={leftIcon} size={20} color={COLORS.gray[500]} />
                </View>
            )}

                <TextInput
                    style={[
                        styles.input,
                        leftIcon && styles.inputWithLeftIcon,
                        (secureTextEntry || rightIcon) && styles.inputWithRightIcon,
                        multiline && styles.multilineInput,
                        !editable && styles.disabledInput
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={editable}
                    maxLength={maxLength}
                    placeholderTextColor={COLORS.gray[400]}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        style={styles.rightIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={COLORS.gray[500]}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIcon}
                    >
                        <Ionicons name={rightIcon} size={20} color={COLORS.gray[500]} />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {maxLength && (
                <Text style={styles.characterCount}>
                    {value ? value.length : 0}/{maxLength}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        marginBottom: 8,
        color: COLORS.dark,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.light,
        minHeight: 50,
    },
    focusedContainer: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    errorContainer: {
        borderColor: COLORS.error,
    },
    leftIcon: {
        paddingLeft: 15,
        paddingRight: 10,
    },
    input: {
        flex: 1,
        padding: 15,
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    inputWithLeftIcon: {
        paddingLeft: 5,
    },
    inputWithRightIcon: {
        paddingRight: 5,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    disabledInput: {
        backgroundColor: COLORS.gray[100],
        color: COLORS.gray[500],
    },
    rightIcon: {
        paddingRight: 15,
        paddingLeft: 10,
    },
    errorText: {
        color: COLORS.error,
        fontSize: SIZES.body3,
        marginTop: 5,
    },
    characterCount: {
        color: COLORS.gray[500],
        fontSize: SIZES.body3,
        textAlign: 'right',
        marginTop: 5,
    },
});

export default FormField;
