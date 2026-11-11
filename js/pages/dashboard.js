
 // Panel de indicadores del admin: se calcula todo en JavaScript a partir de pedidos y velas.
import { iniciarNavbar } from "../ui/navbar.js";
import { protegerPagina, ruta } from "../services/auth.service.js";
import { obtenerTodosLosPedidos, ESTADOS } from "../services/pedidos.service.js";
import { obtenerProductos } from "../services/productos.service.js";
import {
  ventasTotales,
  ticketPromedio,
  contarPorEstado,
  topVelas,
  velasConStockBajo,
  pedidosValidos
} from "../utils/indicadores.js";
import { formatearMoneda } from "../utils/formato.js";
import { escaparHTML } from "../utils/html.js";
import { mostrarCargando, mostrarError } from "../ui/alertas.js";

const contenido = document.getElementById("contenido");
const btnRecargar = document.getElementById("btn-recargar");

function tarjetaIndicador(icono, valor, etiqueta) {
  return `
    <div class="col-6 col-lg-3">
      <div class="tarjeta indicador">
        <i class="bi ${icono}" aria-hidden="true"></i>
        <div class="valor mt-2">${valor}</div>
        <div class="etiqueta">${etiqueta}</div>
      </div>
    </div>`;
}

function barrasPorEstado(pedidos) {
  const conteo = contarPorEstado(pedidos);
  const total = pedidos.length || 1;

  return Object.entries(ESTADOS).map(([clave, info]) => {
    const porcentaje = Math.round((conteo[clave] / total) * 100);

    return `
      <div class="barra-estado mb-3">
        <div class="d-flex justify-content-between small mb-1">
          <span>${info.texto}</span>
          <strong>${conteo[clave]}</strong>
        </div>
        <div
          class="progress"
          role="progressbar"
          aria-label="${info.texto}"
          aria-valuenow="${porcentaje}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="progress-bar ${info.clase.replace("text-bg-", "bg-")}"
            style="width: ${porcentaje}%"
          ></div>
        </div>
      </div>`;
  }).join("");
}

function listaTopVelas(pedidos) {
  const top = topVelas(pedidos, 3);

  if (top.length === 0) {
    return `<p class="text-muted small mb-0">Todavía no hay ventas.</p>`;
  }

  return `
    <ol class="list-unstyled mb-0 lista-panel">
      ${top.map((vela, i) => `
        <li class="d-flex justify-content-between align-items-center py-2">
          <span>
            <strong>${i + 1}.</strong>
            ${escaparHTML(vela.nombre)}
          </span>
          <span class="text-end small">
            ${vela.unidades} uds.
            <br>
            <span class="text-muted">
              ${formatearMoneda(vela.ingresos)}
            </span>
          </span>
        </li>`).join("")}
    </ol>`;
}

function listaStockBajo(productos) {
  const bajas = velasConStockBajo(productos);

  if (bajas.length === 0) {
    return `<p class="text-muted small mb-0">Todas las velas tienen buen stock.</p>`;
  }

  return `
    <ul class="list-unstyled mb-0 lista-panel">
      ${bajas.map((vela) => `
        <li class="d-flex justify-content-between align-items-center py-2">
          <span>${escaparHTML(vela.nombre)}</span>
          <span class="badge ${vela.stock === 0 ? "text-bg-dark" : "text-bg-warning"}">
            ${vela.stock === 0 ? "Agotada" : `${vela.stock} uds.`}
          </span>
        </li>`).join("")}
    </ul>

    <a
      class="btn btn-sm btn-outline-ambar mt-3"
      href="${ruta("admin/productos.html")}"
    >
      Ir a velas
    </a>`;
}

function pintar(pedidos, productos) {
  const conteo = contarPorEstado(pedidos);
  const porAtender = conteo.pendiente + conteo.en_preparacion;

  contenido.innerHTML = `
    <div class="row g-3 mb-4">
      ${tarjetaIndicador(
        "bi-cash-stack",
        formatearMoneda(ventasTotales(pedidos)),
        "Ventas (sin cancelados)"
      )}

      ${tarjetaIndicador(
        "bi-receipt",
        pedidosValidos(pedidos).length,
        "Pedidos válidos"
      )}

      ${tarjetaIndicador(
        "bi-graph-up",
        formatearMoneda(ticketPromedio(pedidos)),
        "Ticket promedio"
      )}

      ${tarjetaIndicador(
        "bi-hourglass-split",
        porAtender,
        "Pedidos por atender"
      )}
    </div>

    <div class="row g-3">
      <section class="col-lg-4" aria-labelledby="titulo-estados">
        <div class="tarjeta p-4 h-100">
          <h2 id="titulo-estados" class="h5 mb-3">
            Pedidos por estado
          </h2>

          ${pedidos.length
            ? barrasPorEstado(pedidos)
            : `<p class="text-muted small mb-0">Todavía no hay pedidos.</p>`}
        </div>
      </section>

      <section class="col-lg-4" aria-labelledby="titulo-top">
        <div class="tarjeta p-4 h-100">
          <h2 id="titulo-top" class="h5 mb-3">
            Velas más vendidas
          </h2>

          ${listaTopVelas(pedidos)}
        </div>
      </section>

      <section class="col-lg-4" aria-labelledby="titulo-stock">
        <div class="tarjeta p-4 h-100">
          <h2 id="titulo-stock" class="h5 mb-3">
            Stock bajo (menos de 5)
          </h2>

          ${listaStockBajo(productos)}
        </div>
      </section>
    </div>`;
}

async function cargar() {
  mostrarCargando(contenido, "Calculando indicadores...");

  try {
    // Las dos consultas se hacen al mismo tiempo.
    const [pedidos, productos] = await Promise.all([
      obtenerTodosLosPedidos(),
      obtenerProductos()
    ]);

    pintar(pedidos, productos);
  } catch (error) {
    mostrarError(contenido, error.message, cargar);
  }
}

btnRecargar.addEventListener("click", cargar);

// ---------- Inicio ----------

iniciarNavbar();
mostrarCargando(contenido, "Verificando permisos...");
await protegerPagina("admin");
cargar();
