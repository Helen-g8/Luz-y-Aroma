
 // Gestión de pedidos (solo admin): filtros, detalle, cambio de estado y eliminación.
import { iniciarNavbar } from "../ui/navbar.js";
import { protegerPagina } from "../services/auth.service.js";
import {
  obtenerTodosLosPedidos,
  cambiarEstadoPedido,
  eliminarPedido,
  ESTADOS,
  TRANSICIONES
} from "../services/pedidos.service.js";
import { contarPorEstado } from "../utils/indicadores.js";
import { normalizar } from "../utils/filtros.js";
import { numeroPedido, badgeEstado, detallePedidoHTML } from "../ui/pedido-detalle.js";
import { formatearMoneda, formatearFecha } from "../utils/formato.js";
import { escaparHTML } from "../utils/html.js";
import {
  mostrarCargando,
  mostrarVacio,
  mostrarError,
  mostrarToast,
  bloquearBoton
} from "../ui/alertas.js";

const contenido = document.getElementById("contenido");
const resumen = document.getElementById("resumen-pedidos");
const filtroEstado = document.getElementById("filtro-estado");
const buscador = document.getElementById("buscador");
const btnRecargar = document.getElementById("btn-recargar");
const tituloDetalle = document.getElementById("titulo-detalle");
const cuerpoDetalle = document.getElementById("cuerpo-detalle");
const numeroEliminar = document.getElementById("numero-eliminar");
const btnConfirmarEliminar = document.getElementById("btn-confirmar-eliminar");

const modalDetalle = new bootstrap.Modal("#modal-detalle");
const modalEliminar = new bootstrap.Modal("#modal-eliminar");

let pedidos = [];
let pedidoEliminando = null;

// Opciones del filtro con el conteo de cada estado: "Pendiente (3)".
function llenarFiltroEstado() {
  const seleccionado = filtroEstado.value;
  const conteo = contarPorEstado(pedidos);

  filtroEstado.innerHTML =
    `<option value="">Todos (${pedidos.length})</option>` +
    Object.entries(ESTADOS)
      .map(([clave, info]) =>
        `<option value="${clave}">${info.texto} (${conteo[clave]})</option>`
      )
      .join("");

  filtroEstado.value = seleccionado;
}

function filtrarPedidos() {
  const texto = normalizar(buscador.value);

  return pedidos
    .filter((p) => !filtroEstado.value || p.estado === filtroEstado.value)
    .filter((p) =>
      !texto ||
      normalizar(p.clienteNombre).includes(texto) ||
      normalizar(p.clienteEmail).includes(texto) ||
      normalizar(numeroPedido(p.id)).includes(texto)
    );
}

function accionesHTML(pedido) {
  const siguientes = TRANSICIONES[pedido.estado] ?? [];
  const numero = numeroPedido(pedido.id);

  if (siguientes.length > 0) {
    const opciones = siguientes
      .map((e) => `<option value="${e}">${ESTADOS[e].texto}</option>`)
      .join("");

    return `
      <div class="d-flex gap-1">
        <select
          class="form-select form-select-sm"
          data-select="${pedido.id}"
          aria-label="Nuevo estado del pedido ${numero}"
        >
          <option value="">Cambiar a...</option>
          ${opciones}
        </select>
        <button
          type="button"
          class="btn btn-sm btn-ambar"
          data-accion="actualizar"
          data-id="${pedido.id}"
        >OK</button>
      </div>`;
  }

  if (pedido.estado === "cancelado") {
    return `
      <button
        type="button"
        class="btn btn-sm btn-outline-danger"
        data-accion="eliminar"
        data-id="${pedido.id}"
        aria-label="Eliminar pedido ${numero}"
      >
        <i class="bi bi-trash" aria-hidden="true"></i> Eliminar
      </button>`;
  }

  return `<span class="text-muted small">Finalizado</span>`;
}

