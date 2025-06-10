const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Usuario = require('./usuario.orm');
const Producto = require('./producto.orm');

const Resena = sequelize.define('Resena', {
  resena_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  calificacion: { type: DataTypes.INTEGER, allowNull: false },
  comentario: { type: DataTypes.STRING },
  fecha_resena: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'resenas',
  timestamps: false
});

Resena.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Resena.belongsTo(Producto, { foreignKey: 'producto_id' });
Usuario.hasMany(Resena, { foreignKey: 'usuario_id' });
Producto.hasMany(Resena, { foreignKey: 'producto_id' });

module.exports = Resena; 