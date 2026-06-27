import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Konfiguracja dostarczona dla projektu webapps-studia
const firebaseConfig = {
  apiKey: "AIzaSyD-qfYc37gM_SKYbHlftSz50rSgeDlYHMI",
  authDomain: "webapps-studia.firebaseapp.com",
  projectId: "webapps-studia",
  storageBucket: "webapps-studia.firebasestorage.app",
  messagingSenderId: "905816275862",
  appId: "1:905816275862:web:8893a00dce02ecf6d03bb7",
  measurementId: "G-767HHGYM71"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
