import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const AdminSystemLogsScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('today');

    const logLevels = [
        { value: 'all', label: 'All Levels', color: '#95a5a6' },
        { value: 'info', label: 'Info', color: '#3498db' },
        { value: 'warning', label: 'Warning', color: '#f39c12' },
        { value: 'error', label: 'Error', color: '#e74c3c' },
        { value: 'critical', label: 'Critical', color: '#8e44ad' },
    ];

    const dateRanges = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'all', label: 'All Time' },
    ];

    useEffect(() => {
        loadSystemLogs();
    }, [selectedLevel, selectedDateRange]);

    useEffect(() => {
        filterLogs();
    }, [logs, searchQuery, selectedLevel]);

    const loadSystemLogs = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getSystemLogs({
                level: selectedLevel,
                dateRange: selectedDateRange,
            });
            
            if (response.success) {
                setLogs(response.data);
            } else {
                Alert.alert('Error', 'Failed to load system logs');
            }
        } catch (error) {
            console.error('Error loading system logs:', error);
            Alert.alert('Error', 'Failed to load system logs');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSystemLogs();
        setRefreshing(false);
    };

    const filterLogs = () => {
        let filtered = logs;

        if (searchQuery) {
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.user?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedLevel !== 'all') {
            filtered = filtered.filter(log => log.level === selectedLevel);
        }

        setFilteredLogs(filtered);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getLogLevelColor = (level) => {
        const levelConfig = logLevels.find(l => l.value === level);
        return levelConfig ? levelConfig.color : '#95a5a6';
    };

    const exportLogs = () => {
        Alert.alert(
            'Export Logs',
            'Export system logs for analysis?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Export',
                    onPress: async () => {
                        try {
                            const response = await adminApiService.exportSystemLogs({
                                level: selectedLevel,
                                dateRange: selectedDateRange,
                                format: 'csv'
                            });
                            if (response.success) {
                                Alert.alert('Success', 'Logs exported successfully');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to export logs');
                        }
                    }
                }
            ]
        );
    };

    const clearLogs = () => {
        Alert.alert(
            'Clear Logs',
            'Are you sure you want to clear old logs? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await adminApiService.clearSystemLogs();
                            if (response.success) {
                                Alert.alert('Success', 'Old logs cleared successfully');
                                loadSystemLogs();
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear logs');
                        }
                    }
                }
            ]
        );
    };

    const LogItem = ({ log }) => (
        <View style={[styles.logItem, { borderLeftColor: getLogLevelColor(log.level) }]}>
            <View style={styles.logHeader}>
                <View style={styles.logLevel}>
                    <View style={[styles.logLevelIndicator, { backgroundColor: getLogLevelColor(log.level) }]} />
                    <Text style={[styles.logLevelText, { color: getLogLevelColor(log.level) }]}>
                        {log.level.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
            </View>
            <Text style={styles.logMessage}>{log.message}</Text>
            <View style={styles.logFooter}>
                <Text style={styles.logSource}>Source: {log.source}</Text>
                {log.user && <Text style={styles.logUser}>User: {log.user}</Text>}
            </View>
            {log.stackTrace && (
                <TouchableOpacity
                    style={styles.stackTraceButton}
                    onPress={() => Alert.alert('Stack Trace', log.stackTrace)}
                >
                    <Text style={styles.stackTraceButtonText}>View Stack Trace</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const FilterModal = () => (
        <Modal
            visible={filterModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setFilterModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter Logs</Text>
                        <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                            <Ionicons name="close" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Log Level</Text>
                        {logLevels.map((level) => (
                            <TouchableOpacity
                                key={level.value}
                                style={[
                                    styles.filterOption,
                                    selectedLevel === level.value && styles.filterOptionSelected
                                ]}
                                onPress={() => setSelectedLevel(level.value)}
                            >
                                <View style={[styles.levelIndicator, { backgroundColor: level.color }]} />
                                <Text style={styles.filterOptionText}>{level.label}</Text>
                                {selectedLevel === level.value && (
                                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Date Range</Text>
                        {dateRanges.map((range) => (
                            <TouchableOpacity
                                key={range.value}
                                style={[
                                    styles.filterOption,
                                    selectedDateRange === range.value && styles.filterOptionSelected
                                ]}
                                onPress={() => setSelectedDateRange(range.value)}
                            >
                                <Text style={styles.filterOptionText}>{range.label}</Text>
                                {selectedDateRange === range.value && (
                                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.applyFilterButton}
                        onPress={() => {
                            setFilterModalVisible(false);
                            loadSystemLogs();
                        }}
                    >
                        <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Logs</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={exportLogs} style={styles.headerButton}>
                        <Ionicons name="download" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearLogs} style={styles.headerButton}>
                        <Ionicons name="trash" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray[600]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="filter" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Logs List */}
            <ScrollView
                style={styles.logsContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                        <LogItem key={index} log={log} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text" size={64} color={COLORS.gray[400]} />
                        <Text style={styles.emptyStateText}>No logs found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Try adjusting your filters or check back later
                        </Text>
                    </View>
                )}
            </ScrollView>

            <FilterModal />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.gray[100],
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    filterButton: {
        padding: 12,
        backgroundColor: COLORS.light,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    logsContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    logItem: {
        backgroundColor: COLORS.light,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    logLevel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logLevelIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    logLevelText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
    },
    logTimestamp: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    logMessage: {
        fontSize: SIZES.body2,
        color: COLORS.dark,
        marginBottom: 8,
        lineHeight: 20,
    },
    logFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    logSource: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    logUser: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    stackTraceButton: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: COLORS.gray[100],
        borderRadius: 4,
    },
    stackTraceButtonText: {
        fontSize: SIZES.body3,
        color: COLORS.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: SIZES.h4,
        color: COLORS.gray[600],
        marginTop: 16,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.light,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: COLORS.gray[50],
    },
    filterOptionSelected: {
        backgroundColor: COLORS.primary + '10',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    levelIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    filterOptionText: {
        flex: 1,
        fontSize: SIZES.body2,
        color: COLORS.dark,
    },
    applyFilterButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    applyFilterButtonText: {
        color: COLORS.light,
        fontSize: SIZES.body1,
        fontWeight: '600',
    },
});

export default AdminSystemLogsScreen;
