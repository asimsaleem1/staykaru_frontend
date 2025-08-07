import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function AddMenuItemScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', isAvailable: true, image: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let imageUrl = null;
      if (form.image) {
        const uploadRes = await foodProviderApiService.uploadImage(form.image, 'menu');
        imageUrl = uploadRes.url || uploadRes.imageUrl;
      }
      await foodProviderApiService.addMenuItem({ ...form, price: parseFloat(form.price), image: imageUrl });
      Alert.alert('Menu item added');
      navigation && navigation.goBack && navigation.goBack();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Menu Item</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={v => handleChange('name', v)} />
      <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={v => handleChange('description', v)} />
      <TextInput style={styles.input} placeholder="Category" value={form.category} onChangeText={v => handleChange('category', v)} />
      <TextInput style={styles.input} placeholder="Price" value={form.price} keyboardType="numeric" onChangeText={v => handleChange('price', v)} />
      <View style={styles.row}><Text>Available</Text><Switch value={form.isAvailable} onValueChange={v => handleChange('isAvailable', v)} /></View>
      <Button title="Pick Image" onPress={pickImage} />
      {form.image && <Text style={{ marginVertical: 8 }}>Image selected</Text>}
      <Button title="Save Item" onPress={handleSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  error: { color: 'red', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, justifyContent: 'space-between' },
}); 