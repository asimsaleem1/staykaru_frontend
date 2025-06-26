import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';
import MetricCard from '../../components/admin/MetricCard';
import SimpleChart from '../../components/admin/SimpleChart';

const { width } = Dimensions.get('window');

const AdminReportsCenterScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    
    // Reports data
    const [reportsMetrics, setReportsMetrics] = useState({});
    const [availableReports, setAvailableReports] = useState([]);
    const [scheduledReports, setScheduledReports] = useState([]);
    const [recentExports, setRecentExports] = useState([]);
    
    // Create report form
    const [newReport, setNewReport] = useState({
        name: '',
        type: 'users',
        dateRange: '30d',
        format: 'csv',
        filters: {},
    });

    // Schedule report form
    const [scheduleReport, setScheduleReport] = useState({
        reportId: '',
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: '09:00',
        recipients: '',
    });

    useEffect(() => {
        loadReportsData();
    }, []);

    const loadReportsData = async () => {
        try {
            setLoading(true);
            
            const [metricsRes, reportsRes, scheduledRes, exportsRes] = await Promise.all([
                adminApiService.getReportsMetrics(),
                adminApiService.getAvailableReports(),
                adminApiService.getScheduledReports(),
                adminApiService.getRecentExports(),
            ]);

            if (metricsRes.success) setReportsMetrics(metricsRes.data);
            if (reportsRes.success) setAvailableReports(reportsRes.data.reports || []);
            if (scheduledRes.success) setScheduledReports(scheduledRes.data.scheduled || []);
            if (exportsRes.success) setRecentExports(exportsRes.data.exports || []);

        } catch (error) {
            console.error('Error loading reports data:', error);
            Alert.alert('Error', 'Failed to load reports data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (reportConfig) => {
        try {
            const response = await adminApiService.generateReport(reportConfig);
            
            if (response.success) {
                Alert.alert('Success', 'Report generated successfully');
                loadReportsData();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate report');
        }
    };

    const handleScheduleReport = async (scheduleConfig) => {
        try {
            await adminApiService.scheduleReport(scheduleConfig);
            Alert.alert('Success', 'Report scheduled successfully');
            setShowScheduleModal(false);
            loadReportsData();
        } catch (error) {
            Alert.alert('Error', 'Failed to schedule report');
        }
    };

    const handleDownloadReport = async (exportId) => {
        try {
            const response = await adminApiService.downloadReport(exportId);
            
            if (response.success) {
                Alert.alert('Success', 'Report download initiated');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to download report');
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        Alert.alert(
            'Delete Schedule',
            'Are you sure you want to delete this scheduled report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminApiService.deleteScheduledReport(scheduleId);
                            Alert.alert('Success', 'Scheduled report deleted');
                            loadReportsData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete scheduled report');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getReportTypeIcon = (type) => {
        const icons = {
            users: 'people',
            listings: 'home',
            transactions: 'card',
            reviews: 'star',
            analytics: 'analytics',
            financial: 'cash',
        };
        return icons[type] || 'document';
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: '#10B981',
            processing: '#3B82F6',
            failed: '#EF4444',
            queued: '#F59E0B',
        };
        return colors[status] || '#6B7280';
    };

    const renderCreateReportModal = () => (
        <Modal
            visible={showCreateModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCreateModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Custom Report</Text>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Report Name</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Enter report name"
                                value={newReport.name}
                                onChangeText={(value) => setNewReport({...newReport, name: value})}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Report Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {[
                                    { key: 'users', label: 'Users' },
                                    { key: 'listings', label: 'Listings' },
                                    { key: 'transactions', label: 'Transactions' },
                                    { key: 'reviews', label: 'Reviews' },
                                    { key: 'analytics', label: 'Analytics' },
                                    { key: 'financial', label: 'Financial' },
                                ].map((type) => (
                                    <TouchableOpacity
                                        key={type.key}
                                        style={[
                                            styles.typeButton,
                                            newReport.type === type.key && styles.typeButtonActive
                                        ]}
                                        onPress={() => setNewReport({...newReport, type: type.key})}
                                    >
                                        <Text style={[
                                            styles.typeButtonText,
                                            newReport.type === type.key && styles.typeButtonTextActive
                                        ]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Date Range</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {[
                                    { key: '7d', label: '7 Days' },
                                    { key: '30d', label: '30 Days' },
                                    { key: '90d', label: '90 Days' },
                                    { key: '1y', label: '1 Year' },
                                    { key: 'all', label: 'All Time' },
                                ].map((range) => (
                                    <TouchableOpacity
                                        key={range.key}
                                        style={[
                                            styles.rangeButton,
                                            newReport.dateRange === range.key && styles.rangeButtonActive
                                        ]}
                                        onPress={() => setNewReport({...newReport, dateRange: range.key})}
                                    >
                                        <Text style={[
                                            styles.rangeButtonText,
                                            newReport.dateRange === range.key && styles.rangeButtonTextActive
                                        ]}>
                                            {range.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Export Format</Text>
                            <View style={styles.formatButtons}>
                                {[
                                    { key: 'csv', label: 'CSV' },
                                    { key: 'excel', label: 'Excel' },
                                    { key: 'pdf', label: 'PDF' },
                                ].map((format) => (
                                    <TouchableOpacity
                                        key={format.key}
                                        style={[
                                            styles.formatButton,
                                            newReport.format === format.key && styles.formatButtonActive
                                        ]}
                                        onPress={() => setNewReport({...newReport, format: format.key})}
                                    >
                                        <Text style={[
                                            styles.formatButtonText,
                                            newReport.format === format.key && styles.formatButtonTextActive
                                        ]}>
                                            {format.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.generateButton,
                                !newReport.name.trim() && styles.generateButtonDisabled
                            ]}
                            onPress={() => {
                                handleGenerateReport(newReport);
                                setShowCreateModal(false);
                                setNewReport({
                                    name: '',
                                    type: 'users',
                                    dateRange: '30d',
                                    format: 'csv',
                                    filters: {},
                                });
                            }}
                            disabled={!newReport.name.trim()}
                        >
                            <Text style={styles.generateButtonText}>Generate Report</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderScheduleModal = () => (
        <Modal
            visible={showScheduleModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowScheduleModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Schedule Report</Text>
                        <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Select Report</Text>
                            <ScrollView style={styles.reportsList}>
                                {availableReports.map((report) => (
                                    <TouchableOpacity
                                        key={report.id}
                                        style={[
                                            styles.reportItem,
                                            scheduleReport.reportId === report.id && styles.reportItemActive
                                        ]}
                                        onPress={() => setScheduleReport({...scheduleReport, reportId: report.id})}
                                    >
                                        <Ionicons
                                            name={getReportTypeIcon(report.type)}
                                            size={20}
                                            color={scheduleReport.reportId === report.id ? COLORS.primary : COLORS.gray[600]}
                                        />
                                        <Text style={[
                                            styles.reportItemText,
                                            scheduleReport.reportId === report.id && styles.reportItemTextActive
                                        ]}>
                                            {report.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Frequency</Text>
                            <View style={styles.frequencyButtons}>
                                {[
                                    { key: 'daily', label: 'Daily' },
                                    { key: 'weekly', label: 'Weekly' },
                                    { key: 'monthly', label: 'Monthly' },
                                ].map((freq) => (
                                    <TouchableOpacity
                                        key={freq.key}
                                        style={[
                                            styles.frequencyButton,
                                            scheduleReport.frequency === freq.key && styles.frequencyButtonActive
                                        ]}
                                        onPress={() => setScheduleReport({...scheduleReport, frequency: freq.key})}
                                    >
                                        <Text style={[
                                            styles.frequencyButtonText,
                                            scheduleReport.frequency === freq.key && styles.frequencyButtonTextActive
                                        ]}>
                                            {freq.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Recipients</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Enter email addresses (comma-separated)"
                                value={scheduleReport.recipients}
                                onChangeText={(value) => setScheduleReport({...scheduleReport, recipients: value})}
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.scheduleButton,
                                (!scheduleReport.reportId || !scheduleReport.recipients.trim()) && styles.scheduleButtonDisabled
                            ]}
                            onPress={() => handleScheduleReport(scheduleReport)}
                            disabled={!scheduleReport.reportId || !scheduleReport.recipients.trim()}
                        >
                            <Text style={styles.scheduleButtonText}>Schedule Report</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderOverviewTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Metrics */}
            <View style={styles.metricsGrid}>
                <MetricCard
                    title="Total Reports"
                    value={reportsMetrics.totalReports?.toString() || '0'}
                    change={reportsMetrics.reportsChange}
                    icon="document-text"
                    color="#3B82F6"
                />
                <MetricCard
                    title="Scheduled Reports"
                    value={reportsMetrics.scheduledReports?.toString() || '0'}
                    change={reportsMetrics.scheduledChange}
                    icon="time"
                    color="#10B981"
                />
                <MetricCard
                    title="This Month"
                    value={reportsMetrics.monthlyReports?.toString() || '0'}
                    change={reportsMetrics.monthlyChange}
                    icon="calendar"
                    color="#F59E0B"
                />
                <MetricCard
                    title="Data Exported"
                    value={reportsMetrics.dataExported || '0 GB'}
                    change={reportsMetrics.dataChange}
                    icon="download"
                    color="#8B5CF6"
                />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.quickActionText}>Create Report</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setShowScheduleModal(true)}
                    >
                        <Ionicons name="time" size={24} color={COLORS.primary} />
                        <Text style={styles.quickActionText}>Schedule Report</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setSelectedTab('exports')}
                    >
                        <Ionicons name="download" size={24} color={COLORS.primary} />
                        <Text style={styles.quickActionText}>View Exports</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pre-built Reports */}
            <View style={styles.reportsSection}>
                <Text style={styles.sectionTitle}>Pre-built Reports</Text>
                <View style={styles.prebuiltReports}>
                    {[
                        { name: 'User Activity Report', type: 'users', description: 'User registration and activity metrics' },
                        { name: 'Listings Performance', type: 'listings', description: 'Property listing views and bookings' },
                        { name: 'Financial Summary', type: 'financial', description: 'Revenue, commissions, and payouts' },
                        { name: 'Content Moderation', type: 'analytics', description: 'Moderation queue and actions' },
                    ].map((report, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.prebuiltReportItem}
                            onPress={() => handleGenerateReport({
                                name: report.name,
                                type: report.type,
                                dateRange: '30d',
                                format: 'csv'
                            })}
                        >
                            <View style={styles.reportIcon}>
                                <Ionicons name={getReportTypeIcon(report.type)} size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.reportContent}>
                                <Text style={styles.reportName}>{report.name}</Text>
                                <Text style={styles.reportDescription}>{report.description}</Text>
                            </View>
                            <Ionicons name="play" size={20} color={COLORS.gray[400]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );

    const renderScheduledTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Scheduled Reports</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowScheduleModal(true)}
                >
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {scheduledReports.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="time" size={64} color={COLORS.gray[400]} />
                    <Text style={styles.emptyTitle}>No Scheduled Reports</Text>
                    <Text style={styles.emptySubtitle}>
                        Create automated reports to receive regular updates
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => setShowScheduleModal(true)}
                    >
                        <Text style={styles.emptyButtonText}>Schedule First Report</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.scheduledList}>
                    {scheduledReports.map((schedule) => (
                        <View key={schedule.id} style={styles.scheduleItem}>
                            <View style={styles.scheduleHeader}>
                                <View style={styles.scheduleInfo}>
                                    <Text style={styles.scheduleName}>{schedule.reportName}</Text>
                                    <Text style={styles.scheduleFrequency}>
                                        {schedule.frequency} • Next: {formatDate(schedule.nextRun)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteSchedule(schedule.id)}
                                >
                                    <Ionicons name="trash" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.scheduleDetails}>
                                <Text style={styles.scheduleRecipients}>
                                    Recipients: {schedule.recipients}
                                </Text>
                                <Text style={styles.scheduleCreated}>
                                    Created: {formatDate(schedule.createdAt)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const renderExportsTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Recent Exports</Text>

            {recentExports.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="download" size={64} color={COLORS.gray[400]} />
                    <Text style={styles.emptyTitle}>No Recent Exports</Text>
                    <Text style={styles.emptySubtitle}>
                        Generate reports to see export history
                    </Text>
                </View>
            ) : (
                <View style={styles.exportsList}>
                    {recentExports.map((export_) => (
                        <View key={export_.id} style={styles.exportItem}>
                            <View style={styles.exportIcon}>
                                <Ionicons 
                                    name={getReportTypeIcon(export_.type)} 
                                    size={24} 
                                    color={COLORS.primary} 
                                />
                            </View>
                            
                            <View style={styles.exportInfo}>
                                <Text style={styles.exportName}>{export_.name}</Text>
                                <Text style={styles.exportDetails}>
                                    {export_.format.toUpperCase()} • {export_.size} • {formatDate(export_.createdAt)}
                                </Text>
                            </View>

                            <View style={styles.exportStatus}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: getStatusColor(export_.status) }
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: getStatusColor(export_.status) }
                                ]}>
                                    {export_.status.toUpperCase()}
                                </Text>
                            </View>

                            {export_.status === 'completed' && (
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() => handleDownloadReport(export_.id)}
                                >
                                    <Ionicons name="download" size={18} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'overview':
                return renderOverviewTab();
            case 'scheduled':
                return renderScheduledTab();
            case 'exports':
                return renderExportsTab();
            default:
                return renderOverviewTab();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Reports Center</Text>
                    <Text style={styles.headerSubtitle}>
                        {reportsMetrics.totalReports || 0} reports generated
                    </Text>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'overview', label: 'Overview', icon: 'analytics' },
                        { key: 'scheduled', label: 'Scheduled', icon: 'time' },
                        { key: 'exports', label: 'Exports', icon: 'download' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                selectedTab === tab.key && styles.tabButtonActive
                            ]}
                            onPress={() => setSelectedTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={selectedTab === tab.key ? COLORS.primary : COLORS.gray[500]}
                            />
                            <Text style={[
                                styles.tabButtonText,
                                selectedTab === tab.key && styles.tabButtonTextActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading reports...</Text>
                </View>
            ) : (
                renderTabContent()
            )}

            {renderCreateReportModal()}
            {renderScheduleModal()}
        </View>
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerSubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    tabNavigation: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: COLORS.gray[100],
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    tabButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        fontWeight: '500',
        marginLeft: 8,
    },
    tabButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        marginTop: 16,
    },
    tabContent: {
        flex: 1,
        padding: 20,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickActionsContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        minWidth: (width - 64) / 3,
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    quickActionText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[700],
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    reportsSection: {
        marginBottom: 24,
    },
    prebuiltReports: {
        gap: 12,
    },
    prebuiltReportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportContent: {
        flex: 1,
    },
    reportName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    reportDescription: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.gray[700],
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: SIZES.body1,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 8,
        maxWidth: 250,
    },
    emptyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    emptyButtonText: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.light,
    },
    scheduledList: {
        gap: 16,
    },
    scheduleItem: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    scheduleFrequency: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
    deleteButton: {
        padding: 4,
    },
    scheduleDetails: {
        gap: 4,
    },
    scheduleRecipients: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    scheduleCreated: {
        fontSize: SIZES.body3,
        color: COLORS.gray[500],
    },
    exportsList: {
        gap: 16,
    },
    exportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    exportIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    exportInfo: {
        flex: 1,
    },
    exportName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    exportDetails: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    exportStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
    },
    downloadButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '20',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.light,
        borderRadius: 16,
        width: '100%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    modalTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    modalContent: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    formInput: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    typeButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    typeButtonText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    typeButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    rangeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    rangeButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    rangeButtonText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    rangeButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    formatButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    formatButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.gray[100],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    formatButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    formatButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    formatButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    generateButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    generateButtonDisabled: {
        backgroundColor: COLORS.gray[300],
    },
    generateButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
    reportsList: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 12,
        padding: 8,
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    reportItemActive: {
        backgroundColor: COLORS.primary + '20',
    },
    reportItemText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        marginLeft: 12,
        fontWeight: '500',
    },
    reportItemTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    frequencyButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    frequencyButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.gray[100],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    frequencyButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    frequencyButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    frequencyButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    scheduleButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    scheduleButtonDisabled: {
        backgroundColor: COLORS.gray[300],
    },
    scheduleButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
});

export default AdminReportsCenterScreen;
