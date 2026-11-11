// Retroalimentación visual compartida por todas las páginas:
// toasts, estados de carga, estados vacíos, errores y botones bloqueados.

function contenedorToasts() {
  let contenedor = document.getElementById("toast-container");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toast-container";
    contenedor.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

// tipo: "exito" | "error" | "info"
export function mostrarToast(mensaje, tipo = "exito") {
  const colores = { exito: "text-bg-success", error: "text-bg-danger", info: "text-bg-dark" };

  const toast = document.createElement("div");
  toast.className = `toast align-items-center border-0 ${colores[tipo] ?? colores.info}`;
  toast.setAttribute("role", tipo === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", tipo === "error" ? "assertive" : "polite");
  toast.setAttribute("aria-atomic", "true");

  const fila = document.createElement("div");
  fila.className = "d-flex";

  const cuerpo = document.createElement("div");
  cuerpo.className = "toast-body";
  cuerpo.textContent = mensaje;

  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = "btn-close btn-close-white me-2 m-auto";
  cerrar.setAttribute("data-bs-dismiss", "toast");
  cerrar.setAttribute("aria-label", "Cerrar");

  fila.append(cuerpo, cerrar);
  toast.appendChild(fila);
  contenedorToasts().appendChild(toast);

  const instancia = new bootstrap.Toast(toast, { delay: 3500 });
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
  instancia.show();
}

function bloqueEstado(icono, mensaje) {
  const bloque = document.createElement("div");
  bloque.className = "estado-centro col-12";
  const i = document.createElement("i");
  i.className = `bi ${icono}`;
  i.setAttribute("aria-hidden", "true");
  const p = document.createElement("p");
  p.className = "mt-2 mb-0";
  p.textContent = mensaje;
  bloque.append(i, p);
  return bloque;
}

export function mostrarCargando(contenedor, mensaje = "Cargando...") {
  const bloque = document.createElement("div");
  bloque.className = "estado-centro col-12";
  bloque.setAttribute("role", "status");
  bloque.innerHTML = `<div class="spinner-border text-ambar" aria-hidden="true"></div>`;
  const p = document.createElement("p");
  p.className = "mt-2 mb-0";
  p.textContent = mensaje;
  bloque.appendChild(p);
  contenedor.replaceChildren(bloque);
}

// accion (opcional): { texto, href } para mostrar un enlace debajo del mensaje.
export function mostrarVacio(contenedor, mensaje, icono = "bi-inbox", accion = null) {
  const bloque = bloqueEstado(icono, mensaje);
  if (accion) {
    const enlace = document.createElement("a");
    enlace.href = accion.href;
    enlace.className = "btn btn-ambar mt-3";
    enlace.textContent = accion.texto;
    bloque.appendChild(enlace);
  }
  contenedor.replaceChildren(bloque);
}

// reintentar (opcional): función que se llama al presionar "Reintentar".
export function mostrarError(contenedor, mensaje, reintentar = null) {
  const bloque = bloqueEstado("bi-exclamation-octagon text-danger", mensaje);
  if (reintentar) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-outline-secondary mt-3";
    boton.textContent = "Reintentar";
    boton.addEventListener("click", reintentar);
    bloque.appendChild(boton);
  }
  contenedor.replaceChildren(bloque);
}

// Deshabilita un botón y le pone spinner mientras se espera a Firebase.
export function bloquearBoton(boton, cargando, texto = "Guardando...") {
  if (cargando) {
    boton.dataset.textoOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${texto}`;
  } else {
    boton.disabled = false;
    if (boton.dataset.textoOriginal) boton.innerHTML = boton.dataset.textoOriginal;
  }
}
