const ResenaService = require('../services/resena.service');

const resenasController = {
  async getByProductoId(req, res) {
    try {
      const { producto_id } = req.params;
      
      if (!producto_id || isNaN(producto_id)) {
        return res.status(400).json({ 
          mensaje: 'ID de producto inválido' 
        });
      }

      const resenas = await ResenaService.findByProductoId(producto_id);
      
      // Calcular estadísticas de reseñas
      const stats = {
        totalResenas: resenas.length,
        promedioCalificacion: resenas.length > 0 
          ? (resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length).toFixed(1)
          : 0,
        distribucionCalificaciones: {
          5: resenas.filter(r => r.calificacion === 5).length,
          4: resenas.filter(r => r.calificacion === 4).length,
          3: resenas.filter(r => r.calificacion === 3).length,
          2: resenas.filter(r => r.calificacion === 2).length,
          1: resenas.filter(r => r.calificacion === 1).length
        }
      };

      res.json({
        resenas,
        stats
      });
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor al obtener reseñas' 
      });
    }
  },

  async create(req, res) {
    try {
      const { producto_id } = req.params;
      const { calificacion, comentario } = req.body;
      const usuario_id = req.usuario.usuario_id;

      // Validaciones
      if (!producto_id || isNaN(producto_id)) {
        return res.status(400).json({ 
          mensaje: 'ID de producto inválido' 
        });
      }

      if (!calificacion || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ 
          mensaje: 'La calificación debe ser un número entre 1 y 5' 
        });
      }

      // Verificar si el usuario ya dejó una reseña para este producto
      const resenaExistente = await ResenaService.findByUsuarioAndProducto(usuario_id, producto_id);
      if (resenaExistente) {
        return res.status(409).json({ 
          mensaje: 'Ya has dejado una reseña para este producto. Puedes editarla si lo deseas.' 
        });
      }

      const nuevaResena = await ResenaService.create({
        usuario_id,
        producto_id: parseInt(producto_id),
        calificacion: parseInt(calificacion),
        comentario: comentario || null
      });

      res.status(201).json({
        mensaje: 'Reseña creada exitosamente',
        resena: nuevaResena
      });
    } catch (error) {
      console.error('Error al crear reseña:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor al crear reseña' 
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { calificacion, comentario } = req.body;
      const usuario_id = req.usuario.usuario_id;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          mensaje: 'ID de reseña inválido' 
        });
      }

      // Verificar que la reseña existe y pertenece al usuario
      const resenaExistente = await ResenaService.findById(id);
      if (!resenaExistente) {
        return res.status(404).json({ 
          mensaje: 'Reseña no encontrada' 
        });
      }

      if (resenaExistente.usuario_id !== usuario_id) {
        return res.status(403).json({ 
          mensaje: 'No tienes permisos para editar esta reseña' 
        });
      }

      // Validar calificación si se proporciona
      if (calificacion && (calificacion < 1 || calificacion > 5)) {
        return res.status(400).json({ 
          mensaje: 'La calificación debe ser un número entre 1 y 5' 
        });
      }

      const resenaActualizada = await ResenaService.update(id, {
        calificacion: calificacion ? parseInt(calificacion) : undefined,
        comentario
      });

      res.json({
        mensaje: 'Reseña actualizada exitosamente',
        resena: resenaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor al actualizar reseña' 
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario.usuario_id;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          mensaje: 'ID de reseña inválido' 
        });
      }

      // Verificar que la reseña existe y pertenece al usuario
      const resenaExistente = await ResenaService.findById(id);
      if (!resenaExistente) {
        return res.status(404).json({ 
          mensaje: 'Reseña no encontrada' 
        });
      }

      if (resenaExistente.usuario_id !== usuario_id) {
        return res.status(403).json({ 
          mensaje: 'No tienes permisos para eliminar esta reseña' 
        });
      }

      await ResenaService.delete(id);

      res.json({
        mensaje: 'Reseña eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor al eliminar reseña' 
      });
    }
  },

  async getMisResenas(req, res) {
    try {
      const usuario_id = req.usuario.usuario_id;
      const resenas = await ResenaService.findByUsuarioId(usuario_id);
      
      res.json({
        resenas
      });
    } catch (error) {
      console.error('Error al obtener mis reseñas:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor al obtener reseñas' 
      });
    }
  }
};

module.exports = resenasController; 