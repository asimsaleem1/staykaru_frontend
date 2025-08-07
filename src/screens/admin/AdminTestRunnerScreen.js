import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const AdminTestRunnerScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState({});
  const [running, setRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState('idle');

  const testCases = [
    // Navigation Tests
    {
      id: 'navigation_test',
      name: 'Navigation Test',
      description: 'Test all admin screens are accessible',
      type: 'navigation',
      endpoints: [
        'Dashboard',
        'UserManagement', 
        'AccommodationManagement',
        'FoodServiceManagement',
        'BookingManagement',
        'OrderManagement',
        'FinancialManagement',
        'ContentModeration',
        'SystemAdministration',
        'ExportReports',
        'NotificationManagement',
        'AdminProfile'
      ]
    },
    // API Tests
    {
      id: 'dashboard_api',
      name: 'Dashboard API',
      description: 'Test dashboard endpoint',
      type: 'api',
      endpoint: '/dashboard',
      method: 'GET'
    },
    {
      id: 'users_api',
      name: 'Users API',
      description: 'Test users endpoint',
      type: 'api',
      endpoint: '/admin/users',
      method: 'GET'
    },
    {
      id: 'accommodations_api',
      name: 'Accommodations API',
      description: 'Test accommodations endpoint',
      type: 'api',
      endpoint: '/admin/accommodations',
      method: 'GET'
    },
    {
      id: 'food_providers_api',
      name: 'Food Providers API',
      description: 'Test food providers endpoint',
      type: 'api',
      endpoint: '/admin/food-providers',
      method: 'GET'
    },
    {
      id: 'analytics_users_api',
      name: 'User Analytics API',
      description: 'Test user analytics endpoint',
      type: 'api',
      endpoint: '/admin/analytics/users',
      method: 'GET'
    },
    {
      id: 'analytics_performance_api',
      name: 'Performance Analytics API',
      description: 'Test performance analytics endpoint',
      type: 'api',
      endpoint: '/admin/analytics/performance',
      method: 'GET'
    },
    {
      id: 'system_health_api',
      name: 'System Health API',
      description: 'Test system health endpoint',
      type: 'api',
      endpoint: '/admin/system/health',
      method: 'GET'
    },
    {
      id: 'notifications_api',
      name: 'Notifications API',
      description: 'Test notifications endpoint',
      type: 'api',
      endpoint: '/admin/notifications',
      method: 'GET'
    },
    {
      id: 'reports_api',
      name: 'Reports API',
      description: 'Test reports endpoint',
      type: 'api',
      endpoint: '/admin/reports',
      method: 'GET'
    }
  ];

  const runNavigationTest = async (testCase) => {
    const results = {};
    
    for (const screen of testCase.endpoints) {
      try {
        // Test if screen exists in navigation
        const screenExists = navigation.getState().routeNames.includes(screen);
        results[screen] = {
          status: screenExists ? 'success' : 'error',
          message: screenExists ? 'Screen accessible' : 'Screen not found',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        results[screen] = {
          status: 'error',
          message: `Navigation error: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return results;
  };

  const runApiTest = async (testCase) => {
    try {
      const response = await adminApiService.testEndpoint(testCase.endpoint, testCase.method);
      return {
        status: 'success',
        message: `API responded successfully (${response.status})`,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `API error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setOverallStatus('running');
    const results = {};

    for (const testCase of testCases) {
      try {
        if (testCase.type === 'navigation') {
          results[testCase.id] = await runNavigationTest(testCase);
        } else if (testCase.type === 'api') {
          results[testCase.id] = await runApiTest(testCase);
        }
      } catch (error) {
        results[testCase.id] = {
          status: 'error',
          message: `Test failed: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    }

    setTestResults(results);
    setRunning(false);
    
    // Calculate overall status
    const allResults = Object.values(results).flat();
    const successCount = allResults.filter(r => r.status === 'success').length;
    const totalCount = allResults.length;
    
    if (successCount === totalCount) {
      setOverallStatus('success');
    } else if (successCount > 0) {
      setOverallStatus('partial');
    } else {
      setOverallStatus('failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#34C759';
      case 'error': return '#FF3B30';
      case 'running': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'success': return '#34C759';
      case 'partial': return '#FF9500';
      case 'failed': return '#FF3B30';
      case 'running': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const renderTestResult = (testCase, result) => {
    if (testCase.type === 'navigation') {
      return (
        <View style={styles.navigationTestResult}>
          {Object.entries(result).map(([screen, screenResult]) => (
            <View key={screen} style={styles.screenTest}>
              <Ionicons 
                name={screenResult.status === 'success' ? 'checkmark-circle' : 'close-circle'} 
                size={16} 
                color={getStatusColor(screenResult.status)} 
              />
              <Text style={styles.screenName}>{screen}</Text>
              <Text style={styles.screenStatus}>{screenResult.message}</Text>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.apiTestResult}>
          <Ionicons 
            name={result.status === 'success' ? 'checkmark-circle' : 'close-circle'} 
            size={20} 
            color={getStatusColor(result.status)} 
          />
          <Text style={styles.apiMessage}>{result.message}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Test Runner</Text>
          <Text style={styles.subtitle}>Comprehensive testing for all admin functionality</Text>
        </View>

        {/* Overall Status */}
        <View style={[styles.statusCard, { backgroundColor: getOverallStatusColor() + '20' }]}>
          <Text style={styles.statusTitle}>Overall Status</Text>
          <Text style={[styles.statusText, { color: getOverallStatusColor() }]}>
            {overallStatus.toUpperCase()}
          </Text>
        </View>

        {/* Run Tests Button */}
        <TouchableOpacity 
          style={[styles.runButton, running && styles.runButtonDisabled]} 
          onPress={runAllTests}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="play" size={20} color="#fff" />
          )}
          <Text style={styles.runButtonText}>
            {running ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {testCases.map(testCase => (
              <View key={testCase.id} style={styles.testCase}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>{testCase.name}</Text>
                  {testResults[testCase.id] && (
                    <Ionicons 
                      name={testResults[testCase.id].status === 'success' ? 'checkmark-circle' : 'close-circle'} 
                      size={20} 
                      color={getStatusColor(testResults[testCase.id].status)} 
                    />
                  )}
                </View>
                <Text style={styles.testDescription}>{testCase.description}</Text>
                {testResults[testCase.id] && renderTestResult(testCase, testResults[testCase.id])}
              </View>
            ))}
          </View>
        )}

        {/* Quick Navigation Test */}
        <View style={styles.quickTestSection}>
          <Text style={styles.quickTestTitle}>Quick Navigation Test</Text>
          <Text style={styles.quickTestDescription}>
            Test navigation to all admin screens
          </Text>
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => {
              const screens = testCases[0].endpoints;
              let currentIndex = 0;
              
              const navigateNext = () => {
                if (currentIndex < screens.length) {
                  navigation.navigate(screens[currentIndex]);
                  currentIndex++;
                  setTimeout(navigateNext, 1000);
                } else {
                  navigation.navigate('AdminTestRunner');
                  Alert.alert('Navigation Test Complete', 'All screens were navigated successfully!');
                }
              };
              
              navigateNext();
            }}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.quickTestButtonText}>Test Navigation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { padding: 16 },
  header: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.8 },
  statusCard: { 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    alignItems: 'center' 
  },
  statusTitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  statusText: { fontSize: 18, fontWeight: 'bold' },
  runButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderRadius: 12, 
    justifyContent: 'center',
    marginBottom: 16
  },
  runButtonDisabled: { opacity: 0.6 },
  runButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  resultsSection: { marginBottom: 16 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  testCase: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    elevation: 2
  },
  testHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8
  },
  testName: { fontSize: 16, fontWeight: 'bold' },
  testDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  navigationTestResult: { marginTop: 8 },
  screenTest: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  screenName: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 8, 
    flex: 1 
  },
  screenStatus: { fontSize: 12, color: '#666' },
  apiTestResult: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8 
  },
  apiMessage: { fontSize: 14, marginLeft: 8, flex: 1 },
  quickTestSection: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16,
    elevation: 2
  },
  quickTestTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  quickTestDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  quickTestButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    padding: 12, 
    borderRadius: 8, 
    justifyContent: 'center'
  },
  quickTestButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
});

export default AdminTestRunnerScreen; 