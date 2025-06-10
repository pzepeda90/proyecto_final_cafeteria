const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Vendedor = sequelize.define('Vendedor', {
  vendedor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING },
  fecha_contratacion: { type: DataTypes.DATE },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'vendedores',
  timestamps: false
});

module.exports = Vendedor; 