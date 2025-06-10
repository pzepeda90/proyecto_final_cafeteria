const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Categoria = require('./categoria.orm');
const Vendedor = require('./vendedor.orm');

const Producto = sequelize.define('Producto', {
  producto_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  categoria_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'categoria_id'
    }
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  descripcion: { 
    type: DataTypes.TEXT 
  },
  precio: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  imagen_url: { 
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  stock: { 
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      isInt: true,
      min: 0
    }
  },
  disponible: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  vendedor_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'vendedores',
      key: 'vendedor_id'
    }
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'productos',
  timestamps: false,
  indexes: [
    {
      fields: ['categoria_id']
    },
    {
      fields: ['vendedor_id']
    },
    {
      fields: ['nombre']
    }
  ]
});

Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });
Producto.belongsTo(Vendedor, { foreignKey: 'vendedor_id' });
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });
Vendedor.hasMany(Producto, { foreignKey: 'vendedor_id' });

module.exports = Producto; 