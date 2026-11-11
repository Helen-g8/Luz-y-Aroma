
 // Piezas de interfaz para mostrar pedidos (las usan "Mis pedidos" y la página del admin).
import { ESTADOS } from "../services/pedidos.service.js";
import { formatearMoneda, formatearFecha } from "../utils/formato.js";
import { escaparHTML } from "../utils/html.js";

export function numeroPedido(id) {
  return id.slice(0, 6).toUpperCase();
}

export function badgeEstado(estado) {
  const info = ESTADOS[estado] ?? { texto: estado, clase: "text-bg-light" };
  return `<span class="badge ${info.clase}">${escaparHTML(info.texto)}</span>`;
}

export function detallePedidoHTML(pedido) {
  const filas = pedido.items.map((item) => `
    <tr>
      <td>${escaparHTML(item.nombre)}</td>
      <td class="text-center">${item.cantidad}</td>
      <td class="text-end">${formatearMoneda(item.precio)}</td>
      <td class="text-end">${formatearMoneda(item.precio * item.cantidad)}</td>
    </tr>`).join("");

  return `
    <div class="table-responsive">
      <table class="table table-sm mb-3">
        <caption class="visually-hidden">Artículos del pedido ${numeroPedido(pedido.id)}</caption>
        <thead>
          <tr>
            <th scope="col">Vela</th>
            <th scope="col" class="text-center">Cant.</th>
            <th scope="col" class="text-end">Precio</th>
            <th scope="col" class="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
        <tfoot>
          <tr><td colspan="3" class="text-end">Subtotal</td><td class="text-end">${formatearMoneda(pedido.subtotal)}</td></tr>
          <tr><td colspan="3" class="text-end">Envío</td><td class="text-end">${pedido.envio === 0 ? "Gratis" : formatearMoneda(pedido.envio)}</td></tr>
          <tr class="fw-bold"><td colspan="3" class="text-end">Total</td><td class="text-end">${formatearMoneda(pedido.total)}</td></tr>
        </tfoot>
      </table>
    </div>
    <p class="small mb-1"><strong>Dirección:</strong> ${escaparHTML(pedido.direccion)}</p>
    <p class="small mb-1"><strong>Teléfono:</strong> ${escaparHTML(pedido.telefono)}</p>
    ${pedido.notas ? `<p class="small mb-1"><strong>Notas:</strong> ${escaparHTML(pedido.notas)}</p>` : ""}
    <p class="small text-muted mb-0">Última actualización: ${formatearFecha(pedido.actualizadoEn)}</p>`;
}
