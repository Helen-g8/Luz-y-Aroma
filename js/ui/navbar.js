// Barra de navegación generada con JavaScript según la sesión y el rol.

import { observarSesion, cerrarSesion, ruta } from "../services/auth.service.js";
import { escaparHTML } from "../utils/html.js";

// Misma clave que usa js/services/carrito.service.js
const CLAVE_CARRITO = "carrito_luz_y_aroma";

function contarCarrito() {
  try {
    const items = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? [];
    return items.reduce((suma, item) => suma + item.cantidad, 0);
  } catch {
    return 0;
  }
}

function esPaginaActual(archivo) {
  let actual = location.pathname;
  if (actual.endsWith("/")) actual += "index.html";
  return new URL(ruta(archivo)).pathname === actual;
}

function enlace(archivo, texto, icono, extra = "") {
  const activo = esPaginaActual(archivo);
  return `
    <li class="nav-item">
      <a class="nav-link${activo ? " active" : ""}" href="${ruta(archivo)}"${activo ? ' aria-current="page"' : ""}>
        <i class="bi ${icono}" aria-hidden="true"></i> ${texto}${extra}
      </a>
    </li>`;
}

function enlaceCarrito() {
  const total = contarCarrito();
  const badge = `<span class="badge rounded-pill text-bg-warning ms-1" id="contador-carrito" aria-label="${total} artículos">${total}</span>`;
  return enlace("carrito.html", "Carrito", "bi-bag", badge);
}

function itemsMenu(usuario) {
  if (usuario === undefined) return ""; // todavía no se sabe si hay sesión

  if (!usuario) {
    return `
      ${enlace("index.html", "Catálogo", "bi-shop")}
      ${enlaceCarrito()}
      ${enlace("login.html", "Iniciar sesión", "bi-box-arrow-in-right")}
      <li class="nav-item"><a class="btn btn-ambar btn-sm ms-lg-2" href="${ruta("registro.html")}">Registrarse</a></li>`;
  }

  const salir = `
    <li class="nav-item d-flex align-items-center ms-lg-2">
      <span class="navbar-text small me-2">Hola, ${escaparHTML(usuario.nombre ?? usuario.email)}</span>
      <button type="button" class="btn btn-outline-light btn-sm" id="btn-salir">
        <i class="bi bi-box-arrow-right" aria-hidden="true"></i> Salir
      </button>
    </li>`;

  if (usuario.rol === "admin") {
    return `
      ${enlace("admin/dashboard.html", "Panel", "bi-speedometer2")}
      ${enlace("admin/productos.html", "Velas", "bi-box-seam")}
      ${enlace("admin/pedidos.html", "Pedidos", "bi-receipt")}
      ${enlace("index.html", "Ver tienda", "bi-shop")}
      ${salir}`;
  }

  return `
    ${enlace("index.html", "Catálogo", "bi-shop")}
    ${enlaceCarrito()}
    ${enlace("mis-pedidos.html", "Mis pedidos", "bi-receipt")}
    ${salir}`;
}

function pintar(header, usuario) {
  header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-luz" aria-label="Navegación principal">
      <div class="container">
        <a class="navbar-brand" href="${ruta("index.html")}">
          <img src="${ruta("img/logo.png")}" alt="" class="logo-nav"> Luz y Aroma
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal"
                aria-controls="menu-principal" aria-expanded="false" aria-label="Abrir menú">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu-principal">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            ${itemsMenu(usuario)}
          </ul>
        </div>
      </div>
    </nav>`;

  header.querySelector("#btn-salir")?.addEventListener("click", async (evento) => {
    evento.currentTarget.disabled = true;
    await cerrarSesion();
  });
}

function actualizarContador() {
  const badge = document.getElementById("contador-carrito");
  if (badge) {
    const total = contarCarrito();
    badge.textContent = total;
    badge.setAttribute("aria-label", `${total} artículos`);
  }
}

// Pone el logo como ícono de la pestaña en todas las páginas.
function ponerFavicon() {
  if (document.querySelector('link[rel="icon"]')) return;
  const icono = document.createElement("link");
  icono.rel = "icon";
  icono.type = "image/png";
  icono.href = ruta("img/logo.png");
  document.head.appendChild(icono);
}

export function iniciarNavbar() {
  const header = document.getElementById("navbar");
  if (!header) return;

  ponerFavicon();

  pintar(header, undefined);
  observarSesion((usuario) => pintar(header, usuario));

  // carrito.service.js lanza este evento cada vez que cambia el carrito
  window.addEventListener("carrito-actualizado", actualizarContador);
  // si el carrito cambia en otra pestaña
  window.addEventListener("storage", actualizarContador);
}