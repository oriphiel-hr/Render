import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from '../styles';
import BrandHeader from '../components/BrandHeader';

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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <View style={styles.card}>
      <BrandHeader />
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
      <Pressable onPress={() => setShowPrivacyPolicy(true)} style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Politika privatnosti</Text>
      </Pressable>
      {!!message && <Text style={styles.message}>{message}</Text>}

      <Modal
        animationType="slide"
        transparent
        visible={showPrivacyPolicy}
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Politika privatnosti</Text>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                Aplikacija Uslugar koristi podatke koje korisnik sam unese kako bi omogucila prijavu, prikaz i
                upravljanje uslugama.
              </Text>
              <Text style={styles.modalText}>
                Ne prodajemo osobne podatke trecim stranama. Podaci se koriste iskljucivo za funkcionalnost aplikacije
                i korisnicku podrsku.
              </Text>
              <Text style={styles.modalText}>
                Ako imate pitanja o privatnosti ili zelite zatraziti brisanje podataka, javite se na:
                {'\n'}
                uslugar@oriphiel.hr
              </Text>
              <Text style={styles.modalText}>Datum zadnje izmjene: 27.04.2026.</Text>
            </ScrollView>
            <Pressable style={styles.buttonSecondary} onPress={() => setShowPrivacyPolicy(false)}>
              <Text style={styles.buttonText}>Zatvori</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
