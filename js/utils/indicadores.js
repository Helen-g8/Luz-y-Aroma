
 // Cálculo de indicadores del negocio a partir de los pedidos y las velas.
import { ESTADOS } from "../services/pedidos.service.js";
import { redondear } from "./formato.js";

// Los pedidos cancelados no cuentan como venta.
export function pedidosValidos(pedidos) {
  return pedidos.filter((p) => p.estado !== "cancelado");
}

export function ventasTotales(pedidos) {
  return redondear(pedidosValidos(pedidos).reduce((suma, p) => suma + p.total, 0));
}

export function ticketPromedio(pedidos) {
  const validos = pedidosValidos(pedidos);
  return validos.length ? redondear(ventasTotales(pedidos) / validos.length) : 0;
}

// Agrupa: { pendiente: 2, en_preparacion: 1, enviado: 0, ... }
export function contarPorEstado(pedidos) {
  const inicial = Object.fromEntries(
    Object.keys(ESTADOS).map((estado) => [estado, 0])
  );

  return pedidos.reduce((conteo, p) => {
    conteo[p.estado] = (conteo[p.estado] ?? 0) + 1;
    return conteo;
  }, inicial);
}

// Las N velas con más unidades vendidas.
export function topVelas(pedidos, cantidad = 3) {
  const porVela = {};

  pedidosValidos(pedidos).forEach((pedido) => {
    pedido.items.forEach((item) => {
      porVela[item.productoId] ??= {
        nombre: item.nombre,
        unidades: 0,
        ingresos: 0
      };

      porVela[item.productoId].unidades += item.cantidad;
      porVela[item.productoId].ingresos = redondear(
        porVela[item.productoId].ingresos + item.precio * item.cantidad
      );
    });
  });

  return Object.values(porVela)
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, cantidad);
}

export function velasConStockBajo(productos, limite = 5) {
  return productos
    .filter((p) => p.activo !== false && p.stock < limite)
    .sort((a, b) => a.stock - b.stock);
}
