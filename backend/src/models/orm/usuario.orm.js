const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Usuario = sequelize.define('Usuario', {
  usuario_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  apellido: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  telefono: { 
    type: DataTypes.STRING,
    validate: {
      is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/
    }
  },
  fecha_nacimiento: { 
    type: DataTypes.DATE,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0]
    }
  },
  fecha_registro: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'usuarios',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = Usuario; 