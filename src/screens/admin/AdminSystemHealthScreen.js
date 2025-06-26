import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const { width } = Dimensions.get('window');

const AdminSystemHealthScreen = ({ navigation }) => {
    const [healthData, setHealthData] = useState({
        systemStatus: 'healthy',
        uptime: '99.9%',
        responseTime: '120ms',
        activeUsers: 0,
        serverLoad: 45,
        databaseStatus: 'connected',
        apiStatus: 'operational',
        storageUsage: 65,
        memoryUsage: 70,
        cpuUsage: 55,
        networkLatency: 25,
        errorRate: 0.1,
        alerts: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHealthData();
        
        // Set up real-time monitoring
        const interval = setInterval(loadHealthData, 30000); // Update every 30 seconds
        
        return () => clearInterval(interval);
    }, []);

    const loadHealthData = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getSystemHealth();
            if (response.success) {
                setHealthData(response.data);
            }
        } catch (error) {
            console.error('Error loading health data:', error);
            Alert.alert('Error', 'Failed to load system health data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHealthData();
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
            case 'connected':
            case 'operational':
                return '#2ecc71';
            case 'warning':
                return '#f39c12';
            case 'critical':
            case 'error':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    };

    const getUsageColor = (usage) => {
        if (usage < 50) return '#2ecc71';
        if (usage < 80) return '#f39c12';
        return '#e74c3c';
    };

    const StatusCard = ({ title, status, value, icon, onPress }) => (
        <TouchableOpacity style={styles.statusCard} onPress={onPress}>
            <LinearGradient
                colors={[getStatusColor(status), `${getStatusColor(status)}80`]}
                style={styles.statusGradient}
            >
                <View style={styles.statusContent}>
                    <Ionicons name={icon} size={24} color="#fff" />
                    <Text style={styles.statusTitle}>{title}</Text>
                    <Text style={styles.statusValue}>{value}</Text>
                    <Text style={styles.statusLabel}>{status.toUpperCase()}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const UsageCard = ({ title, usage, unit, icon }) => (
        <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
                <View style={styles.usageIcon}>
                    <Ionicons name={icon} size={20} color={getUsageColor(usage)} />
                </View>
                <Text style={styles.usageTitle}>{title}</Text>
                <Text style={[styles.usagePercentage, { color: getUsageColor(usage) }]}>
                    {usage}{unit}
                </Text>
            </View>
            <View style={styles.usageBarContainer}>
                <View style={styles.usageBarBackground}>
                    <View
                        style={[
                            styles.usageBarFill,
                            {
                                width: `${Math.min(usage, 100)}%`,
                                backgroundColor: getUsageColor(usage)
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );

    const AlertItem = ({ alert, index }) => (
        <View style={[styles.alertItem, { borderLeftColor: getStatusColor(alert.severity) }]}>
            <View style={styles.alertHeader}>
                <View style={styles.alertIcon}>
                    <Ionicons
                        name={alert.severity === 'critical' ? 'warning' : 'information-circle'}
                        size={16}
                        color={getStatusColor(alert.severity)}
                    />
                </View>
                <Text style={[styles.alertSeverity, { color: getStatusColor(alert.severity) }]}>
                    {alert.severity.toUpperCase()}
                </Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            {alert.action && (
                <TouchableOpacity style={styles.alertAction}>
                    <Text style={styles.alertActionText}>{alert.action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const restartService = (service) => {
        Alert.alert(
            'Restart Service',
            `Are you sure you want to restart the ${service} service?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restart',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await adminApiService.restartService(service);
                            if (response.success) {
                                Alert.alert('Success', `${service} service restarted successfully`);
                                loadHealthData();
                            }
                        } catch (error) {
                            Alert.alert('Error', `Failed to restart ${service} service`);
                        }
                    }
                }
            ]
        );
    };

    const clearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will clear all cached data. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    onPress: async () => {
                        try {
                            const response = await adminApiService.clearSystemCache();
                            if (response.success) {
                                Alert.alert('Success', 'Cache cleared successfully');
                                loadHealthData();
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear cache');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Health</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AdminSystemLogs')}>
                    <Ionicons name="document-text" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* System Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Status</Text>
                    <View style={styles.statusGrid}>
                        <StatusCard
                            title="Overall Health"
                            status={healthData.systemStatus}
                            value={healthData.uptime}
                            icon="shield-checkmark"
                        />
                        <StatusCard
                            title="API Response"
                            status={healthData.apiStatus}
                            value={healthData.responseTime}
                            icon="speedometer"
                        />
                        <StatusCard
                            title="Database"
                            status={healthData.databaseStatus}
                            value="Connected"
                            icon="server"
                            onPress={() => restartService('database')}
                        />
                        <StatusCard
                            title="Active Users"
                            status="healthy"
                            value={healthData.activeUsers.toString()}
                            icon="people"
                        />
                    </View>
                </View>

                {/* Resource Usage */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resource Usage</Text>
                    <View style={styles.usageGrid}>
                        <UsageCard
                            title="CPU Usage"
                            usage={healthData.cpuUsage}
                            unit="%"
                            icon="hardware-chip"
                        />
                        <UsageCard
                            title="Memory Usage"
                            usage={healthData.memoryUsage}
                            unit="%"
                            icon="albums"
                        />
                        <UsageCard
                            title="Storage Usage"
                            usage={healthData.storageUsage}
                            unit="%"
                            icon="folder"
                        />
                        <UsageCard
                            title="Network Latency"
                            usage={healthData.networkLatency}
                            unit="ms"
                            icon="wifi"
                        />
                    </View>
                </View>

                {/* Performance Metrics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance</Text>
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{healthData.serverLoad}%</Text>
                            <Text style={styles.metricLabel}>Server Load</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{healthData.errorRate}%</Text>
                            <Text style={styles.metricLabel}>Error Rate</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{healthData.responseTime}</Text>
                            <Text style={styles.metricLabel}>Avg Response</Text>
                        </View>
                    </View>
                </View>

                {/* System Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={clearCache}
                        >
                            <Ionicons name="refresh" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Clear Cache</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => restartService('api')}
                        >
                            <Ionicons name="power" size={24} color={COLORS.warning} />
                            <Text style={styles.actionText}>Restart API</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('AdminSystemLogs')}
                        >
                            <Ionicons name="document-text" size={24} color={COLORS.info} />
                            <Text style={styles.actionText}>View Logs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('AdminSystemSettings')}
                        >
                            <Ionicons name="settings" size={24} color={COLORS.dark} />
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Alerts */}
                {healthData.alerts && healthData.alerts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Alerts</Text>
                        {healthData.alerts.map((alert, index) => (
                            <AlertItem key={index} alert={alert} index={index} />
                        ))}
                    </View>
                )}
            </ScrollView>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 16,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statusCard: {
        width: (width - 60) / 2,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    statusGradient: {
        padding: 16,
    },
    statusContent: {
        alignItems: 'center',
    },
    statusTitle: {
        color: '#fff',
        fontSize: SIZES.body2,
        marginTop: 8,
        textAlign: 'center',
    },
    statusValue: {
        color: '#fff',
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        marginTop: 4,
    },
    statusLabel: {
        color: '#fff',
        fontSize: SIZES.body3,
        marginTop: 4,
        opacity: 0.9,
    },
    usageGrid: {
        gap: 12,
    },
    usageCard: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    usageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    usageIcon: {
        marginRight: 12,
    },
    usageTitle: {
        flex: 1,
        fontSize: SIZES.body2,
        color: COLORS.dark,
        fontWeight: '500',
    },
    usagePercentage: {
        fontSize: SIZES.body2,
        fontWeight: 'bold',
    },
    usageBarContainer: {
        marginTop: 8,
    },
    usageBarBackground: {
        height: 6,
        backgroundColor: COLORS.gray[200],
        borderRadius: 3,
        overflow: 'hidden',
    },
    usageBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricCard: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    metricValue: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    metricLabel: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        marginTop: 4,
        textAlign: 'center',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: (width - 60) / 2,
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionText: {
        fontSize: SIZES.body2,
        color: COLORS.dark,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    alertItem: {
        backgroundColor: COLORS.light,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertIcon: {
        marginRight: 8,
    },
    alertSeverity: {
        fontSize: SIZES.body3,
        fontWeight: '600',
        flex: 1,
    },
    alertTime: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    alertMessage: {
        fontSize: SIZES.body2,
        color: COLORS.dark,
        marginBottom: 8,
    },
    alertAction: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: COLORS.primary + '20',
        borderRadius: 4,
    },
    alertActionText: {
        fontSize: SIZES.body3,
        color: COLORS.primary,
        fontWeight: '500',
    },
});

export default AdminSystemHealthScreen;
