
 // Historial de pedidos del cliente que inició sesión.
import { iniciarNavbar } from "../ui/navbar.js";
import { protegerPagina, ruta } from "../services/auth.service.js";
import { obtenerPedidosDeCliente } from "../services/pedidos.service.js";
import { numeroPedido, badgeEstado, detallePedidoHTML } from "../ui/pedido-detalle.js";
import { formatearMoneda, formatearFecha } from "../utils/formato.js";
import { mostrarCargando, mostrarVacio, mostrarError } from "../ui/alertas.js";

const lista = document.getElementById("lista-pedidos");
const alerta = document.getElementById("alerta-pedido");

// Si viene de confirmar un pedido, carrito.js dejó el id aquí.
const pedidoNuevo = sessionStorage.getItem("pedido_nuevo");
sessionStorage.removeItem("pedido_nuevo");

let usuario = null;

function pedidoHTML(pedido) {
  const abierto = pedido.id === pedidoNuevo;
  const idPanel = `pedido-${pedido.id}`;

  return `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button ${abierto ? "" : "collapsed"}"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#${idPanel}"
                aria-expanded="${abierto}"
                aria-controls="${idPanel}">
          <span class="d-flex flex-wrap align-items-center gap-2 w-100 me-2">
            <strong>Pedido #${numeroPedido(pedido.id)}</strong>
            <span class="text-muted small">${formatearFecha(pedido.creadoEn)}</span>
            <span class="ms-auto d-flex align-items-center gap-2">
              ${badgeEstado(pedido.estado)}
              <strong>${formatearMoneda(pedido.total)}</strong>
            </span>
          </span>
        </button>
      </h2>

      <div id="${idPanel}"
           class="accordion-collapse collapse ${abierto ? "show" : ""}">
        <div class="accordion-body">
          ${detallePedidoHTML(pedido)}
        </div>
      </div>
    </div>`;
}

async function cargar() {
  mostrarCargando(lista, "Cargando tus pedidos...");

  try {
    const pedidos = await obtenerPedidosDeCliente(usuario.uid);

    if (pedidos.length === 0) {
      mostrarVacio(
        lista,
        "Aún no has hecho pedidos.",
        "bi-receipt",
        {
          texto: "Ver catálogo",
          href: ruta("index.html")
        }
      );
      return;
    }

    lista.innerHTML = pedidos.map(pedidoHTML).join("");
  } catch (error) {
    mostrarError(lista, error.message, cargar);
  }
}

// ---------- Inicio ----------

iniciarNavbar();

mostrarCargando(lista, "Verificando sesión...");

usuario = await protegerPagina();

if (pedidoNuevo) {
  alerta.innerHTML = `
    <div class="alert alert-success d-flex align-items-center gap-2"
         role="status">
      <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
      <span>
        ¡Gracias! Tu pedido
        <strong>#${numeroPedido(pedidoNuevo)}</strong>
        quedó registrado. Te avisaremos cuando cambie de estado.
      </span>
    </div>`;
}

cargar();
