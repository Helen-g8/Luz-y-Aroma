// Servicio de autenticación: registro, inicio y cierre de sesión,
// perfil con rol y protección de páginas por rol.
import { auth, db } from "../config/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Raíz del sitio calculada desde este archivo (js/services/ → ../../).
// Así los enlaces funcionan igual desde index.html que desde admin/*.html.
const RAIZ = new URL("../../", import.meta.url);

export function ruta(archivo) {
  return new URL(archivo, RAIZ).href;
}

function rutaActualRelativa() {
  return location.href.replace(RAIZ.href, "");
}

const MENSAJES_ERROR = {
  "auth/email-already-in-use": "Ese correo ya está registrado.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento e intenta de nuevo.",
  "auth/network-request-failed": "No hay conexión a internet."
};

export function traducirErrorAuth(error) {
  console.error(error);
  return MENSAJES_ERROR[error.code] ?? "Ocurrió un error. Intenta de nuevo.";
}

// Todo usuario nuevo se crea como "cliente". El rol "admin" solo se asigna
// a mano desde la consola de Firebase, y las reglas impiden cambiarlo desde la app.
export async function registrarUsuario(nombre, email, password) {
  const credencial = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credencial.user, { displayName: nombre });
  await setDoc(doc(db, "usuarios", credencial.user.uid), {
    nombre,
    email,
    rol: "cliente",
    creadoEn: serverTimestamp()
  });
  return credencial.user;
}

export async function iniciarSesion(email, password) {
  const credencial = await signInWithEmailAndPassword(auth, email, password);
  const perfil = await obtenerPerfil(credencial.user.uid);
  return { user: credencial.user, perfil };
}

export async function cerrarSesion() {
  await signOut(auth);
  location.href = ruta("index.html");
}

export async function obtenerPerfil(uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

// Llama al callback cada vez que cambia la sesión, con el usuario y su rol (o null).
export function observarSesion(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    try {
      const perfil = await obtenerPerfil(user.uid);
      // Justo al registrarse el perfil puede tardar un instante en existir.
      callback(perfil ?? { uid: user.uid, email: user.email, nombre: user.displayName, rol: "cliente" });
    } catch (error) {
      console.error(error);
      callback(null);
    }
  });
}

// Devuelve (una sola vez) el usuario actual, o null si no hay sesión.
export function obtenerSesionActual() {
  return new Promise((resolve) => {
    const dejarDeObservar = observarSesion((usuario) => {
      dejarDeObservar();
      resolve(usuario);
    });
  });
}

// Se llama al inicio de las páginas privadas.
// Sin sesión → login; rol incorrecto → inicio. Si redirige, la promesa nunca se resuelve
// y el resto del código de la página no se ejecuta.
export async function protegerPagina(rolRequerido = null) {
  const usuario = await obtenerSesionActual();

  if (!usuario) {
    location.href = ruta(`login.html?volver=${encodeURIComponent(rutaActualRelativa())}`);
    return new Promise(() => {});
  }
  if (rolRequerido && usuario.rol !== rolRequerido) {
    location.href = ruta("index.html");
    return new Promise(() => {});
  }
  return usuario;
}

// Solo acepta rutas internas del sitio (evita redirigir a otra página web).
export function destinoVolver(volver) {
  if (!volver || /^[a-z]+:|^\/\//i.test(volver)) return null;
  return ruta(volver);
}
