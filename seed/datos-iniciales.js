// Datos iniciales del catálogo, tomados del catálogo de Luz y Aroma.
// Se cargan desde admin/productos.html con el botón "Cargar datos iniciales"
// (solo aparece cuando la colección está vacía). Las fotos están en img/velas/.
// El precio es el de cera de soya; el de parafina se menciona en la descripción.
// Hay a propósito una vela agotada y varias con stock bajo para demostrar esas reglas.
const IMG = "https://luz-y-aroma.web.app/img/velas/";

export const VELAS_INICIALES = [
  { nombre: "Rosa grande", aroma: "Rosa", tamano: "grande", precio: 2.5, stock: 20, activo: true, imagenUrl: IMG + "rosa-grande.jpg",
    descripcion: "Vela en forma de rosa abierta. Mide 4.5 cm de ancho y 4 cm de alto. También en parafina por $2.00." },
  { nombre: "Rosa mediana", aroma: "Frutos rojos", tamano: "mediana", precio: 2, stock: 25, activo: true, imagenUrl: IMG + "rosa-mediana.jpg",
    descripcion: "Rosa roja de pétalos marcados. Mide 4 cm de ancho y 3 cm de alto. También en parafina por $1.50." },
  { nombre: "Rosa pequeña", aroma: "Vainilla", tamano: "pequena", precio: 1.5, stock: 30, activo: true, imagenUrl: IMG + "rosa-pequena.jpg",
    descripcion: "Rosa blanca pequeña, ideal para detalles y recuerdos. Mide 3.5 cm de ancho y 2 cm de alto. También en parafina por $1.00." },
  { nombre: "Girasol", aroma: "Cítricos", tamano: "mediana", precio: 3, stock: 15, activo: true, imagenUrl: IMG + "girasol.jpg",
    descripcion: "Vela flotante en forma de girasol. Mide 5.5 cm de ancho y 2.3 cm de alto. También en parafina por $2.50." },
  { nombre: "Tulipán", aroma: "Rosa", tamano: "pequena", precio: 2, stock: 18, activo: true, imagenUrl: IMG + "tulipan.jpg",
    descripcion: "Tulipán de cera rosado, delicado y elegante. Mide 3.5 cm de ancho y 4.5 cm de alto. También en parafina por $1.50." },
  { nombre: "Ramo de tulipanes", aroma: "Coco", tamano: "grande", precio: 4.5, stock: 8, activo: true, imagenUrl: IMG + "ramo-de-tulipanes.jpg",
    descripcion: "Ramo de tulipanes blancos sobre base de tronco. Mide 5.5 cm de ancho y 10 cm de alto. También en parafina por $3.50." },
  { nombre: "Margaritas", aroma: "Lavanda", tamano: "pequena", precio: 1.75, stock: 22, activo: true, imagenUrl: IMG + "margaritas.jpg",
    descripcion: "Margarita amarilla flotante. Mide 5.5 cm de ancho y 1.5 cm de alto. También en parafina por $1.25." },
  { nombre: "Peonías", aroma: "Frutos rojos", tamano: "mediana", precio: 3, stock: 12, activo: true, imagenUrl: IMG + "peonias.jpg",
    descripcion: "Peonía roja de muchos pétalos. Mide 6 cm de ancho y 2.5 cm de alto. También en parafina por $2.50." },
  { nombre: "Pino de niveles grande", aroma: "Sándalo", tamano: "grande", precio: 7, stock: 3, activo: true, imagenUrl: IMG + "pino-de-niveles-grande.jpg",
    descripcion: "Pino verde de varios niveles, ideal para decorar en Navidad. Mide 7 cm de ancho y 11.5 cm de alto. También en parafina por $6.00." },
  { nombre: "Huellas grandes", aroma: "Canela", tamano: "mediana", precio: 3, stock: 10, activo: true, imagenUrl: IMG + "huellas-grandes.jpg",
    descripcion: "Vela en forma de huellita, perfecta para amantes de las mascotas. Mide 5.5 cm de ancho y 2.5 cm de alto. También en parafina por $2.50." },
  { nombre: "Astronauta", aroma: "Eucalipto", tamano: "mediana", precio: 3.5, stock: 0, activo: true, imagenUrl: IMG + "astronauta.jpg",
    descripcion: "Astronauta de cera sentado sobre la luna. Mide 4.5 cm de ancho y 8 cm de alto. También en parafina por $3.00." },
  { nombre: "Pareja de novios", aroma: "Vainilla", tamano: "grande", precio: 4.5, stock: 4, activo: true, imagenUrl: IMG + "pareja-de-novios.jpg",
    descripcion: "Pareja de novios abrazados, ideal para bodas y aniversarios. Mide 6 cm de ancho y 10 cm de alto. También en parafina por $3.50." }
];