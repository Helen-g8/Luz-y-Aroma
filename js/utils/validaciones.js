// Reglas de validación del formulario de velas.
// Devuelve un objeto { campo: "mensaje" }. Si está vacío, los datos son válidos.
// Las reglas de Firestore son la segunda barrera; esta es la primera (y la que ve el usuario).
import { AROMAS, TAMANOS } from "../services/productos.service.js";

const PRECIO_REGEX = /^\d+(\.\d{1,2})?$/;
const URL_REGEX = /^https?:\/\/\S+$/i;

export function validarProducto(datos) {
  const errores = {};
  const nombre = (datos.nombre ?? "").trim();

  if (nombre.length < 3 || nombre.length > 60) {
    errores.nombre = "El nombre debe tener entre 3 y 60 caracteres.";
  }

  if ((datos.descripcion ?? "").length > 300) {
    errores.descripcion = "La descripción no puede pasar de 300 caracteres.";
  }

  if (!AROMAS.includes(datos.aroma)) {
    errores.aroma = "Elige un aroma de la lista.";
  }

  if (!Object.hasOwn(TAMANOS, datos.tamano ?? "")) {
    errores.tamano = "Elige un tamaño.";
  }

  if (!Number.isFinite(datos.precio) || datos.precio <= 0 || datos.precio > 100) {
    errores.precio = "El precio debe ser mayor que $0 y máximo $100.";
  } else if (!PRECIO_REGEX.test(String(datos.precio))) {
    errores.precio = "El precio puede tener máximo 2 decimales.";
  }

  if (!Number.isInteger(datos.stock) || datos.stock < 0) {
    errores.stock = "El stock debe ser un número entero de 0 o más.";
  }

  if (datos.imagenUrl && !URL_REGEX.test(datos.imagenUrl)) {
    errores.imagenUrl = "La URL debe empezar con http:// o https://";
  }

  return errores;
}
