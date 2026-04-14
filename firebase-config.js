//check the quality contruction on behavior 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// If i can i think can be don't hardcode 
// Your web app's Firebase configuration
// Can upgrade a possible -- moving level up 
// Right now i don't completed the project all thing for my love
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0RFvbg0QWdBTmxnDQhdr7xdNuCm4hPyk",
  authDomain: "what-2-eat-today.firebaseapp.com",
  projectId: "what-2-eat-today",
  storageBucket: "what-2-eat-today.firebasestorage.app",
  messagingSenderId: "1097166772673",   
  appId: "1:1097166772673:web:4229f98a773b3a43e9b740",
  measurementId: "G-4B1QTDN6S3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export { app, analytics };
