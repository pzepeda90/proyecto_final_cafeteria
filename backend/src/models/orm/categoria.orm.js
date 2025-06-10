const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Categoria = sequelize.define('Categoria', {
  categoria_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.STRING },
  imagen_url: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'categorias',
  timestamps: false
});

module.exports = Categoria; 