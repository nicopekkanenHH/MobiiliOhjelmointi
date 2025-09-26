import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyATH5_34BU3uVKhp_9s7-Jr_YCYvRA-1s0',
  authDomain: 'shoppingfirebase-b5492.firebaseapp.com',
  databaseURL: 'https://shoppingfirebase-b5492-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'shoppingfirebase-b5492',
  storageBucket: 'shoppingfirebase-b5492.appspot.com', // tärkeä: .appspot.com
  messagingSenderId: '796642279821',
  appId: '1:796642279821:web:b9e8f56ef50ef4a3fbfdc4',
  measurementId: 'G-C135JN8HH5',
};

// Alusta vain kerran (kestää Expo Fast Refreshin)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Viedään suoraan oikeaan RTDB-instanssiin
export const db = getDatabase(app, firebaseConfig.databaseURL);