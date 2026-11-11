// Convierte caracteres especiales en entidades HTML.
// Se usa SIEMPRE que un dato que escribió un usuario (nombre de vela, dirección, etc.)
// se mete dentro de innerHTML, para que no se pueda inyectar código.
export function escaparHTML(texto) {
  const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto ?? "").replace(/[&<>"']/g, (c) => reemplazos[c]);
}
