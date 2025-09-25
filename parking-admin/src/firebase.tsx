import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrw4EDY4LCcxCoPhzoCL5bJPd9uW80Pf8",
  authDomain: "cpe-681022.firebaseapp.com",
  projectId: "cpe-681022",
  storageBucket: "cpe-681022.firebasestorage.app",
  messagingSenderId: "906244934774",
  appId: "1:906244934774:web:dc6c0facbee5f4dbec6357",
  measurementId: "G-MDJRWL52Z3"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
