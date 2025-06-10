const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Usuario = require('./usuario.orm');

const Direccion = sequelize.define('Direccion', {
  direccion_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  calle: { type: DataTypes.STRING, allowNull: false },
  numero: { type: DataTypes.STRING },
  ciudad: { type: DataTypes.STRING, allowNull: false },
  comuna: { type: DataTypes.STRING },
  codigo_postal: { type: DataTypes.STRING },
  pais: { type: DataTypes.STRING },
  principal: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'direcciones',
  timestamps: false
});

Direccion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Direccion, { foreignKey: 'usuario_id' });

module.exports = Direccion; 