import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { styles } from '../styles';

export default function LoginScreen({
  apiBaseUrl,
  setApiBaseUrl,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onLogin,
  message
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Uslugar Mobile</Text>
      <Text style={styles.subtitle}>Prijava na postojeći backend</Text>

      <Text style={styles.label}>API base URL</Text>
      <TextInput
        value={apiBaseUrl}
        onChangeText={setApiBaseUrl}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://api.uslugar.eu"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="vas@email.com"
      />

      <Text style={styles.label}>Lozinka</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholder="••••••••"
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={onLogin}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Prijava</Text>}
      </Pressable>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}
