// Catálogo público: carga las velas de Firestore y las pinta con JavaScript,
// con búsqueda, filtro por aroma y ordenamiento.
import { iniciarNavbar } from "../ui/navbar.js";
import { obtenerProductos, AROMAS, TAMANOS } from "../services/productos.service.js";
import { agregarAlCarrito } from "../services/carrito.service.js";
import { buscarPorNombre, filtrarPorAroma, ordenarProductos, slugAroma } from "../utils/filtros.js";
import { formatearMoneda } from "../utils/formato.js";
import { escaparHTML } from "../utils/html.js";
import { mostrarCargando, mostrarVacio, mostrarError, mostrarToast } from "../ui/alertas.js";

const contenedor = document.getElementById("lista-velas");
const formFiltros = document.getElementById("form-filtros");
const buscador = document.getElementById("buscador");
const selectAroma = document.getElementById("filtro-aroma");
const selectOrden = document.getElementById("orden");
const contador = document.getElementById("contador-resultados");

let productos = [];

function llenarAromas() {
  AROMAS.forEach((aroma) => {
    const opcion = document.createElement("option");
    opcion.value = aroma;
    opcion.textContent = aroma;
    selectAroma.appendChild(opcion);
  });
}

function insignia(producto) {
  if (producto.stock <= 0) return `<span class="badge text-bg-dark">Agotada</span>`;
  if (producto.stock < 5) return `<span class="badge text-bg-warning">¡Últimas ${producto.stock}!</span>`;
  return "";
}

function crearTarjeta(producto) {
  const columna = document.createElement("div");
  columna.className = "col-sm-6 col-lg-4 col-xl-3";

  const nombre = escaparHTML(producto.nombre);
  const agotada = producto.stock <= 0;
  const portada = producto.imagenUrl
    ? `<img src="${escaparHTML(producto.imagenUrl)}" alt="Vela ${nombre}" loading="lazy">`
    : `<i class="bi bi-fire" aria-hidden="true"></i>`;

  columna.innerHTML = `
    <article class="card vela-card tarjeta">
      <div class="vela-portada aroma-${slugAroma(producto.aroma)}">
        ${portada}
        ${insignia(producto)}
      </div>
      <div class="card-body d-flex flex-column">
        <h3 class="h5 card-title mb-1">${nombre}</h3>
        <p class="small text-muted mb-2">${escaparHTML(producto.aroma)} · ${TAMANOS[producto.tamano] ?? ""}</p>
        <p class="card-text small flex-grow-1">${escaparHTML(producto.descripcion ?? "")}</p>
        <div class="d-flex align-items-center justify-content-between mt-2">
          <span class="vela-precio">${formatearMoneda(producto.precio)}</span>
          <button type="button" class="btn btn-ambar btn-sm" data-id="${producto.id}"
                  aria-label="Agregar ${nombre} al carrito" ${agotada ? "disabled" : ""}>
            <i class="bi bi-bag-plus" aria-hidden="true"></i> Agregar
          </button>
        </div>
      </div>
    </article>`;
  return columna;
}

function pintar(lista) {
  contador.textContent = `${lista.length} ${lista.length === 1 ? "vela" : "velas"}`;

  if (lista.length === 0) {
    mostrarVacio(contenedor, "No hay velas que coincidan con tu búsqueda.", "bi-search");
    return;
  }
  contenedor.replaceChildren(...lista.map(crearTarjeta));
}

function aplicarFiltros() {
  let lista = productos.filter((p) => p.activo !== false); // solo las visibles
  lista = buscarPorNombre(lista, buscador.value);
  lista = filtrarPorAroma(lista, selectAroma.value);
  lista = ordenarProductos(lista, selectOrden.value);
  pintar(lista);
}

async function cargarProductos() {
  mostrarCargando(contenedor, "Cargando velas...");
  contador.textContent = "";
  try {
    productos = await obtenerProductos();
    if (productos.filter((p) => p.activo !== false).length === 0) {
      mostrarVacio(contenedor, "Todavía no hay velas en el catálogo. ¡Vuelve pronto!", "bi-fire");
      return;
    }
    aplicarFiltros();
  } catch (error) {
    mostrarError(contenedor, error.message, cargarProductos);
  }
}

// ---------- Eventos ----------
buscador.addEventListener("input", aplicarFiltros);
selectAroma.addEventListener("change", aplicarFiltros);
selectOrden.addEventListener("change", aplicarFiltros);
formFiltros.addEventListener("submit", (evento) => evento.preventDefault());
// "reset" ocurre antes de que se limpien los campos, por eso se espera un instante.
formFiltros.addEventListener("reset", () => setTimeout(aplicarFiltros));

// Delegación de eventos: un solo listener para todos los botones "Agregar".
contenedor.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-id]");
  if (!boton) return;

  const producto = productos.find((p) => p.id === boton.dataset.id);
  const resultado = agregarAlCarrito(producto);
  mostrarToast(resultado.mensaje, resultado.ok ? "exito" : "error");
});

// ---------- Inicio ----------
iniciarNavbar();
llenarAromas();
cargarProductos();
