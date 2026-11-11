
 // Gestión de datos de la colección "pedidos".
import { db } from "../config/firebase.js";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { calcularTotales } from "./carrito.service.js";

export const ESTADOS = {
  pendiente: { texto: "Pendiente", clase: "text-bg-warning" },
  en_preparacion: { texto: "En preparación", clase: "text-bg-info" },
  enviado: { texto: "Enviado", clase: "text-bg-primary" },
  entregado: { texto: "Entregado", clase: "text-bg-success" },
  cancelado: { texto: "Cancelado", clase: "text-bg-secondary" }
};

// A qué estados puede pasar un pedido desde cada estado.
export const TRANSICIONES = {
  pendiente: ["en_preparacion", "cancelado"],
  en_preparacion: ["enviado", "cancelado"],
  enviado: ["entregado"],
  entregado: [],
  cancelado: []
};

const pedidosRef = collection(db, "pedidos");

// Los errores que lanzamos nosotros no tienen "code"; los de Firebase sí.
function errorAmigable(error, mensaje) {
  console.error(error);

  if (!error.code) return error;

  if (error.code === "permission-denied") {
    return new Error("No tienes permiso para hacer esta operación.");
  }

  if (error.code === "unavailable") {
    return new Error("Sin conexión con el servidor. Intenta de nuevo.");
  }

  return new Error(mensaje);
}

function ordenarPorFecha(pedidos) {
  return [...pedidos].sort(
    (a, b) =>
      (b.creadoEn?.toMillis?.() ?? 0) -
      (a.creadoEn?.toMillis?.() ?? 0)
  );
}

// Crea el pedido y descuenta el stock en una transacción.
export async function crearPedido(carrito, entrega, usuario) {
  if (carrito.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  try {
    return await runTransaction(db, async (tx) => {
      // 1. Leer todos los productos antes de escribir.
      const refs = carrito.map((item) =>
        doc(db, "productos", item.id)
      );

      const snaps = [];

      for (const ref of refs) {
        snaps.push(await tx.get(ref));
      }

      // 2. Verificar disponibilidad y stock.
      const items = carrito.map((item, i) => {
        const snap = snaps[i];

        if (!snap.exists() || snap.data().activo === false) {
          throw new Error(
            `La vela "${item.nombre}" ya no está disponible. Quítala del carrito.`
          );
        }

        const producto = snap.data();

        if (producto.stock < item.cantidad) {
          throw new Error(
            `Solo quedan ${producto.stock} unidades de "${producto.nombre}". Ajusta tu carrito.`
          );
        }

        return {
          productoId: snap.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: item.cantidad
        };
      });

      // 3. Descontar el stock.
      items.forEach((item, i) => {
        tx.update(refs[i], {
          stock: snaps[i].data().stock - item.cantidad
        });
      });

      // 4. Crear el pedido.
      const { subtotal, envio, total } = calcularTotales(items);
      const nuevoPedido = doc(pedidosRef);

      tx.set(nuevoPedido, {
        clienteId: usuario.uid,
        clienteNombre: usuario.nombre ?? usuario.email,
        clienteEmail: usuario.email,
        items,
        subtotal,
        envio,
        total,
        direccion: entrega.direccion,
        telefono: entrega.telefono,
        notas: entrega.notas,
        estado: "pendiente",
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
      });

      return nuevoPedido.id;
    });
  } catch (error) {
    throw errorAmigable(
      error,
      "No se pudo registrar el pedido. Intenta de nuevo."
    );
  }
}

// Consultar los pedidos de un cliente.
export async function obtenerPedidosDeCliente(uid) {
  try {
    const snap = await getDocs(
      query(pedidosRef, where("clienteId", "==", uid))
    );

    return ordenarPorFecha(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }))
    );
  } catch (error) {
    throw errorAmigable(
      error,
      "No se pudieron cargar tus pedidos."
    );
  }
}

// Consultar todos los pedidos (solo administrador).
export async function obtenerTodosLosPedidos() {
  try {
    const snap = await getDocs(pedidosRef);

    return ordenarPorFecha(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }))
    );
  } catch (error) {
    throw errorAmigable(
      error,
      "No se pudieron cargar los pedidos."
    );
  }
}

// Cambiar el estado de un pedido.
export async function cambiarEstadoPedido(id, nuevoEstado) {
  try {
    await runTransaction(db, async (tx) => {
      const pedidoRef = doc(db, "pedidos", id);
      const pedidoSnap = await tx.get(pedidoRef);

      if (!pedidoSnap.exists()) {
        throw new Error("El pedido ya no existe.");
      }

      const pedido = pedidoSnap.data();

      if (!TRANSICIONES[pedido.estado]?.includes(nuevoEstado)) {
        throw new Error(
          `No se puede pasar de "${ESTADOS[pedido.estado]?.texto}" a "${ESTADOS[nuevoEstado]?.texto ?? nuevoEstado}".`
        );
      }

      // Si se cancela, devolver las unidades al inventario.
      if (nuevoEstado === "cancelado") {
        const refs = pedido.items.map((item) =>
          doc(db, "productos", item.productoId)
        );

        const snaps = [];

        for (const ref of refs) {
          snaps.push(await tx.get(ref));
        }

        snaps.forEach((snap, i) => {
          if (snap.exists()) {
            tx.update(refs[i], {
              stock:
                snap.data().stock +
                pedido.items[i].cantidad,
              actualizadoEn: serverTimestamp()
            });
          }
        });
      }

      tx.update(pedidoRef, {
        estado: nuevoEstado,
        actualizadoEn: serverTimestamp()
      });
    });
  } catch (error) {
    throw errorAmigable(
      error,
      "No se pudo cambiar el estado del pedido."
    );
  }
}

// Eliminar únicamente pedidos cancelados.
export async function eliminarPedido(pedido) {
  if (pedido.estado !== "cancelado") {
    throw new Error(
      "Solo se pueden eliminar pedidos cancelados."
    );
  }

  try {
    await deleteDoc(doc(db, "pedidos", pedido.id));
  } catch (error) {
    throw errorAmigable(
      error,
      "No se pudo eliminar el pedido."
    );
  }
}
