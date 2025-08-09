// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFyDeqmRvrVaunGTAS3Wb3_pmxABN-ReU",
  authDomain: "alarm-project-3d9b3.firebaseapp.com",
  projectId: "alarm-project-3d9b3",
  storageBucket: "alarm-project-3d9b3.firebasestorage.app",
  messagingSenderId: "1097820826450",
  appId: "1:1097820826450:web:18abdedd9078d70011288b",
  measurementId: "G-6EQPPCT9ZT"
};

const app = initializeApp(firebaseConfig);

// ✅ Initialize auth (will use default persistence)
const auth = getAuth(app);

export { auth };

