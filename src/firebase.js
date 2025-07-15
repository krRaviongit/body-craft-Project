import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import Cookies from "js-cookie";
import {
  setDoc,
  doc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useEffect } from "react";

// ✅ Firebase Configuration (your new correct project)
const firebaseConfig = {
  apiKey: "AIzaSyCNs5OfHLqskNp9MZhccbzu4FoQqg4MgIw",
  authDomain: "body-craft-auth.firebaseapp.com",
  projectId: "body-craft-auth",
  storageBucket: "body-craft-auth.appspot.com",
  messagingSenderId: "854116029509",
  appId: "1:854116029509:web:f624f051401e7e93093f2c",
  measurementId: "G-7EHF7SJK9L",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Sign In with Google
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

    // Save user info
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("photo", photo);

    // Store user in Firestore
    const docRef = doc(db, "user", uid);
    await setDoc(docRef, {
      userID: uid,
      timeStamp: serverTimestamp(),
      name: name,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// ✅ Logout Function
export const logout = async () => {
  try {
    await signOut(auth);

    localStorage.clear();

    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });

    console.log("User signed out and cookies cleared");
  } catch (error) {
    console.error("Error during sign out:", error);
  }
};

// ✅ Handle Login Again
export const handleLogin = async () => {
  await logout();
  await signInWithGoogle();
};

// ✅ Hook to Monitor Auth State
export const useAuthListener = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in:", user);
      } else {
        console.log("User is signed out");
      }
    });

    return () => unsubscribe();
  }, []);
};
