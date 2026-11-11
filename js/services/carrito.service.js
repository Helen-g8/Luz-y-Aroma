 // Carrito de compras. Se guarda en localStorage porque es temporal y de cada navegador;
 // lo que sí se guarda en Firebase es el pedido cuando el cliente lo confirma.
 import { redondear } from "../utils/formato.js";

 // Si cambian esta clave, cámbienla también en js/ui/navbar.js
 export const CLAVE_CARRITO = "carrito_luz_y_aroma";

 // ---------- Reglas de negocio ----------
 export const COSTO_ENVIO = 3.5;
 export const ENVIO_GRATIS_DESDE = 30;

 const TELEFONO_REGEX = /^[267]\d{7}$/; // 8 dígitos que empiezan con 2, 6 o 7

 export function obtenerCarrito() {
   try {
     return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? [];
   } catch {
     return [];
   }
 }

 export function contarArticulos(carrito = obtenerCarrito()) {
   return carrito.reduce((suma, item) => suma + item.cantidad, 0);
 }

 function guardar(carrito) {
   localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
   // Avisa a la navbar para que actualice el contador.
   window.dispatchEvent(new CustomEvent("carrito-actualizado", { detail: contarArticulos(carrito) }));
 }

 export function agregarAlCarrito(producto, cantidad = 1) {
   if (!producto) return { ok: false, mensaje: "No se encontró la vela." };

   const carrito = obtenerCarrito();
   const item = carrito.find((i) => i.id === producto.id);
   const nuevaCantidad = (item?.cantidad ?? 0) + cantidad;

   if (nuevaCantidad > producto.stock) {
     return { ok: false, mensaje: `Solo hay ${producto.stock} unidades de ${producto.nombre}.` };
   }

   if (item) {
     item.cantidad = nuevaCantidad;
     item.precio = producto.precio;
     item.stock = producto.stock;
   } else {
     carrito.push({
       id: producto.id,
       nombre: producto.nombre,
       aroma: producto.aroma,
       precio: producto.precio,
       stock: producto.stock,
       cantidad
     });
   }

   guardar(carrito);
   return { ok: true, mensaje: `${producto.nombre} se agregó al carrito.` };
 }

 export function cambiarCantidad(id, cantidad) {
   const carrito = obtenerCarrito();
   const item = carrito.find((i) => i.id === id);
   if (!item) return { ok: false, mensaje: "La vela ya no está en el carrito." };
   if (cantidad < 1) return { ok: false, mensaje: "La cantidad mínima es 1." };
   if (cantidad > item.stock) return { ok: false, mensaje: `Solo hay ${item.stock} disponibles de ${item.nombre}.` };

   item.cantidad = cantidad;
   guardar(carrito);
   return { ok: true };
 }

 export function quitarDelCarrito(id) {
   guardar(obtenerCarrito().filter((item) => item.id !== id));
 }

 export function vaciarCarrito() {
   guardar([]);
 }

 // Subtotal, envío (gratis desde $30) y total.
 export function calcularTotales(carrito = obtenerCarrito()) {
   const subtotal = redondear(carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0));
   const envio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
   const faltaParaEnvioGratis = subtotal > 0 && subtotal < ENVIO_GRATIS_DESDE
     ? redondear(ENVIO_GRATIS_DESDE - subtotal)
     : 0;

   return {
     subtotal,
     envio,
     total: redondear(subtotal + envio),
     cantidadArticulos: contarArticulos(carrito),
     faltaParaEnvioGratis
   };
 }

 export function validarEntrega(datos) {
   const errores = {};
   if (datos.direccion.length < 10 || datos.direccion.length > 200) {
     errores.direccion = "Escribe una dirección de entrega de entre 10 y 200 caracteres.";
   }
   if (!TELEFONO_REGEX.test(datos.telefono)) {
     errores.telefono = "Escribe un teléfono de 8 dígitos que empiece con 2, 6 o 7.";
   }
   if (datos.notas.length > 200) {
     errores.notas = "Las notas no pueden pasar de 200 caracteres.";
   }
   return errores;
 }
