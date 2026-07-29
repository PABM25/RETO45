// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
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
const analytics = getAnalytics(app);
