import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function FoodProviderProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodProviderApiService.getFoodProviderProfile();
      setProfile(data.profile || data);
      setForm(data.profile || data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await foodProviderApiService.updateFoodProviderProfile(form);
      setEditMode(false);
      fetchProfile();
      Alert.alert('Profile updated successfully');
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restaurant Profile</Text>
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {profile && (
        <View>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name || ''}
            editable={editMode}
            onChangeText={v => handleChange('name', v)}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={form.description || ''}
            editable={editMode}
            onChangeText={v => handleChange('description', v)}
          />
          <Text style={styles.label}>Cuisine Type</Text>
          <TextInput
            style={styles.input}
            value={form.cuisine_type || ''}
            editable={editMode}
            onChangeText={v => handleChange('cuisine_type', v)}
          />
          <Text style={styles.label}>Contact Email</Text>
          <TextInput
            style={styles.input}
            value={form.contact_info?.email || ''}
            editable={editMode}
            onChangeText={v => handleChange('contact_info', { ...form.contact_info, email: v })}
          />
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={form.contact_info?.phone || ''}
            editable={editMode}
            onChangeText={v => handleChange('contact_info', { ...form.contact_info, phone: v })}
          />
          <Text style={styles.label}>Operating Hours</Text>
          <TextInput
            style={styles.input}
            value={form.operating_hours?.open || ''}
            editable={editMode}
            placeholder="Open (e.g. 09:00)"
            onChangeText={v => handleChange('operating_hours', { ...form.operating_hours, open: v })}
          />
          <TextInput
            style={styles.input}
            value={form.operating_hours?.close || ''}
            editable={editMode}
            placeholder="Close (e.g. 22:00)"
            onChangeText={v => handleChange('operating_hours', { ...form.operating_hours, close: v })}
          />
          <Text style={styles.label}>Image Gallery</Text>
          <ScrollView horizontal style={{ marginBottom: 12 }}>
            {(form.images || []).map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.image} />
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            {!editMode && (
              <Button title="Edit" onPress={() => setEditMode(true)} />
            )}
            {editMode && (
              <>
                <Button title="Save" onPress={handleSave} disabled={saving} />
                <View style={{ width: 12 }} />
                <Button title="Cancel" onPress={() => { setEditMode(false); setForm(profile); }} />
              </>
            )}
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 4, marginBottom: 8 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
}); 