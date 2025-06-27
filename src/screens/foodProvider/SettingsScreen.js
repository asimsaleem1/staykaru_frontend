import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodProviderApiService.getSettings();
      setSettings(data.settings || data);
      setForm(data.settings || data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await foodProviderApiService.updateSettings(form);
      fetchSettings();
      Alert.alert('Settings updated successfully');
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restaurant Settings</Text>
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {settings && (
        <View>
          <Text style={styles.label}>Notifications</Text>
          <View style={styles.row}>
            <Text>Email</Text>
            <Switch
              value={form.notifications?.email || false}
              onValueChange={v => handleChange('notifications', { ...form.notifications, email: v })}
            />
          </View>
          <View style={styles.row}>
            <Text>Push</Text>
            <Switch
              value={form.notifications?.push || false}
              onValueChange={v => handleChange('notifications', { ...form.notifications, push: v })}
            />
          </View>
          <Text style={styles.label}>Delivery</Text>
          <View style={styles.row}>
            <Text>Delivery Radius (km):</Text>
            <Text>{form.delivery?.radius || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text>Delivery Fee:</Text>
            <Text>{form.delivery?.fee || 0}</Text>
          </View>
          <Text style={styles.label}>Privacy</Text>
          <View style={styles.row}>
            <Text>Show Restaurant Publicly</Text>
            <Switch
              value={form.privacy?.public || false}
              onValueChange={v => handleChange('privacy', { ...form.privacy, public: v })}
            />
          </View>
          <View style={{ marginTop: 24 }}>
            <Button title="Save Settings" onPress={handleSave} disabled={saving} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  loading: { fontSize: 16, color: '#888' },
  error: { color: 'red', marginBottom: 8 },
  label: { fontWeight: 'bold', marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
}); 