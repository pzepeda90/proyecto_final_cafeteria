const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Usuario = require('./usuario.orm');
const Direccion = require('./direccion.orm');
const MetodoPago = require('./metodo_pago.orm');
const Carrito = require('./carrito.orm');
const EstadoPedido = require('./estado_pedido.orm');

const Pedido = sequelize.define('Pedido', {
  pedido_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  usuario_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  direccion_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'direcciones',
      key: 'direccion_id'
    }
  },
  metodo_pago_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'metodos_pago',
      key: 'metodo_pago_id'
    }
  },
  carrito_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'carritos',
      key: 'carrito_id'
    }
  },
  estado_pedido_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'estados_pedido',
      key: 'estado_pedido_id'
    },
    defaultValue: 1 // Asumiendo que 1 es el estado "Pendiente"
  },
  subtotal: { 
    type: DataTypes.DECIMAL(10,2), 
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  impuestos: { 
    type: DataTypes.DECIMAL(10,2), 
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  total: { 
    type: DataTypes.DECIMAL(10,2), 
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  fecha_pedido: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW
  },
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  updated_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: 'pedidos',
  timestamps: false,
  indexes: [
    {
      fields: ['usuario_id']
    },
    {
      fields: ['direccion_id']
    },
    {
      fields: ['metodo_pago_id']
    },
    {
      fields: ['carrito_id']
    },
    {
      fields: ['estado_pedido_id']
    }
  ]
});

Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Direccion, { foreignKey: 'direccion_id' });
Pedido.belongsTo(MetodoPago, { foreignKey: 'metodo_pago_id' });
Pedido.belongsTo(Carrito, { foreignKey: 'carrito_id' });
Pedido.belongsTo(EstadoPedido, { foreignKey: 'estado_pedido_id' });
Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Direccion.hasMany(Pedido, { foreignKey: 'direccion_id' });
MetodoPago.hasMany(Pedido, { foreignKey: 'metodo_pago_id' });
Carrito.hasMany(Pedido, { foreignKey: 'carrito_id' });
EstadoPedido.hasMany(Pedido, { foreignKey: 'estado_pedido_id' });

module.exports = Pedido; 