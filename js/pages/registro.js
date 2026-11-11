// Página de registro de clientes.
import {
  registrarUsuario,
  traducirErrorAuth,
  obtenerSesionActual,
  destinoVolver,
  ruta
} from "../services/auth.service.js";
import { iniciarNavbar } from "../ui/navbar.js";
import { bloquearBoton } from "../ui/alertas.js";
import { mostrarErrores } from "../ui/formularios.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+$/;

const form = document.getElementById("form-registro");
const boton = document.getElementById("btn-registro");
const alerta = document.getElementById("alerta-registro");
const volver = new URLSearchParams(location.search).get("volver");

if (volver) {
  document.getElementById("enlace-login").href = `login.html?volver=${encodeURIComponent(volver)}`;
}

function validar(datos) {
  const errores = {};
  if (datos.nombre.length < 3 || datos.nombre.length > 60) {
    errores.nombre = "El nombre debe tener entre 3 y 60 caracteres.";
  } else if (!NOMBRE_REGEX.test(datos.nombre)) {
    errores.nombre = "El nombre solo puede tener letras y espacios.";
  }
  if (!EMAIL_REGEX.test(datos.email)) errores.email = "Escribe un correo válido.";
  if (datos.password.length < 6) errores.password = "La contraseña debe tener al menos 6 caracteres.";
  if (datos.confirmar !== datos.password) errores.confirmar = "Las contraseñas no coinciden.";
  return errores;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  alerta.classList.add("d-none");

  const datos = {
    nombre: form.elements.nombre.value.trim().replace(/\s+/g, " "),
    email: form.elements.email.value.trim().toLowerCase(),
    password: form.elements.password.value,
    confirmar: form.elements.confirmar.value
  };
  if (!mostrarErrores(form, validar(datos))) return;

  bloquearBoton(boton, true, "Creando cuenta...");
  try {
    await registrarUsuario(datos.nombre, datos.email, datos.password);
    location.href = destinoVolver(volver) ?? ruta("index.html");
  } catch (error) {
    alerta.textContent = traducirErrorAuth(error);
    alerta.classList.remove("d-none");
    bloquearBoton(boton, false);
  }
});

iniciarNavbar();

const usuarioActual = await obtenerSesionActual();
if (usuarioActual && !form.querySelector("button[disabled]")) {
  location.href = ruta("index.html");
}
