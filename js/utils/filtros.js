// Procesamiento de datos del catálogo: búsqueda, filtro y ordenamiento.
// Son funciones "puras": reciben una lista y devuelven una lista nueva sin modificar la original.

// Quita tildes y pasa a minúsculas para comparar ("Cítricos" → "citricos").
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function buscarPorNombre(lista, texto) {
  const busqueda = normalizar(texto);
  if (!busqueda) return lista;
  return lista.filter((p) =>
    normalizar(p.nombre).includes(busqueda) || normalizar(p.aroma).includes(busqueda)
  );
}

export function filtrarPorAroma(lista, aroma) {
  if (!aroma) return lista;
  return lista.filter((p) => p.aroma === aroma);
}

export function ordenarProductos(lista, criterio) {
  const copia = [...lista];
  switch (criterio) {
    case "precio-asc":
      return copia.sort((a, b) => a.precio - b.precio);
    case "precio-desc":
      return copia.sort((a, b) => b.precio - a.precio);
    case "nombre":
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    default:
      // "Disponibles primero": las agotadas al final y el resto por nombre.
      return copia.sort((a, b) =>
        (a.stock === 0) - (b.stock === 0) || a.nombre.localeCompare(b.nombre, "es")
      );
  }
}

// "Frutos rojos" → "frutos-rojos" (para la clase CSS del color de cada aroma).
export function slugAroma(aroma) {
  return normalizar(aroma).replace(/\s+/g, "-");
}
