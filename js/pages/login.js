// Página de inicio de sesión.
import {
  iniciarSesion,
  traducirErrorAuth,
  obtenerSesionActual,
  destinoVolver,
  ruta
} from "../services/auth.service.js";
import { iniciarNavbar } from "../ui/navbar.js";
import { bloquearBoton } from "../ui/alertas.js";
import { mostrarErrores } from "../ui/formularios.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const form = document.getElementById("form-login");
const boton = document.getElementById("btn-login");
const alerta = document.getElementById("alerta-login");
const volver = new URLSearchParams(location.search).get("volver");

// Si venía de otra página (por ejemplo el carrito), el registro también regresa ahí.
if (volver) {
  document.getElementById("enlace-registro").href = `registro.html?volver=${encodeURIComponent(volver)}`;
}

function destino(usuario) {
  return destinoVolver(volver)
    ?? (usuario?.rol === "admin" ? ruta("admin/dashboard.html") : ruta("index.html"));
}

function validar(datos) {
  const errores = {};
  if (!EMAIL_REGEX.test(datos.email)) errores.email = "Escribe un correo válido.";
  if (!datos.password) errores.password = "Escribe tu contraseña.";
  return errores;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  alerta.classList.add("d-none");

  const datos = {
    email: form.elements.email.value.trim(),
    password: form.elements.password.value
  };
  if (!mostrarErrores(form, validar(datos))) return;

  bloquearBoton(boton, true, "Entrando...");
  try {
    const { perfil } = await iniciarSesion(datos.email, datos.password);
    location.href = destino(perfil);
  } catch (error) {
    alerta.textContent = traducirErrorAuth(error);
    alerta.classList.remove("d-none");
    bloquearBoton(boton, false);
  }
});

iniciarNavbar();

// Si ya tiene sesión, no tiene sentido mostrarle el login.
const usuarioActual = await obtenerSesionActual();
if (usuarioActual) location.href = destino(usuarioActual);
