import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '905816275862-avrbq5nmtgd5njjc0k47gj52gf4ceujo.apps.googleusercontent.com',
});

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('Brak tokena z Google Sign In');
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        alert("Błąd logowania Google: " + error.message);
      }
    }
  };

  const handleAuth = async () => {
    try {
      if (isRegister) {
        if (!displayName) {
          alert('Proszę podać swoje imię!');
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Błąd: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>WebApps Board</Text>
      <Text style={styles.subtitle}>
        Zaloguj się kontem Firebase,{'\n'}aby uzyskać JWT dla Rendera.
      </Text>

      <View style={styles.glassCard}>
        {isRegister && (
          <TextInput 
            style={styles.input} 
            placeholder="Twoje Imię (np. Jan Kowalski)" 
            placeholderTextColor="#94a3b8"
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}
        <TextInput 
          style={styles.input} 
          placeholder="E-mail" 
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Hasło" 
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleAuth}>
          <Text style={styles.btnText}>{isRegister ? 'Zarejestruj się' : 'Zaloguj się'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={{ marginTop: 15 }}>
          <Text style={styles.switchText}>
            {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
          </Text>
        </TouchableOpacity>

        {!isRegister && (
          <View style={{ marginTop: 25 }}>
            <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 15 }}>LUB</Text>
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
              <Text style={styles.googleBtnText}>Zaloguj przez Google</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btn: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    color: '#94a3b8',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  googleBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
