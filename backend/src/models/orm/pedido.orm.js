const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Usuario = require('./usuario.orm');
const Direccion = require('./direccion.orm');
const MetodoPago = require('./metodo_pago.orm');
const EstadoPedido = require('./estado_pedido.orm');

const Pedido = sequelize.define('Pedido', {
  pedido_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  numero_pedido: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  usuario_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vendedores', 
      key: 'vendedor_id'
    }
  },
  estado_pedido_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'estados_pedido',
      key: 'estado_pedido_id'
    },
    defaultValue: 1
  },
  metodo_pago_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'metodos_pago',
      key: 'metodo_pago_id'
    }
  },
  direccion_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'direcciones',
      key: 'direccion_id'
    }
  },
  mesa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'mesas',
      key: 'mesa_id'
    }
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
    defaultValue: 0.00,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  descuento: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    defaultValue: 0.00,
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
  fecha_entrega_estimada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_entrega_real: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_entrega: {
    type: DataTypes.ENUM('local', 'domicilio', 'takeaway', 'dine_in'),
    allowNull: true,
    defaultValue: 'local'
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
      fields: ['vendedor_id']
    },
    {
      fields: ['direccion_id']
    },
    {
      fields: ['mesa_id']
    },
    {
      fields: ['metodo_pago_id']
    },
    {
      fields: ['estado_pedido_id']
    },
    {
      fields: ['numero_pedido']
    },
    {
      fields: ['fecha_pedido']
    }
  ]
});

// Asociaciones
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Direccion, { foreignKey: 'direccion_id' });
Pedido.belongsTo(MetodoPago, { foreignKey: 'metodo_pago_id' });
Pedido.belongsTo(EstadoPedido, { foreignKey: 'estado_pedido_id' });

// Solo definir asociaciones si las tablas existen
if (require('./mesa.orm')) {
  const Mesa = require('./mesa.orm');
  Pedido.belongsTo(Mesa, { foreignKey: 'mesa_id' });
  Mesa.hasMany(Pedido, { foreignKey: 'mesa_id' });
}

// Relaciones inversas
Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Direccion.hasMany(Pedido, { foreignKey: 'direccion_id' });
MetodoPago.hasMany(Pedido, { foreignKey: 'metodo_pago_id' });
EstadoPedido.hasMany(Pedido, { foreignKey: 'estado_pedido_id' });

module.exports = Pedido; 