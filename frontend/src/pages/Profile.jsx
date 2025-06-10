import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { showSuccess, showError, showConfirm } from '../services/notificationService';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí irá la llamada a la API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      dispatch(updateProfile(data));
      showSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      showError(error.message || 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = async () => {
    const shouldCancel = await showConfirm({
      title: '¿Cancelar edición?',
      text: 'Se perderán los cambios no guardados',
      confirmButtonText: 'Sí, cancelar',
    });

    if (shouldCancel) {
      setFormData({
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        direccion: user?.direccion || '',
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Mi Perfil
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500"
            >
              Editar Perfil
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              disabled={!isEditing}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
            />
          </div>

          {isEditing && (
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile; 