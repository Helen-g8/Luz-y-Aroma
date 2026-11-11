// Gestión de datos de la colección "productos" (las velas): CRUD completo.
import { db } from "../config/firebase.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const AROMAS = [
  "Lavanda", "Vainilla", "Canela", "Cítricos", "Eucalipto",
  "Rosa", "Coco", "Café", "Sándalo", "Frutos rojos"
];

export const TAMANOS = {
  pequena: "Pequeña",
  mediana: "Mediana",
  grande: "Grande"
};

const productosRef = collection(db, "productos");

function errorAmigable(error, mensaje) {
  console.error(error);
  if (error.code === "permission-denied") return new Error("No tienes permiso para hacer esta operación.");
  if (error.code === "unavailable") return new Error("Sin conexión con el servidor. Intenta de nuevo.");
  return new Error(mensaje);
}

export async function obtenerProductos() {
  try {
    const snap = await getDocs(productosRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw errorAmigable(error, "No se pudieron cargar las velas. Intenta de nuevo.");
  }
}

export async function obtenerProducto(id) {
  try {
    const snap = await getDoc(doc(db, "productos", id));
    if (!snap.exists()) throw new Error("La vela no existe.");
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    throw errorAmigable(error, "No se pudo cargar la vela.");
  }
}

export async function crearProducto(datos) {
  try {
    const nuevo = await addDoc(productosRef, {
      ...datos,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
    return nuevo.id;
  } catch (error) {
    throw errorAmigable(error, "No se pudo crear la vela.");
  }
}

export async function actualizarProducto(id, datos) {
  try {
    await updateDoc(doc(db, "productos", id), { ...datos, actualizadoEn: serverTimestamp() });
  } catch (error) {
    throw errorAmigable(error, "No se pudo actualizar la vela.");
  }
}

export async function eliminarProducto(id) {
  try {
    await deleteDoc(doc(db, "productos", id));
  } catch (error) {
    throw errorAmigable(error, "No se pudo eliminar la vela.");
  }
}

// Mostrar u ocultar una vela del catálogo sin borrarla.
export async function cambiarVisibilidad(id, activo) {
  await actualizarProducto(id, { activo });
}

// Carga varias velas de una sola vez (datos iniciales del proyecto).
export async function cargarDatosIniciales(velas) {
  try {
    const lote = writeBatch(db);
    velas.forEach((vela) => {
      lote.set(doc(productosRef), {
        ...vela,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
      });
    });
    await lote.commit();
  } catch (error) {
    throw errorAmigable(error, "No se pudieron cargar los datos iniciales.");
  }
}
