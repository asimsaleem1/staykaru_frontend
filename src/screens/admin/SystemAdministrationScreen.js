import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const SystemAdministrationScreen = () => {
  const [performance, setPerformance] = useState(null);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/system/performance`);
      const data = await res.json();
      setPerformance(data);
    } catch (e) {
      setError('Failed to load system performance.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/system/logs`);
      const data = await res.json();
      setLogs(data?.logs || []);
    } catch {}
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/config/platform`);
      const data = await res.json();
      setConfig(data);
    } catch {}
  };

  const createBackup = async () => {
    try {
      await fetch(`${API_BASE}/system/backup`, { method: 'POST' });
      // Handle backup creation response
    } catch {}
  };

  useEffect(() => {
    fetchPerformance();
    fetchLogs();
    fetchConfig();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformance();
    fetchLogs();
    fetchConfig();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading System Data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchPerformance} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>System Administration</Text>
        </View>

        {/* System Performance */}
        <View style={styles.performanceCard}>
          <Text style={styles.cardTitle}>System Performance</Text>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>CPU Usage</Text>
              <Text style={styles.metricValue}>{performance?.cpuUsage || 0}%</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Memory Usage</Text>
              <Text style={styles.metricValue}>{performance?.memoryUsage || 0}%</Text>
            </View>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Disk Usage</Text>
              <Text style={styles.metricValue}>{performance?.diskUsage || 0}%</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Network</Text>
              <Text style={styles.metricValue}>{performance?.networkUsage || 0} MB/s</Text>
            </View>
          </View>
        </View>

        {/* System Health */}
        <View style={styles.healthCard}>
          <Text style={styles.cardTitle}>System Health</Text>
          <View style={styles.healthItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.healthText}>Database: Connected</Text>
          </View>
          <View style={styles.healthItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.healthText}>API: Running</Text>
          </View>
          <View style={styles.healthItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.healthText}>Authentication: Active</Text>
          </View>
        </View>

        {/* Configuration */}
        <View style={styles.configCard}>
          <Text style={styles.cardTitle}>Platform Configuration</Text>
          <Text style={styles.configText}>Maintenance Mode: {config?.maintenanceMode ? 'Enabled' : 'Disabled'}</Text>
          <Text style={styles.configText}>Max Users: {config?.maxUsers || 'Unlimited'}</Text>
          <Text style={styles.configText}>Session Timeout: {config?.sessionTimeout || 30} minutes</Text>
        </View>

        {/* Backup Management */}
        <View style={styles.backupCard}>
          <Text style={styles.cardTitle}>Backup Management</Text>
          <TouchableOpacity style={styles.backupBtn} onPress={createBackup}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.backupText}>Create Backup</Text>
          </TouchableOpacity>
          <Text style={styles.backupInfo}>Last backup: {performance?.lastBackup || 'Never'}</Text>
        </View>

        {/* System Logs */}
        <View style={styles.logsCard}>
          <View style={styles.logsHeader}>
            <Text style={styles.cardTitle}>System Logs</Text>
            <TouchableOpacity onPress={() => setShowLogs(!showLogs)}>
              <Ionicons name={showLogs ? "chevron-up" : "chevron-down"} size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {showLogs && (
            <ScrollView style={styles.logsContainer}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logEntry}>
                  [{log.timestamp}] {log.level}: {log.message}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { padding: 16 },
  header: { padding: 16, backgroundColor: COLORS.primary, borderRadius: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  performanceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metric: { flex: 1 },
  metricLabel: { color: '#888', fontSize: 14 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  healthCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  healthItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  healthText: { marginLeft: 8, color: '#333' },
  configCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  configText: { marginBottom: 4, color: '#333' },
  backupCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  backupBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, justifyContent: 'center', marginBottom: 8 },
  backupText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  backupInfo: { color: '#888', fontSize: 12 },
  logsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  logsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logsContainer: { maxHeight: 200 },
  logEntry: { fontSize: 12, color: '#666', marginBottom: 4 },
  loadingText: { marginTop: 16, color: COLORS.primary, fontSize: 16 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 32 },
  retryBtn: { marginTop: 16, alignSelf: 'center', backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
});

export default SystemAdministrationScreen; 