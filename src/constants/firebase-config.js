import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyC7p3rNRSs-zRdT2A0-NLgQkAjBY-SRry8",
    authDomain: "moneytree-21bf7.firebaseapp.com",
    projectId: "moneytree-21bf7",
    storageBucket: "moneytree-21bf7.firebasestorage.app",
    messagingSenderId: "1030990939492",
    appId: "1:1030990939492:web:846ded9e34e1a4b841e671",
    measurementId: "G-FMKTNN6CTX"
};



const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
