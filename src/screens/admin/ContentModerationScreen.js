import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const ContentModerationScreen = () => {
  const [reportedContent, setReportedContent] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');

  const fetchReportedContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/content/reports`);
      const data = await res.json();
      setReportedContent(data?.reports || []);
    } catch (e) {
      setError('Failed to load reported content.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchReviewQueue = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/review-queue`);
      const data = await res.json();
      setReviewQueue(data?.queue || []);
    } catch {}
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/statistics`);
      const data = await res.json();
      setStatistics(data);
    } catch {}
  };

  useEffect(() => {
    fetchReportedContent();
    fetchReviewQueue();
    fetchStatistics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportedContent();
    fetchReviewQueue();
    fetchStatistics();
  };

  const openModal = (item) => {
    setSelected(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const approveContent = async (id) => {
    // Implement content approval logic
    fetchReportedContent();
    fetchReviewQueue();
    closeModal();
  };

  const rejectContent = async (id) => {
    // Implement content rejection logic
    fetchReportedContent();
    fetchReviewQueue();
    closeModal();
  };

  const renderReportedContent = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openModal(item)}>
      <Ionicons name="flag" size={28} color="#FF3B30" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.contentType}</Text>
        <Text style={styles.reason}>Reason: {item.reason}</Text>
        <Text style={styles.reporter}>Reported by: {item.reporterName}</Text>
        <Text style={styles.date}>{item.reportedAt}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  const renderReviewItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openModal(item)}>
      <Ionicons name="eye" size={28} color={COLORS.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.contentType}</Text>
        <Text style={styles.status}>{item.status}</Text>
        <Text style={styles.author}>Author: {item.authorName}</Text>
        <Text style={styles.date}>{item.createdAt}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Content...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchReportedContent} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Moderation</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
            onPress={() => setActiveTab('reports')}
          >
            <Text style={activeTab === 'reports' ? styles.tabTextActive : styles.tabText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'queue' && styles.tabActive]}
            onPress={() => setActiveTab('queue')}
          >
            <Text style={activeTab === 'queue' ? styles.tabTextActive : styles.tabText}>Review Queue</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={activeTab === 'reports' ? reportedContent : reviewQueue}
        keyExtractor={item => item._id}
        renderItem={activeTab === 'reports' ? renderReportedContent : renderReviewItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab} found.</Text>}
      />
      {/* Modal for details and actions */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          {selected && (
            <ScrollView style={styles.details}>
              <Text style={styles.detailTitle}>{selected.contentType}</Text>
              <Text style={styles.detailText}>Status: {selected.status}</Text>
              {selected.reason && <Text style={styles.detailText}>Reason: {selected.reason}</Text>}
              {selected.reporterName && <Text style={styles.detailText}>Reported by: {selected.reporterName}</Text>}
              {selected.authorName && <Text style={styles.detailText}>Author: {selected.authorName}</Text>}
              <Text style={styles.detailText}>Date: {selected.reportedAt || selected.createdAt}</Text>
              {/* Content Preview */}
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Content Preview</Text>
                <Text style={styles.contentText}>{selected.content || 'No content available'}</Text>
              </View>
              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => approveContent(selected._id)}>
                  <Ionicons name="checkmark-circle" size={22} color="#34C759" />
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => rejectContent(selected._id)}>
                  <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Moderation Statistics</Text>
        <Text>Total Reports: {statistics?.totalReports || 0}</Text>
        <Text>Pending Review: {statistics?.pendingReview || 0}</Text>
        <Text>Approved: {statistics?.approved || 0}</Text>
        <Text>Rejected: {statistics?.rejected || 0}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { padding: 16, backgroundColor: COLORS.primary, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tabRow: { flexDirection: 'row', marginTop: 8 },
  tab: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: '#fff', marginHorizontal: 4 },
  tabActive: { backgroundColor: COLORS.secondary },
  tabText: { color: COLORS.primary, textAlign: 'center' },
  tabTextActive: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 8, marginVertical: 4, padding: 12, borderRadius: 10, elevation: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  reason: { color: '#FF3B30', fontSize: 13 },
  reporter: { color: '#888', fontSize: 13 },
  status: { color: COLORS.secondary, fontSize: 13 },
  author: { color: '#888', fontSize: 13 },
  date: { color: '#888', fontSize: 13 },
  loadingText: { marginTop: 16, color: COLORS.primary, fontSize: 16 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 32 },
  retryBtn: { marginTop: 16, alignSelf: 'center', backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  closeBtn: { alignSelf: 'flex-end' },
  details: { marginTop: 24 },
  detailTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  detailText: { fontSize: 16, marginBottom: 4 },
  contentSection: { marginTop: 16 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  contentText: { backgroundColor: '#F1F1F1', padding: 12, borderRadius: 8 },
  actionRow: { flexDirection: 'row', marginTop: 16 },
  approveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#34C759', padding: 10, borderRadius: 8, marginRight: 8, flex: 1 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30', padding: 10, borderRadius: 8, flex: 1 },
  actionText: { marginLeft: 6, fontWeight: 'bold', color: '#fff' },
  statsSection: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12, elevation: 1 },
});

export default ContentModerationScreen; 