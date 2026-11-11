
 // Página del carrito: cantidades, totales con reglas de negocio y confirmación del pedido.
import { iniciarNavbar } from "../ui/navbar.js";
import { obtenerSesionActual, ruta } from "../services/auth.service.js";
import {
  obtenerCarrito,
  cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
  calcularTotales,
  validarEntrega
} from "../services/carrito.service.js";
import { crearPedido } from "../services/pedidos.service.js";
import { formatearMoneda } from "../utils/formato.js";
import { escaparHTML } from "../utils/html.js";
import { mostrarVacio, mostrarToast, bloquearBoton } from "../ui/alertas.js";
import { mostrarErrores } from "../ui/formularios.js";

const lista = document.getElementById("lista-carrito");
const columnaResumen = document.getElementById("columna-resumen");
const avisoEnvio = document.getElementById("aviso-envio");
const avisoSesion = document.getElementById("aviso-sesion");
const form = document.getElementById("form-entrega");
const btnConfirmar = document.getElementById("btn-confirmar");

let usuario = null;

function itemHTML(item) {
  const nombre = escaparHTML(item.nombre);

  return `
    <div class="tarjeta p-3 mb-3 d-flex flex-wrap align-items-center gap-3 carrito-item">
      <div class="flex-grow-1">
        <h2 class="h6 mb-1">${nombre}</h2>
        <p class="small text-muted mb-0">
          ${escaparHTML(item.aroma)} · ${formatearMoneda(item.precio)} c/u
        </p>
      </div>

      <div class="cantidad-control" role="group" aria-label="Cantidad de ${nombre}">
        <button
          type="button"
          class="btn btn-outline-secondary"
          data-accion="restar"
          data-id="${item.id}"
          aria-label="Quitar una unidad"
          ${item.cantidad <= 1 ? "disabled" : ""}
        >−</button>

        <span>${item.cantidad}</span>

        <button
          type="button"
          class="btn btn-outline-secondary"
          data-accion="sumar"
          data-id="${item.id}"
          aria-label="Agregar una unidad"
          ${item.cantidad >= item.stock ? "disabled" : ""}
        >+</button>
      </div>

      <strong class="text-nowrap">
        ${formatearMoneda(item.precio * item.cantidad)}
      </strong>

      <button
        type="button"
        class="btn btn-sm btn-outline-danger"
        data-accion="quitar"
        data-id="${item.id}"
        aria-label="Quitar ${nombre} del carrito"
      >
        <i class="bi bi-trash" aria-hidden="true"></i>
      </button>
    </div>`;
}

function pintarResumen(carrito) {
  const totales = calcularTotales(carrito);

  document.getElementById("subtotal").textContent =
    formatearMoneda(totales.subtotal);

  document.getElementById("envio").textContent =
    totales.envio === 0 ? "Gratis" : formatearMoneda(totales.envio);

  document.getElementById("total").textContent =
    formatearMoneda(totales.total);

  if (totales.faltaParaEnvioGratis > 0) {
    avisoEnvio.textContent =
      `Te faltan ${formatearMoneda(totales.faltaParaEnvioGratis)} para tener envío gratis.`;

    avisoEnvio.classList.remove("d-none");
  } else {
    avisoEnvio.classList.add("d-none");
  }
}

function pintar() {
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    lista.parentElement.className = "col-12";
    columnaResumen.classList.add("d-none");
    mostrarVacio(
      lista, "Tu carrito está vacío.", "bi-bag", { texto: "Ver catálogo", href: ruta("index.html") });
    return;
  }

  lista.parentElement.className = "col-lg-7"; // ← nueva: vuelve a las 2 columnas
  columnaResumen.classList.remove("d-none");
  lista.innerHTML = carrito.map(itemHTML).join("");
  pintarResumen(carrito);
}

// ---------- Eventos ----------
lista.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");

  if (!boton) return;

  const { accion, id } = boton.dataset;
  const item = obtenerCarrito().find((i) => i.id === id);

  if (!item) return;

  let resultado = { ok: true };

  if (accion === "sumar") {
    resultado = cambiarCantidad(id, item.cantidad + 1);
  }

  if (accion === "restar") {
    resultado = cambiarCantidad(id, item.cantidad - 1);
  }

  if (accion === "quitar") {
    quitarDelCarrito(id);
    mostrarToast(`${item.nombre} se quitó del carrito.`, "info");
  }

  if (!resultado.ok) {
    mostrarToast(resultado.mensaje, "error");
  }

  pintar();
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!usuario) {
    location.href = ruta("login.html?volver=carrito.html");
    return;
  }

  const entrega = {
    direccion: form.elements.direccion.value.trim(),
    telefono: form.elements.telefono.value.replace(/[\s-]/g, ""),
    notas: form.elements.notas.value.trim()
  };

  if (!mostrarErrores(form, validarEntrega(entrega))) {
    return;
  }

  bloquearBoton(btnConfirmar, true, "Confirmando pedido...");

  try {
    const idPedido = await crearPedido(
      obtenerCarrito(),
      entrega,
      usuario
    );

    vaciarCarrito();

    sessionStorage.setItem("pedido_nuevo", idPedido);

    location.href = ruta("mis-pedidos.html");
  } catch (error) {
    mostrarToast(error.message, "error");
    bloquearBoton(btnConfirmar, false);
  }
});

// ---------- Inicio ----------
iniciarNavbar();
pintar();

usuario = await obtenerSesionActual();

if (!usuario) {
  avisoSesion.classList.remove("d-none");
  btnConfirmar.textContent = "Inicia sesión para confirmar";
}
