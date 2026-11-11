// Administración de velas (solo admin): CRUD completo con validaciones.
import { iniciarNavbar } from "../ui/navbar.js";
import { protegerPagina } from "../services/auth.service.js";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  cambiarVisibilidad,
  cargarDatosIniciales,
  AROMAS,
  TAMANOS
} from "../services/productos.service.js";
import { validarProducto } from "../utils/validaciones.js";
import { buscarPorNombre, ordenarProductos, slugAroma } from "../utils/filtros.js";
import { formatearMoneda } from "../utils/formato.js";
import { escaparHTML } from "../utils/html.js";
import { mostrarCargando, mostrarVacio, mostrarError, mostrarToast, bloquearBoton } from "../ui/alertas.js";
import { mostrarErrores, limpiarErrores } from "../ui/formularios.js";
import { VELAS_INICIALES } from "../../seed/datos-iniciales.js";

const STOCK_BAJO = 5;

const contenido = document.getElementById("contenido");
const resumen = document.getElementById("resumen-velas");
const buscador = document.getElementById("buscador");
const btnNueva = document.getElementById("btn-nueva");
const btnDatosIniciales = document.getElementById("btn-datos-iniciales");
const form = document.getElementById("form-vela");
const tituloModal = document.getElementById("titulo-modal-vela");
const btnGuardar = document.getElementById("btn-guardar");
const nombreEliminar = document.getElementById("nombre-eliminar");
const btnConfirmarEliminar = document.getElementById("btn-confirmar-eliminar");

const modalVela = new bootstrap.Modal("#modal-vela");
const modalEliminar = new bootstrap.Modal("#modal-eliminar");

let productos = [];
let idEditando = null;   // null = creando una vela nueva
let idEliminando = null;

// ---------- Formulario ----------
function llenarSelects() {
  AROMAS.forEach((aroma) => form.elements.aroma.add(new Option(aroma, aroma)));
  Object.entries(TAMANOS).forEach(([valor, texto]) => form.elements.tamano.add(new Option(texto, valor)));
}

// "" → NaN, para que un campo vacío no se tome como 0.
function aNumero(valor) {
  return valor.trim() === "" ? NaN : Number(valor);
}

function leerFormulario() {
  const campos = form.elements;
  return {
    nombre: campos.nombre.value.trim(),
    descripcion: campos.descripcion.value.trim(),
    aroma: campos.aroma.value,
    tamano: campos.tamano.value,
    precio: aNumero(campos.precio.value),
    stock: aNumero(campos.stock.value),
    imagenUrl: campos.imagenUrl.value.trim(),
    activo: campos.activo.checked
  };
}

// El mismo formulario sirve para crear y para editar.
function abrirFormulario(producto = null) {
  idEditando = producto?.id ?? null;
  form.reset();
  limpiarErrores(form);
  tituloModal.textContent = producto ? "Editar vela" : "Nueva vela";

  if (producto) {
    const campos = form.elements;
    campos.nombre.value = producto.nombre;
    campos.descripcion.value = producto.descripcion ?? "";
    campos.aroma.value = producto.aroma;
    campos.tamano.value = producto.tamano;
    campos.precio.value = producto.precio;
    campos.stock.value = producto.stock;
    campos.imagenUrl.value = producto.imagenUrl ?? "";
    campos.activo.checked = producto.activo !== false;
  }
  modalVela.show();
}

// ---------- Tabla ----------
function filaHTML(p) {
  const nombre = escaparHTML(p.nombre);
  const visible = p.activo !== false;
  const stockBajo = p.stock < STOCK_BAJO;

  return `
    <tr class="${stockBajo ? "table-warning" : ""}">
      <td>
        <strong>${nombre}</strong>
        <div class="small text-muted">${TAMANOS[p.tamano] ?? ""}</div>
      </td>
      <td><span class="punto-aroma aroma-${slugAroma(p.aroma)}" aria-hidden="true"></span>${escaparHTML(p.aroma)}</td>
      <td class="text-end">${formatearMoneda(p.precio)}</td>
      <td class="text-center">
        ${p.stock}
        ${stockBajo ? `<i class="bi bi-exclamation-triangle-fill text-warning" title="Stock bajo" aria-label="Stock bajo"></i>` : ""}
      </td>
      <td><span class="badge ${visible ? "text-bg-success" : "text-bg-secondary"}">${visible ? "Visible" : "Oculta"}</span></td>
      <td class="text-end acciones-tabla">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-accion="editar" data-id="${p.id}" aria-label="Editar ${nombre}">
          <i class="bi bi-pencil" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-accion="visibilidad" data-id="${p.id}"
                aria-label="${visible ? "Ocultar" : "Mostrar"} ${nombre}" title="${visible ? "Ocultar del catálogo" : "Mostrar en el catálogo"}">
          <i class="bi ${visible ? "bi-eye-slash" : "bi-eye"}" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${p.id}" aria-label="Eliminar ${nombre}">
          <i class="bi bi-trash" aria-hidden="true"></i>
        </button>
      </td>
    </tr>`;
}

