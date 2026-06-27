import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { updateProfile, signOut } from 'firebase/auth';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!displayName) {
      Alert.alert('Błąd', 'Imię nie może być puste!');
      return;
    }
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProfile(auth.currentUser, { displayName });
      Alert.alert('Sukces', 'Twoje imię zostało zaktualizowane.');
    } catch (error) {
      Alert.alert('Błąd', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    signOut(auth);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mój Profil</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Adres e-mail</Text>
        <TextInput 
          style={[styles.input, { color: '#64748b' }]} 
          value={auth.currentUser?.email || 'Zalogowano przez Google'} 
          editable={false}
        />

        <Text style={styles.label}>Wyświetlane Imię</Text>
        <TextInput 
          style={styles.input} 
          placeholder="np. Jan Kowalski"
          placeholderTextColor="#94a3b8"
          value={displayName} 
          onChangeText={setDisplayName}
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Zapisywanie...' : 'Zaktualizuj profil'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtnLarge} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Wyloguj się</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  header: { paddingTop: 40, marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
  },
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 5, textTransform: 'uppercase', fontWeight: 'bold' },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  btn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  logoutBtnLarge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  logoutBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});
