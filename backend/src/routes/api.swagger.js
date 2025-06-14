/**
 * Configuración de Swagger para la documentación de la API
 */
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Cafetería El Bandito',
      version: '1.0.0',
      description: 'Documentación de la API para la plataforma de cafetería online',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'desarrollo@cafeteriaelbandito.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'apellido', 'email', 'password'],
          properties: {
            usuario_id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            apellido: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            telefono: {
              type: 'string',
              description: 'Número de teléfono del usuario'
            },
            fecha_nacimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento del usuario'
            },
            fecha_registro: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del usuario'
            },
            activo: {
              type: 'boolean',
              description: 'Indica si el usuario está activo'
            },
            rol_id: {
              type: 'integer',
              description: 'ID del rol asignado al usuario'
            }
          }
        },
        Direccion: {
          type: 'object',
          required: ['calle', 'ciudad', 'codigo_postal', 'pais'],
          properties: {
            direccion_id: {
              type: 'integer',
              description: 'ID único de la dirección'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario propietario de la dirección'
            },
            calle: {
              type: 'string',
              description: 'Nombre de la calle'
            },
            numero: {
              type: 'string',
              description: 'Número de la dirección'
            },
            ciudad: {
              type: 'string',
              description: 'Ciudad'
            },
            comuna: {
              type: 'string',
              description: 'Comuna o municipalidad'
            },
            codigo_postal: {
              type: 'string',
              description: 'Código postal'
            },
            pais: {
              type: 'string',
              description: 'País'
            },
            principal: {
              type: 'boolean',
              description: 'Indica si es la dirección principal'
            }
          }
        },
        Rol: {
          type: 'object',
          required: ['nombre'],
          properties: {
            rol_id: {
              type: 'integer',
              description: 'ID único del rol'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del rol (ej: admin, cliente, vendedor)'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del rol y sus permisos'
            }
          }
        },
        Vendedor: {
          type: 'object',
          required: ['nombre', 'apellido', 'email', 'password'],
          properties: {
            vendedor_id: {
              type: 'integer',
              description: 'ID único del vendedor'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario asociado (si existe)'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del vendedor'
            },
            apellido: {
              type: 'string',
              description: 'Apellido del vendedor'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del vendedor'
            },
            telefono: {
              type: 'string',
              description: 'Número de teléfono del vendedor'
            },
            fecha_contratacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de contratación del vendedor'
            },
            activo: {
              type: 'boolean',
              description: 'Indica si el vendedor está activo'
            }
          }
        },
        Categoria: {
          type: 'object',
          required: ['nombre'],
          properties: {
            categoria_id: {
              type: 'integer',
              description: 'ID único de la categoría'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la categoría'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción de la categoría'
            },
            imagen_url: {
              type: 'string',
              description: 'URL de la imagen de la categoría'
            }
          }
        },
        Producto: {
          type: 'object',
          required: ['nombre', 'precio', 'categoria_id', 'vendedor_id'],
          properties: {
            producto_id: {
              type: 'integer',
              description: 'ID único del producto'
            },
            categoria_id: {
              type: 'integer',
              description: 'ID de la categoría del producto'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del producto'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del producto'
            },
            precio: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto'
            },
            imagen_url: {
              type: 'string',
              description: 'URL de la imagen principal del producto'
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock'
            },
            disponible: {
              type: 'boolean',
              description: 'Indica si el producto está disponible para la venta'
            },
            vendedor_id: {
              type: 'integer',
              description: 'ID del vendedor del producto'
            }
          }
        },
        ImagenProducto: {
          type: 'object',
          required: ['producto_id', 'url'],
          properties: {
            imagen_id: {
              type: 'integer',
              description: 'ID único de la imagen'
            },
            producto_id: {
              type: 'integer',
              description: 'ID del producto al que pertenece la imagen'
            },
            url: {
              type: 'string',
              description: 'URL de la imagen'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción de la imagen'
            },
            orden: {
              type: 'integer',
              description: 'Orden de presentación de la imagen'
            }
          }
        },
        Carrito: {
          type: 'object',
          required: ['usuario_id'],
          properties: {
            carrito_id: {
              type: 'integer',
              description: 'ID único del carrito'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario propietario del carrito'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del carrito'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del carrito'
            }
          }
        },
        DetalleCarrito: {
          type: 'object',
          required: ['carrito_id', 'producto_id', 'cantidad'],
          properties: {
            detalle_carrito_id: {
              type: 'integer',
              description: 'ID único del detalle de carrito'
            },
            carrito_id: {
              type: 'integer',
              description: 'ID del carrito al que pertenece el detalle'
            },
            producto_id: {
              type: 'integer',
              description: 'ID del producto en el carrito'
            },
            cantidad: {
              type: 'integer',
              description: 'Cantidad del producto en el carrito'
            }
          }
        },
        MetodoPago: {
          type: 'object',
          required: ['nombre'],
          properties: {
            metodo_pago_id: {
              type: 'integer',
              description: 'ID único del método de pago'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del método de pago'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del método de pago'
            },
            activo: {
              type: 'boolean',
              description: 'Indica si el método de pago está activo'
            }
          }
        },
        Mesa: {
          type: 'object',
          required: ['numero', 'capacidad'],
          properties: {
            mesa_id: {
              type: 'integer',
              description: 'ID único de la mesa'
            },
            numero: {
              type: 'string',
              description: 'Número identificador de la mesa'
            },
            capacidad: {
              type: 'integer',
              description: 'Capacidad máxima de personas de la mesa'
            },
            ubicacion: {
              type: 'string',
              description: 'Ubicación física de la mesa en el local'
            },
            estado: {
              type: 'string',
              enum: ['disponible', 'ocupada', 'reservada', 'fuera_servicio'],
              description: 'Estado actual de la mesa'
            },
            activa: {
              type: 'boolean',
              description: 'Indica si la mesa está activa en el sistema'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del registro'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del registro'
            }
          }
        },
        EstadoPedido: {
          type: 'object',
          required: ['nombre'],
          properties: {
            estado_pedido_id: {
              type: 'integer',
              description: 'ID único del estado de pedido'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del estado de pedido'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del estado de pedido'
            }
          }
        },
        Pedido: {
          type: 'object',
          required: ['usuario_id', 'estado_pedido_id', 'metodo_pago_id', 'direccion_id', 'subtotal', 'total'],
          properties: {
            pedido_id: {
              type: 'integer',
              description: 'ID único del pedido'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario que realizó el pedido'
            },
            fecha_pedido: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha en que se realizó el pedido'
            },
            estado_pedido_id: {
              type: 'integer',
              description: 'ID del estado actual del pedido'
            },
            subtotal: {
              type: 'number',
              format: 'float',
              description: 'Subtotal del pedido (sin impuestos)'
            },
            impuestos: {
              type: 'number',
              format: 'float',
              description: 'Impuestos aplicados al pedido'
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total del pedido (subtotal + impuestos)'
            },
            metodo_pago_id: {
              type: 'integer',
              description: 'ID del método de pago utilizado'
            },
            direccion_id: {
              type: 'integer',
              description: 'ID de la dirección de entrega'
            },
            carrito_id: {
              type: 'integer',
              description: 'ID del carrito asociado al pedido'
            },
            mesa_id: {
              type: 'integer',
              description: 'ID de la mesa asignada al pedido (para pedidos locales)'
            },
            tipo_entrega: {
              type: 'string',
              enum: ['local', 'domicilio', 'takeaway', 'dine_in'],
              description: 'Tipo de entrega del pedido'
            }
          }
        },
        DetallePedido: {
          type: 'object',
          required: ['pedido_id', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal'],
          properties: {
            detalle_id: {
              type: 'integer',
              description: 'ID único del detalle de pedido'
            },
            pedido_id: {
              type: 'integer',
              description: 'ID del pedido al que pertenece el detalle'
            },
            producto_id: {
              type: 'integer',
              description: 'ID del producto en el detalle'
            },
            cantidad: {
              type: 'integer',
              description: 'Cantidad del producto en el pedido'
            },
            precio_unitario: {
              type: 'number',
              format: 'float',
              description: 'Precio unitario del producto al momento de la compra'
            },
            subtotal: {
              type: 'number',
              format: 'float',
              description: 'Subtotal del detalle (cantidad * precio_unitario)'
            }
          }
        },
        Resena: {
          type: 'object',
          required: ['usuario_id', 'producto_id', 'calificacion'],
          properties: {
            resena_id: {
              type: 'integer',
              description: 'ID único de la reseña'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario que realizó la reseña'
            },
            producto_id: {
              type: 'integer',
              description: 'ID del producto reseñado'
            },
            calificacion: {
              type: 'integer',
              description: 'Calificación del producto (1-5)'
            },
            comentario: {
              type: 'string',
              description: 'Comentario de la reseña'
            },
            fecha_resena: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha en que se realizó la reseña'
            }
          }
        },
        HistorialEstadoPedido: {
          type: 'object',
          required: ['pedido_id', 'estado_pedido_id'],
          properties: {
            historial_id: {
              type: 'integer',
              description: 'ID único del registro de historial'
            },
            pedido_id: {
              type: 'integer',
              description: 'ID del pedido al que pertenece el historial'
            },
            estado_pedido_id: {
              type: 'integer',
              description: 'ID del estado de pedido registrado'
            },
            fecha_cambio: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha del cambio de estado'
            },
            comentario: {
              type: 'string',
              description: 'Comentario opcional sobre el cambio de estado'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Ruta a los archivos con anotaciones de Swagger
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec; 