function pintarTabla() {
  const conStockBajo = productos.filter((p) => p.stock < STOCK_BAJO).length;
  resumen.textContent = `${productos.length} velas · ${conStockBajo} con stock bajo`;
  btnDatosIniciales.classList.toggle("d-none", productos.length > 0);

  if (productos.length === 0) {
    mostrarVacio(contenido, "Todavía no hay velas. Crea la primera o carga los datos iniciales.", "bi-box-seam");
    return;
  }

  const lista = ordenarProductos(buscarPorNombre(productos, buscador.value), "nombre");
  if (lista.length === 0) {
    mostrarVacio(contenido, "Ninguna vela coincide con la búsqueda.", "bi-search");
    return;
  }

  contenido.innerHTML = `
    <div class="table-responsive tarjeta">
      <table class="table table-hover align-middle mb-0">
        <caption class="visually-hidden">Lista de velas</caption>
        <thead>
          <tr>
            <th scope="col">Vela</th>
            <th scope="col">Aroma</th>
            <th scope="col" class="text-end">Precio</th>
            <th scope="col" class="text-center">Stock</th>
            <th scope="col">Estado</th>
            <th scope="col" class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>${lista.map(filaHTML).join("")}</tbody>
      </table>
    </div>`;
}

async function cargar() {
  mostrarCargando(contenido, "Cargando velas...");
  try {
    productos = await obtenerProductos();
    pintarTabla();
  } catch (error) {
    mostrarError(contenido, error.message, cargar);
  }
}

// ---------- Eventos ----------
btnNueva.addEventListener("click", () => abrirFormulario());
buscador.addEventListener("input", pintarTabla);

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const datos = leerFormulario();
  if (!mostrarErrores(form, validarProducto(datos))) return; // con errores no se manda nada a Firebase

  bloquearBoton(btnGuardar, true);
  try {
    if (idEditando) {
      await actualizarProducto(idEditando, datos);
      mostrarToast("Vela actualizada.");
    } else {
      await crearProducto(datos);
      mostrarToast("Vela creada.");
    }
    modalVela.hide();
    await cargar();
  } catch (error) {
    mostrarToast(error.message, "error");
  } finally {
    bloquearBoton(btnGuardar, false);
  }
});

// Delegación de eventos para los botones de cada fila.
contenido.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const producto = productos.find((p) => p.id === boton.dataset.id);
  if (!producto) return;

  if (boton.dataset.accion === "editar") {
    abrirFormulario(producto);
  }

  if (boton.dataset.accion === "visibilidad") {
    const nuevoEstado = producto.activo === false;
    boton.disabled = true;
    try {
      await cambiarVisibilidad(producto.id, nuevoEstado);
      mostrarToast(nuevoEstado ? "La vela ya se ve en el catálogo." : "La vela se ocultó del catálogo.");
      await cargar();
    } catch (error) {
      mostrarToast(error.message, "error");
      boton.disabled = false;
    }
  }

  if (boton.dataset.accion === "eliminar") {
    idEliminando = producto.id;
    nombreEliminar.textContent = producto.nombre;
    modalEliminar.show();
  }
});

btnConfirmarEliminar.addEventListener("click", async () => {
  bloquearBoton(btnConfirmarEliminar, true, "Eliminando...");
  try {
    await eliminarProducto(idEliminando);
    mostrarToast("Vela eliminada.");
    modalEliminar.hide();
    await cargar();
  } catch (error) {
    mostrarToast(error.message, "error");
  } finally {
    bloquearBoton(btnConfirmarEliminar, false);
  }
});

btnDatosIniciales.addEventListener("click", async () => {
  bloquearBoton(btnDatosIniciales, true, "Cargando...");
  try {
    await cargarDatosIniciales(VELAS_INICIALES);
    mostrarToast(`Se cargaron ${VELAS_INICIALES.length} velas.`);
    await cargar();
  } catch (error) {
    mostrarToast(error.message, "error");
  } finally {
    bloquearBoton(btnDatosIniciales, false);
  }
});

// ---------- Inicio ----------
iniciarNavbar();
mostrarCargando(contenido, "Verificando permisos...");
await protegerPagina("admin");
llenarSelects();
cargar();
