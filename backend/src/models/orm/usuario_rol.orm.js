const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const UsuarioRol = sequelize.define('UsuarioRol', {
  usuario_rol_id: { 
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
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  rol_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'roles',
      key: 'rol_id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  }
}, {
  tableName: 'usuario_rol',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'rol_id']
    },
    {
      fields: ['usuario_id']
    },
    {
      fields: ['rol_id']
    }
  ]
});

module.exports = UsuarioRol; 