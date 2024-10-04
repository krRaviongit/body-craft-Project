import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import Cookies from "js-cookie";
import { setDoc, doc, serverTimestamp, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useEffect } from "react";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1Cc2Hodemc9itDaYM4hKVWrl7fAuQzmI", // Replace with your actual API key
  authDomain: "ar-fitness3-e7cfb.firebaseapp.com",
  projectId: "ar-fitness3-e7cfb",
  storageBucket: "ar-fitness3-e7cfb.appspot.com",
  messagingSenderId: "785168326526", // Replace with your actual messaging sender ID
  appId: "1:785168326526:web:ebb95e9f00e7b5068d1d2f", // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Sign In with Google
export const signInWithGoogle = async () => {
  try {
    const googleProvider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, googleProvider);

    const accessToken = res.user.accessToken;
    Cookies.set("uat", accessToken);
    const uid = res.user.uid.toString();
    Cookies.set("userID", uid);

    const name = res.user.displayName;
    const email = res.user.email;
    const photo = res.user.photoURL;

    // Store user info in local storage
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("photo", photo);

    // Save user data to Firestore
    const docRef = doc(db, "user", uid);
    await setDoc(docRef, {
      userID: uid,
      timeStamp: serverTimestamp(),
      name: res.user.displayName,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// Logout Function
// Logout Function
export const logout = async () => {
  try {
    await signOut(auth); // Sign out from Firebase

    // Optionally clear Google session
    const googleProvider = new GoogleAuthProvider();
    const auth = getAuth();
    await auth.signOut(); // Ensure Google session is cleared

    localStorage.clear(); // Clear local storage

    // Clear all cookies
    Object.keys(Cookies.get()).forEach(function (cookieName) {
      Cookies.remove(cookieName); // Remove each cookie
    });

    console.log("User signed out and cookies cleared");
  } catch (error) {
    console.error("Error during sign out:", error);
  }
};


// Handle Login Function
export const handleLogin = async () => {
  await logout(); // Ensure user is logged out before logging in
  await signInWithGoogle(); // Now sign in with a different account
};

// Hook to Monitor Authentication State
export const useAuthListener = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        console.log("User is signed in:", user);
      } else {
        // User is signed out.
        console.log("User is signed out");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);
};
