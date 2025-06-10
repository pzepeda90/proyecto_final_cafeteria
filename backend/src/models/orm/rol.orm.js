const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Rol = sequelize.define('Rol', {
  rol_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Rol; 