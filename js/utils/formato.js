// Formatos de presentación compartidos: dinero, fechas y redondeo.

export function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// Acepta un Timestamp de Firestore, un Date o nada.
export function formatearFecha(valor) {
  if (!valor) return "—";
  const fecha = typeof valor.toDate === "function" ? valor.toDate() : new Date(valor);
  return fecha.toLocaleString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Redondea a 2 decimales para evitar errores como 0.1 + 0.2 = 0.30000000000000004
export function redondear(numero) {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}
