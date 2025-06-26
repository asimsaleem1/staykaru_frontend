import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

const SimpleChart = ({ 
    data = [], 
    type = 'line', 
    height = 200,
    color = COLORS.primary,
    title,
    showGrid = true
}) => {
    if (!data || data.length === 0) {
        return (
            <View style={[styles.container, { height }]}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No data available</Text>
                </View>
            </View>
        );
    }

    const maxValue = Math.max(...data.map(item => item.value || 0));
    const minValue = Math.min(...data.map(item => item.value || 0));
    const range = maxValue - minValue || 1;

    const chartWidth = width - 100; // Account for padding and margins
    const chartHeight = height - 80; // Account for title and labels

    const renderLineChart = () => {
        const points = data.map((item, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
            return { x, y, value: item.value, label: item.label };
        });

        return (
            <View style={styles.chartContainer}>
                {/* Grid lines */}
                {showGrid && (
                    <View style={styles.grid}>
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.gridLine,
                                    {
                                        top: ratio * chartHeight,
                                        width: chartWidth,
                                    }
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* Data points and line */}
                <View style={styles.dataContainer}>
                    {points.map((point, index) => (
                        <View key={index}>
                            {/* Line segment */}
                            {index > 0 && (
                                <View
                                    style={[
                                        styles.lineSegment,
                                        {
                                            position: 'absolute',
                                            left: points[index - 1].x,
                                            top: points[index - 1].y,
                                            width: Math.sqrt(
                                                Math.pow(point.x - points[index - 1].x, 2) +
                                                Math.pow(point.y - points[index - 1].y, 2)
                                            ),
                                            transform: [
                                                {
                                                    rotate: `${Math.atan2(
                                                        point.y - points[index - 1].y,
                                                        point.x - points[index - 1].x
                                                    )}rad`
                                                }
                                            ],
                                            backgroundColor: color,
                                        }
                                    ]}
                                />
                            )}
                            
                            {/* Data point */}
                            <View
                                style={[
                                    styles.dataPoint,
                                    {
                                        left: point.x - 4,
                                        top: point.y - 4,
                                        backgroundColor: color,
                                    }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Labels */}
                <View style={styles.labelsContainer}>
                    {points.map((point, index) => (
                        <Text
                            key={index}
                            style={[
                                styles.label,
                                {
                                    left: point.x - 20,
                                    top: chartHeight + 10,
                                }
                            ]}
                        >
                            {point.label}
                        </Text>
                    ))}
                </View>
            </View>
        );
    };

    const renderBarChart = () => {
        const barWidth = chartWidth / (data.length * 2);
        const barSpacing = barWidth;

        return (
            <View style={styles.chartContainer}>
                {/* Grid lines */}
                {showGrid && (
                    <View style={styles.grid}>
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.gridLine,
                                    {
                                        top: ratio * chartHeight,
                                        width: chartWidth,
                                    }
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* Bars */}
                <View style={styles.barsContainer}>
                    {data.map((item, index) => {
                        const barHeight = ((item.value - minValue) / range) * chartHeight;
                        const x = index * (barWidth + barSpacing) + barSpacing / 2;
                        
                        return (
                            <View key={index}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            left: x,
                                            bottom: 0,
                                            width: barWidth,
                                            height: barHeight,
                                            backgroundColor: color,
                                        }
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.label,
                                        {
                                            left: x - 10,
                                            top: chartHeight + 10,
                                        }
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { height }]}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
                {type === 'line' ? renderLineChart() : renderBarChart()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 16,
        textAlign: 'center',
    },
    chart: {
        position: 'relative',
    },
    chartContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    grid: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    gridLine: {
        position: 'absolute',
        height: 1,
        backgroundColor: COLORS.gray[200],
    },
    dataContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    lineSegment: {
        height: 2,
        position: 'absolute',
    },
    dataPoint: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.light,
    },
    barsContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    bar: {
        position: 'absolute',
        borderRadius: 4,
    },
    labelsContainer: {
        position: 'relative',
        width: '100%',
        height: 30,
    },
    label: {
        position: 'absolute',
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        textAlign: 'center',
        width: 40,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
    },
});

export default SimpleChart;
