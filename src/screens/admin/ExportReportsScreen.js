import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const ExportReportsScreen = () => {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedReport, setSelectedReport] = useState('users');

  const exportData = async (type, format) => {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/export/${type}?format=${format}`);
      // Handle download response
      console.log(`Exporting ${type} in ${format} format`);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const reportTypes = [
    { id: 'users', name: 'User Data', icon: 'people', description: 'Export all user information' },
    { id: 'bookings', name: 'Booking Data', icon: 'calendar', description: 'Export all booking records' },
    { id: 'transactions', name: 'Transaction Data', icon: 'card', description: 'Export all financial transactions' },
    { id: 'accommodations', name: 'Accommodation Data', icon: 'home', description: 'Export all accommodation listings' },
    { id: 'orders', name: 'Order Data', icon: 'fast-food', description: 'Export all food orders' },
  ];

  const exportFormats = [
    { id: 'csv', name: 'CSV', icon: 'document-text' },
    { id: 'excel', name: 'Excel', icon: 'grid' },
    { id: 'pdf', name: 'PDF', icon: 'document' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Export & Reports</Text>
        </View>

        {/* Export Format Selection */}
        <View style={styles.formatCard}>
          <Text style={styles.cardTitle}>Export Format</Text>
          <View style={styles.formatRow}>
            {exportFormats.map(format => (
              <TouchableOpacity
                key={format.id}
                style={[styles.formatBtn, selectedFormat === format.id && styles.formatBtnActive]}
                onPress={() => setSelectedFormat(format.id)}
              >
                <Ionicons name={format.icon} size={24} color={selectedFormat === format.id ? '#fff' : COLORS.primary} />
                <Text style={[styles.formatText, selectedFormat === format.id && styles.formatTextActive]}>
                  {format.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Report Types */}
        <View style={styles.reportsCard}>
          <Text style={styles.cardTitle}>Available Reports</Text>
          {reportTypes.map(report => (
            <TouchableOpacity
              key={report.id}
              style={[styles.reportItem, selectedReport === report.id && styles.reportItemActive]}
              onPress={() => setSelectedReport(report.id)}
            >
              <Ionicons name={report.icon} size={24} color={COLORS.primary} />
              <View style={styles.reportInfo}>
                <Text style={styles.reportName}>{report.name}</Text>
                <Text style={styles.reportDescription}>{report.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Export Actions</Text>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => exportData(selectedReport, selectedFormat)}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download" size={20} color="#fff" />
            )}
            <Text style={styles.exportText}>
              {exporting ? 'Exporting...' : `Export ${selectedReport} as ${selectedFormat.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scheduled Reports */}
        <View style={styles.scheduledCard}>
          <Text style={styles.cardTitle}>Scheduled Reports</Text>
          <TouchableOpacity style={styles.scheduleBtn}>
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.scheduleText}>Schedule New Report</Text>
          </TouchableOpacity>
          <Text style={styles.scheduleInfo}>No scheduled reports</Text>
        </View>

        {/* Download History */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Download History</Text>
          <Text style={styles.historyInfo}>No recent downloads</Text>
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
  formatCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  formatRow: { flexDirection: 'row', justifyContent: 'space-between' },
  formatBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#F1F1F1', marginHorizontal: 4 },
  formatBtnActive: { backgroundColor: COLORS.primary },
  formatText: { marginTop: 4, color: COLORS.primary, fontWeight: 'bold' },
  formatTextActive: { color: '#fff' },
  reportsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  reportItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#F8F9FB', marginBottom: 8 },
  reportItemActive: { backgroundColor: COLORS.primary + '20' },
  reportInfo: { flex: 1, marginLeft: 12 },
  reportName: { fontWeight: 'bold', fontSize: 16 },
  reportDescription: { color: '#888', fontSize: 14 },
  actionsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, justifyContent: 'center' },
  exportText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  scheduledCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, padding: 12, borderRadius: 8, justifyContent: 'center', marginBottom: 8 },
  scheduleText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  scheduleInfo: { color: '#888', fontSize: 12 },
  historyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  historyInfo: { color: '#888', fontSize: 12 },
});

export default ExportReportsScreen; 