function filaHTML(pedido) {
  const articulos = pedido.items.reduce(
    (suma, i) => suma + i.cantidad, 0
  );

  return `
    <tr>
      <td>
        <button
          type="button"
          class="btn btn-link p-0 fw-bold"
          data-accion="ver"
          data-id="${pedido.id}"
        >
          #${numeroPedido(pedido.id)}
        </button>
      </td>
      <td class="small">${formatearFecha(pedido.creadoEn)}</td>
      <td>
        ${escaparHTML(pedido.clienteNombre)}
        <div class="small text-muted">
          ${escaparHTML(pedido.clienteEmail ?? "")}
        </div>
      </td>
      <td class="text-center">${articulos}</td>
      <td class="text-end">${formatearMoneda(pedido.total)}</td>
      <td>${badgeEstado(pedido.estado)}</td>
      <td>${accionesHTML(pedido)}</td>
    </tr>`;
}

function pintar() {
  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente"
  ).length;

  resumen.textContent =
    `${pedidos.length} pedidos · ${pendientes} pendientes`;

  llenarFiltroEstado();

  if (pedidos.length === 0) {
    mostrarVacio(
      contenido,
      "Todavía no hay pedidos.",
      "bi-receipt"
    );
    return;
  }

  const lista = filtrarPedidos();

  if (lista.length === 0) {
    mostrarVacio(
      contenido,
      "Ningún pedido coincide con los filtros.",
      "bi-funnel"
    );
    return;
  }

  contenido.innerHTML = `
    <div class="table-responsive tarjeta">
      <table class="table table-hover align-middle mb-0">
        <caption class="visually-hidden">Lista de pedidos</caption>
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Fecha</th>
            <th scope="col">Cliente</th>
            <th scope="col" class="text-center">Artículos</th>
            <th scope="col" class="text-end">Total</th>
            <th scope="col">Estado</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>${lista.map(filaHTML).join("")}</tbody>
      </table>
    </div>`;
}

async function cargar() {
  mostrarCargando(contenido, "Cargando pedidos...");

  try {
    pedidos = await obtenerTodosLosPedidos();
    pintar();
  } catch (error) {
    mostrarError(contenido, error.message, cargar);
  }
}

// ---------- Eventos ----------

filtroEstado.addEventListener("change", pintar);
buscador.addEventListener("input", pintar);
btnRecargar.addEventListener("click", cargar);

contenido.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-accion]");

  if (!boton) return;

  const pedido = pedidos.find(
    (p) => p.id === boton.dataset.id
  );

  if (!pedido) return;

  if (boton.dataset.accion === "ver") {
    tituloDetalle.textContent =
      `Pedido #${numeroPedido(pedido.id)} · ${pedido.clienteNombre}`;

    cuerpoDetalle.innerHTML = `
      <p class="mb-3">
        ${badgeEstado(pedido.estado)}
        <span class="small text-muted ms-2">
          Creado: ${formatearFecha(pedido.creadoEn)}
        </span>
      </p>
      ${detallePedidoHTML(pedido)}`;

    modalDetalle.show();
  }

  if (boton.dataset.accion === "actualizar") {
    const select = contenido.querySelector(
      `select[data-select="${pedido.id}"]`
    );

    if (!select.value) {
      mostrarToast(
        "Elige el nuevo estado del pedido.",
        "error"
      );
      select.focus();
      return;
    }

    bloquearBoton(boton, true, "");

    try {
      await cambiarEstadoPedido(
        pedido.id,
        select.value
      );

      const extra = select.value === "cancelado"
        ? " Se devolvió el stock de las velas."
        : "";

      mostrarToast(
        `Pedido #${numeroPedido(pedido.id)}: ${ESTADOS[select.value].texto}.${extra}`
      );

      await cargar();
    } catch (error) {
      mostrarToast(error.message, "error");
      bloquearBoton(boton, false);
    }
  }

  if (boton.dataset.accion === "eliminar") {
    pedidoEliminando = pedido;
    numeroEliminar.textContent =
      `#${numeroPedido(pedido.id)}`;
    modalEliminar.show();
  }
});

btnConfirmarEliminar.addEventListener("click", async () => {
  bloquearBoton(
    btnConfirmarEliminar,
    true,
    "Eliminando..."
  );

  try {
    await eliminarPedido(pedidoEliminando);
    mostrarToast("Pedido eliminado.");
    modalEliminar.hide();
    await cargar();
  } catch (error) {
    mostrarToast(error.message, "error");
  } finally {
    bloquearBoton(
      btnConfirmarEliminar,
      false
    );
  }
});

// ---------- Inicio ----------

iniciarNavbar();
mostrarCargando(contenido, "Verificando permisos...");
await protegerPagina("admin");
cargar();
