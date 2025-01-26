import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA_EPmwrAavGR1iVh3hmR4CJPSd2x-EPns",
    authDomain: "madrocket-student.firebaseapp.com",
    projectId: "madrocket-student",
    storageBucket: "madrocket-student.firebasestorage.app",
    messagingSenderId: "831189533469",
    appId: "1:831189533469:web:d584050c98b0b67446d7f4",
    measurementId: "G-D4MJK3VPCL"
  };

const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
