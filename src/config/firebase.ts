// Import the functions you need from the SDKs you need
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence is not typed correctly in all environments
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkA8tGHe3hE5hSjezwuGSi_eOUjby7cks",
  authDomain: "reto45-53dd8.firebaseapp.com",
  projectId: "reto45-53dd8",
  storageBucket: "reto45-53dd8.firebasestorage.app",
  messagingSenderId: "108156731958",
  appId: "1:108156731958:web:50fd3bcf3f93ab4e9d0e97",
  measurementId: "G-0RTFC0EP9R",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
// Only initialize analytics if it's supported (e.g., in a browser environment)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
export const db = getFirestore(app);
export const storage = getStorage(app);
