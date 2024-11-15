// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBkAhu9pxn-s0zhUOPA8E2Kj6ceczvXr60",
    authDomain: "orbenix-4ba59.firebaseapp.com",
    projectId: "orbenix-4ba59",
    storageBucket: "orbenix-4ba59.firebasestorage.app",
    messagingSenderId: "932771093971",
    appId: "1:932771093971:web:ec892e436e43d2d9e4e326",
    measurementId: "G-8YB2K0NTV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);