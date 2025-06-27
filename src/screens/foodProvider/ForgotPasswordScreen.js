import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleForgot = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Request failed');
      }
      setSuccess(true);
      Alert.alert('Password reset link sent to your email');
      navigation && navigation.goBack && navigation.goBack();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>Check your email for reset instructions.</Text>}
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Button title={loading ? 'Sending...' : 'Send Reset Link'} onPress={handleForgot} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' },
  success: { color: 'green', marginBottom: 8, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 8, marginBottom: 8 },
}); 