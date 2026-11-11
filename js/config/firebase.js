// Configuración de la plataforma: aquí se inicializa Firebase UNA sola vez y 
// se exportan los servicios que usa el resto de la aplicación.

// La apiKey de una app web de Firebase NO es un secreto: solo identifica el proyecto.
// Lo que protege los datos son las reglas de firestore.rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3CboWwM9zdbNsY0ukbDSjGOVJaoCc0E0",
  authDomain: "luz-y-aroma.firebaseapp.com",
  projectId: "luz-y-aroma",
  storageBucket: "luz-y-aroma.firebasestorage.app",
  messagingSenderId: "734326740103",
  appId: "1:734326740103:web:3d438c2b17a045e479d422"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
