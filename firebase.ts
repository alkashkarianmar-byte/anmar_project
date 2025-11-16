

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgJCpjgP40Y2If0_MXKE4Xnb3NlTs44vo",
  authDomain: "anmar-project1.firebaseapp.com",
  projectId: "anmar-project1",
  storageBucket: "anmar-project1.firebasestorage.app",
  messagingSenderId: "753393249996",
  appId: "1:753393249996:web:1441989ba0403af860dc69",
  measurementId: "G-DV8E0WQR95"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const storage = firebase.storage();

export { db, storage };
