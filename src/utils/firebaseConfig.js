import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "becca-24.firebaseapp.com",
  projectId: "becca-24",
  storageBucket: "becca-24.appspot.com",
  messagingSenderId: "61659824584",
  appId: "1:61659824584:web:77831a4c5335d4ef25c0fd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, auth, db, storage };
