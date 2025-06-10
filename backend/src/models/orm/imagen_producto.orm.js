const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Producto = require('./producto.orm');

const ImagenProducto = sequelize.define('ImagenProducto', {
  imagen_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.STRING },
  orden: { type: DataTypes.INTEGER, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'imagenes_producto',
  timestamps: false
});

ImagenProducto.belongsTo(Producto, { foreignKey: 'producto_id' });
Producto.hasMany(ImagenProducto, { foreignKey: 'producto_id' });

module.exports = ImagenProducto; 