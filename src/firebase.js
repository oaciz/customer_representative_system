import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCyUpj3xzAs_pfCgVgA9LReHI3nI4CXW14",
  authDomain: "fir-c81a6.firebaseapp.com",
  projectId: "fir-c81a6",
  storageBucket: "fir-c81a6.firebasestorage.app",
  messagingSenderId: "38811911022",
  appId: "1:38811911022:web:628ff02055d74f50a6b77f",
  measurementId: "G-LBK5K837HC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db };