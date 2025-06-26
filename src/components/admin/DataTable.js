import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';

const DataTable = ({ 
    data = [], 
    columns = [], 
    loading = false,
    onRowPress,
    onSort,
    sortColumn,
    sortDirection = 'asc',
    emptyMessage = 'No data available'
}) => {
    const handleSort = (columnKey) => {
        if (onSort) {
            const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
            onSort(columnKey, newDirection);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            {columns.map((column) => (
                <TouchableOpacity
                    key={column.key}
                    style={[styles.headerCell, { flex: column.flex || 1 }]}
                    onPress={() => column.sortable && handleSort(column.key)}
                    disabled={!column.sortable}
                >
                    <Text style={styles.headerText}>{column.title}</Text>
                    {column.sortable && (
                        <View style={styles.sortIconContainer}>
                            <Ionicons
                                name={
                                    sortColumn === column.key
                                        ? sortDirection === 'asc'
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                        : 'swap-vertical'
                                }
                                size={16}
                                color={
                                    sortColumn === column.key
                                        ? COLORS.primary
                                        : COLORS.gray[400]
                                }
                            />
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderRow = (item, index) => (
        <TouchableOpacity
            key={item.id || index}
            style={[
                styles.dataRow,
                index % 2 === 0 && styles.evenRow,
                onRowPress && styles.clickableRow
            ]}
            onPress={() => onRowPress && onRowPress(item)}
            disabled={!onRowPress}
        >
            {columns.map((column) => (
                <View key={column.key} style={[styles.dataCell, { flex: column.flex || 1 }]}>
                    {column.render ? (
                        column.render(item[column.key], item, index)
                    ) : (
                        <Text style={styles.cellText} numberOfLines={2}>
                            {item[column.key]?.toString() || '-'}
                        </Text>
                    )}
                </View>
            ))}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={COLORS.gray[400]} />
            <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {columns.length > 0 && renderHeader()}
            
            {loading ? (
                renderLoadingState()
            ) : data.length === 0 ? (
                renderEmptyState()
            ) : (
                <View style={styles.dataContainer}>
                    {data.map(renderRow)}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray[50],
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    headerCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerText: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
        flex: 1,
    },
    sortIconContainer: {
        marginLeft: 8,
    },
    dataContainer: {
        maxHeight: 400, // Scrollable if needed
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        minHeight: 60,
        alignItems: 'center',
    },
    evenRow: {
        backgroundColor: COLORS.gray[25],
    },
    clickableRow: {
        backgroundColor: COLORS.light,
    },
    dataCell: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'center',
    },
    cellText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        lineHeight: 20,
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[500],
        marginTop: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginTop: 12,
    },
});

export default DataTable;
