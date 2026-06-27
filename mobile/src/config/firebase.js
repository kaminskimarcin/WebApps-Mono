import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-qfYc37gM_SKYbHlftSz50rSgeDlYHMI",
  authDomain: "webapps-studia.firebaseapp.com",
  projectId: "webapps-studia",
  storageBucket: "webapps-studia.firebasestorage.app",
  messagingSenderId: "905816275862",
  appId: "1:905816275862:web:21744cd5a9b8c447d03bb7",
  measurementId: "G-YWEFV7K1H2"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
