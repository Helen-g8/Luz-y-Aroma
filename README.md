
# Luz y Aroma 🕯️

Aplicación web para **Luz y Aroma**, un emprendimiento de velas artesanales aromáticas.
Desafío Práctico II · Desarrollo Web I · ESEN · 2026

**Equipo:** Helen · Oscar · Sofi

**Versión publicada:** https://luz-y-aroma.web.app

---

## El problema

Luz y Aroma vendía sus velas por WhatsApp e Instagram y llevaba el inventario y los pedidos a mano.
Se perdían pedidos, no se sabía cuánto stock quedaba de cada vela y no había cifras de ventas.

## La solución

Una tienda web donde los clientes ven el catálogo y hacen pedidos, y la administradora gestiona
velas, inventario y el estado de cada pedido, con un panel de indicadores.

## Roles

| Rol | Qué puede hacer |
|---|---|
| **Cliente** | Registrarse, ver el catálogo, armar su carrito, hacer pedidos y ver el estado de sus pedidos. |
| **Administrador** | Crear, editar, ocultar y eliminar velas; ver todos los pedidos y cambiar su estado; ver el panel de indicadores. |

Todo usuario nuevo se registra como **cliente**. El rol de administrador se asigna solo desde la consola de
Firebase, y las reglas de Firestore impiden que un usuario cambie su propio rol.

## Procesos implementados

1. **Gestión de catálogo e inventario** (admin): CRUD completo de velas con validaciones.
2. **Compra y pedido** (cliente): catálogo → carrito → confirmación del pedido. Al confirmar, el stock se
   descuenta con una transacción.
3. **Seguimiento de pedidos** (admin y cliente): el admin mueve el pedido por sus estados
   (pendiente → en preparación → enviado → entregado, o cancelado, que devuelve el stock) y el cliente ve el avance.
   El panel resume ventas, pedidos por estado, velas más vendidas y stock bajo.

## Tecnologías

- HTML5, CSS3, Bootstrap 5.3 y Bootstrap Icons
- JavaScript nativo con módulos ES (sin frameworks)
- Firebase Authentication (correo y contraseña)
- Cloud Firestore (base de datos) con reglas de seguridad por rol
- Firebase Hosting

## Estructura del proyecto

```
├── index.html, login.html, registro.html, carrito.html, mis-pedidos.html
├── admin/              productos.html, pedidos.html, dashboard.html
├── css/                styles.css (base), catalogo.css, pedidos.css
├── js/
│   ├── config/         firebase.js — conexión con Firebase
│   ├── services/       acceso a datos: auth, productos, carrito, pedidos
│   ├── ui/             piezas de interfaz: navbar, alertas, formularios, detalle de pedido
│   ├── utils/          funciones de apoyo: validaciones, filtros, formato, indicadores
│   └── pages/          un archivo por página, maneja el DOM y los eventos
├── seed/               datos iniciales del catálogo
├── firestore.rules     reglas de seguridad
└── firebase.json       configuración de Firebase Hosting
```

**Separación de capas:** `config` solo conecta con Firebase; `services` es lo único que lee o escribe en
Firestore; `pages` y `ui` son lo único que toca el DOM. Una página nunca llama a Firestore directamente.

## Modelo de datos (Firestore)

| Colección | Campos principales |
|---|---|
| `usuarios/{uid}` | nombre, email, rol (`cliente` o `admin`), creadoEn |
| `productos/{id}` | nombre, descripcion, aroma, tamano, precio, stock, imagenUrl, activo, creadoEn, actualizadoEn |
| `pedidos/{id}` | clienteId, clienteNombre, clienteEmail, items[], subtotal, envio, total, direccion, telefono, notas, estado, creadoEn, actualizadoEn |

## Cómo probar la aplicación

### En la versión publicada

1. Abrir la URL publicada.
2. **Como cliente:** registrarse con cualquier correo (o usar la cuenta de cliente de prueba), agregar velas al
   carrito, confirmar el pedido y revisarlo en *Mis pedidos*.
3. **Como administrador:** iniciar sesión con la cuenta de admin de prueba. Desde el menú: *Panel*, *Velas* y *Pedidos*.

**Credenciales de prueba:** se entregan por Moodle. No se publican contraseñas en este repositorio.

### En la computadora

1. Clonar el repositorio.
2. Abrir la carpeta en VS Code y usar la extensión **Live Server** (clic derecho en `index.html` → *Open with Live Server*).
   Los módulos ES no funcionan abriendo el archivo con doble clic.

### Configurar un proyecto de Firebase propio (opcional)

1. Crear un proyecto en Firebase, activar *Authentication → Correo/contraseña* y crear *Firestore*.
2. Copiar la configuración de la app web en `js/config/firebase.js`.
3. Publicar las reglas: `firebase deploy --only firestore:rules`.
4. Registrar un usuario y cambiar su campo `rol` a `admin` en la consola de Firestore.
5. Entrar como admin a *Velas* y presionar **Cargar datos iniciales**.

## Seguridad

- La `apiKey` de Firebase de una app web no es secreta; los datos se protegen con `firestore.rules`.
- Un cliente solo puede crearse a sí mismo como `cliente` y nunca puede cambiar su rol.
- El catálogo es público, pero solo el admin crea, edita o elimina velas. Un cliente solo puede **bajar** el stock (al comprar).
- Cada cliente solo puede leer sus propios pedidos y crearlos a su nombre en estado `pendiente`. Solo el admin cambia estados o elimina pedidos.

## Catálogo y gestión de velas (Helen)

- **Catálogo (`index.html`):** las tarjetas se generan con JavaScript a partir de Firestore. Incluye búsqueda por nombre o aroma,
  filtro por aroma y ordenamiento por precio o nombre (`js/utils/filtros.js`). Las velas agotadas se muestran pero no se pueden agregar.
- **Administración (`admin/productos.html`):** CRUD completo con un mismo formulario para crear y editar, validaciones
  (`js/utils/validaciones.js`), confirmación antes de eliminar, opción de ocultar una vela sin borrarla y aviso de stock bajo.
- **Datos iniciales:** 12 velas en `seed/datos-iniciales.js`, que se cargan con un botón cuando el catálogo está vacío.
