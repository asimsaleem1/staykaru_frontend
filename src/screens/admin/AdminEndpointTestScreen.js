import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { AdminModuleTester } from '../../tests/AdminModuleTester';

const AdminEndpointTestScreen = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [logs, setLogs] = useState([]);

    // Override console.log to capture test output
    useEffect(() => {
        const originalLog = console.log;
        
        console.log = (...args) => {
            const message = args.join(' ');
            setLogs(prev => [...prev, { message, timestamp: new Date().toISOString() }]);
            originalLog(...args);
        };

        return () => {
            console.log = originalLog;
        };
    }, []);

    const runTests = async () => {
        setIsRunning(true);
        setLogs([]);
        setTestResults(null);

        try {
            const tester = new AdminModuleTester();
            const results = await tester.runComprehensiveTest();
            setTestResults(results);
        } catch (error) {
            Alert.alert('Test Error', error.message);
        } finally {
            setIsRunning(false);
        }
    };

    const clearResults = () => {
        setTestResults(null);
        setLogs([]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PASSED': return '#4CAF50';
            case 'FAILED': return '#F44336';
            default: return '#FFC107';
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Admin Endpoint Testing</Text>
                <Text style={styles.subtitle}>
                    Comprehensive testing of all admin module endpoints
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.runButton]}
                    onPress={runTests}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Run Comprehensive Tests</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={clearResults}
                    disabled={isRunning}
                >
                    <Text style={styles.buttonText}>Clear Results</Text>
                </TouchableOpacity>
            </View>

            {testResults && (
                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>Test Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Passed:</Text>
                        <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                            {testResults.passed}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Failed:</Text>
                        <Text style={[styles.summaryValue, { color: '#F44336' }]}>
                            {testResults.failed}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total:</Text>
                        <Text style={styles.summaryValue}>{testResults.total}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Success Rate:</Text>
                        <Text style={styles.summaryValue}>
                            {testResults.successRate.toFixed(1)}%
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Duration:</Text>
                        <Text style={styles.summaryValue}>{testResults.duration}s</Text>
                    </View>
                </View>
            )}

            {testResults && Object.keys(testResults.workingEndpoints).length > 0 && (
                <View style={styles.workingEndpoints}>
                    <Text style={styles.sectionTitle}>Working Endpoints</Text>
                    {Object.entries(testResults.workingEndpoints).map(([test, endpoint]) => (
                        <View key={test} style={styles.endpointRow}>
                            <Text style={styles.testName}>{test}:</Text>
                            <Text style={styles.endpointUrl}>{endpoint}</Text>
                        </View>
                    ))}
                </View>
            )}

            {testResults && (
                <View style={styles.detailResults}>
                    <Text style={styles.sectionTitle}>Detailed Results</Text>
                    {testResults.details.map((result, index) => (
                        <View key={index} style={styles.resultRow}>
                            <View style={styles.resultHeader}>
                                <Text
                                    style={[
                                        styles.resultStatus,
                                        { color: getStatusColor(result.status) }
                                    ]}
                                >
                                    {result.status === 'PASSED' ? '✅' : '❌'} {result.test}
                                </Text>
                                {result.endpoint && (
                                    <Text style={styles.resultEndpoint}>
                                        {result.endpoint}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.resultDetails}>{result.details}</Text>
                        </View>
                    ))}
                </View>
            )}

            {logs.length > 0 && (
                <View style={styles.logs}>
                    <Text style={styles.sectionTitle}>Test Logs</Text>
                    {logs.slice(-20).map((log, index) => (
                        <Text key={index} style={styles.logMessage}>
                            {log.message}
                        </Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    runButton: {
        backgroundColor: '#2196F3',
    },
    clearButton: {
        backgroundColor: '#757575',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    summary: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    workingEndpoints: {
        backgroundColor: '#E8F5E8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    endpointRow: {
        marginBottom: 8,
    },
    testName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    endpointUrl: {
        fontSize: 12,
        color: '#4CAF50',
        fontFamily: 'monospace',
    },
    detailResults: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
    },
    resultRow: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    resultHeader: {
        marginBottom: 4,
    },
    resultStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    resultEndpoint: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    resultDetails: {
        fontSize: 14,
        color: '#666',
    },
    logs: {
        backgroundColor: '#263238',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    logMessage: {
        fontSize: 12,
        color: '#fff',
        fontFamily: 'monospace',
        marginBottom: 2,
    },
});

export default AdminEndpointTestScreen;
