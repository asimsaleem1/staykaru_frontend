import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';

const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon, 
    color = 'blue',
    format = 'number'
}) => {
    const formatValue = (val) => {
        if (format === 'currency') {
            return `$${val.toLocaleString()}`;
        }
        if (format === 'percentage') {
            return `${val}%`;
        }
        return val.toLocaleString();
    };

    const getColorScheme = (colorName) => {
        const colors = {
            blue: { bg: COLORS.primary + '10', text: COLORS.primary },
            green: { bg: '#10B98110', text: '#10B981' },
            yellow: { bg: '#F59E0B10', text: '#F59E0B' },
            purple: { bg: '#8B5CF610', text: '#8B5CF6' },
            red: { bg: '#EF444410', text: '#EF4444' },
        };
        return colors[colorName] || colors.blue;
    };

    const colorScheme = getColorScheme(color);
    const isPositive = change >= 0;
    const changeColor = isPositive ? '#10B981' : '#EF4444';
    const changeIcon = isPositive ? 'trending-up' : 'trending-down';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colorScheme.bg }]}>
                    <Ionicons name={icon} size={24} color={colorScheme.text} />
                </View>
                <View style={styles.changeContainer}>
                    <Ionicons 
                        name={changeIcon} 
                        size={16} 
                        color={changeColor} 
                    />
                    <Text style={[styles.changeText, { color: changeColor }]}>
                        {Math.abs(change)}%
                    </Text>
                </View>
            </View>
            
            <View style={styles.content}>
                <Text style={styles.value}>{formatValue(value)}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    changeText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
        marginLeft: 4,
    },
    content: {
        alignItems: 'flex-start',
    },
    value: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 4,
    },
    title: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
});

export default MetricCard;
