const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Mesa = sequelize.define('Mesa', {
  mesa_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  numero: { 
    type: DataTypes.STRING(10), 
    allowNull: false, 
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  capacidad: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    defaultValue: 4,
    validate: {
      isInt: true,
      min: 1,
      max: 20
    }
  },
  ubicacion: { 
    type: DataTypes.STRING(100),
    validate: {
      len: [0, 100]
    }
  },
  estado: { 
    type: DataTypes.ENUM('disponible', 'ocupada', 'reservada', 'fuera_servicio'),
    defaultValue: 'disponible',
    allowNull: false
  },
  activa: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
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
  tableName: 'mesas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['numero']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['activa']
    }
  ]
});

module.exports = Mesa; 