import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJLR0gKSrzN3VCyZ74AeAFL82WuMI0Z0k",
  authDomain: "zenbaki-osoak-2dbh.firebaseapp.com",
  projectId: "zenbaki-osoak-2dbh",
  storageBucket: "zenbaki-osoak-2dbh.firebasestorage.app",
  messagingSenderId: "402362957412",
  appId: "1:402362957412:web:b89a1b9e802426ae74e971"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
