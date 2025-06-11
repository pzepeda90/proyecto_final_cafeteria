import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, logout } from '../store/slices/authSlice';
import { showSuccess, showError, showConfirm } from '../services/notificationService';
import { ROLES } from '../constants/roles';
import AddressManager from '../components/profile/AddressManager';
import Button from '../components/ui/Button';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    fecha_nacimiento: user?.fecha_nacimiento || '',
    ...(user?.role === ROLES.VENDEDOR && {
      rut: user?.rut || '',
      cuenta_bancaria: user?.cuenta_bancaria || '',
      banco: user?.banco || '',
      direccion_local: user?.direccion_local || '',
      horario: user?.horario || '',
      telefono_local: user?.telefono_local || '',
    }),
    ...(user?.role === ROLES.ADMIN && {
      cargo: user?.cargo || '',
      departamento: user?.departamento || '',
    }),
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressesChange = (newAddresses) => {
    setAddresses(newAddresses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado - handleSubmit iniciado');
    console.log('Estado isLoading antes:', isLoading);
    console.log('Datos del formulario:', formData);
    
    setIsLoading(true);

    try {
      // Formatear la fecha al formato requerido yyyy-MM-dd
      const formatearFecha = (fecha) => {
        if (!fecha) return null;
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
      };

      // Solo enviar los campos que el backend espera
      const formattedData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono || null,
        fecha_nacimiento: formatearFecha(formData.fecha_nacimiento),
        ...(user?.role === ROLES.VENDEDOR && {
          rut: formData.rut,
          cuenta_bancaria: formData.cuenta_bancaria,
          banco: formData.banco,
          direccion_local: formData.direccion_local,
          horario: formData.horario,
          telefono_local: formData.telefono_local,
        }),
        ...(user?.role === ROLES.ADMIN && {
          cargo: formData.cargo,
          departamento: formData.departamento,
        }),
      };

      console.log('Datos a enviar:', formattedData);
      console.log('URL del endpoint:', `${import.meta.env.VITE_API_BASE_URL}/usuarios/perfil`);
      console.log('Token:', localStorage.getItem('token'));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formattedData),
      });

      console.log('Respuesta del servidor - status:', response.status);
      console.log('Respuesta del servidor - ok:', response.ok);

      if (response.status === 401) {
        console.log('Error 401 - Sesión expirada');
        showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        dispatch(logout());
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(errorText || 'Error al actualizar perfil');
      }

      const data = await response.json();
      console.log('Respuesta del servidor exitosa:', data);

      // Actualizar el estado local con los datos del servidor
      dispatch(updateProfile({ 
        ...user,
        ...data.usuario
      }));
      
      console.log('Perfil actualizado en Redux');
      showSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
      console.log('Estado de edición cambiado a false');
      
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      showError(error.message || 'Error al actualizar perfil');
    } finally {
      console.log('Finalizando handleSubmit, cambiando isLoading a false');
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
        apellido: user?.apellido || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        fecha_nacimiento: user?.fecha_nacimiento || '',
        ...(user?.role === ROLES.VENDEDOR && {
          rut: user?.rut || '',
          cuenta_bancaria: user?.cuenta_bancaria || '',
          banco: user?.banco || '',
          direccion_local: user?.direccion_local || '',
          horario: user?.horario || '',
          telefono_local: user?.telefono_local || '',
        }),
        ...(user?.role === ROLES.ADMIN && {
          cargo: user?.cargo || '',
          departamento: user?.departamento || '',
        }),
      });
      setIsEditing(false);
    }
  };

  // Cargar direcciones al inicio
  useEffect(() => {
    let isMounted = true;
    
    const fetchAddresses = async () => {
      if (!user || !localStorage.getItem('token')) {
        console.log('No hay usuario autenticado o token');
        return;
      }

      try {
        console.log('Cargando direcciones...');
        console.log('URL de la API:', `${import.meta.env.VITE_API_BASE_URL}/usuarios/direcciones`);
        console.log('Token:', localStorage.getItem('token'));
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/direcciones`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        console.log('Respuesta del servidor (direcciones):', response.status, response.statusText);
        
        if (response.status === 401) {
          showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          dispatch(logout());
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', errorText);
          throw new Error(errorText || 'Error al cargar direcciones');
        }

        const direcciones = await response.json();
        console.log('Direcciones cargadas (raw):', direcciones);
        
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          // Asegurarnos de que direcciones sea un array
          const direccionesArray = Array.isArray(direcciones) ? direcciones : 
                                 direcciones.direcciones ? direcciones.direcciones : [];
          
          setAddresses(direccionesArray);
          console.log('Direcciones establecidas en el estado:', direccionesArray);
        }
      } catch (error) {
        console.error('Error al cargar direcciones:', error);
        if (isMounted) {
          showError('Error al cargar las direcciones');
        }
      }
    };

    fetchAddresses();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, dispatch]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Mi Perfil
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {ROLES[user?.role]}
              </p>
            </div>
          </div>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
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
                  required
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento ? (() => {
                      try {
                        const date = new Date(formData.fecha_nacimiento);
                        return date.toISOString().split('T')[0];
                      } catch (error) {
                        console.error('Error al formatear fecha:', error);
                        return '';
                      }
                    })() : ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <AddressManager
                addresses={addresses}
                onAddressesChange={handleAddressesChange}
                isEditing={isEditing}
                showAllAddresses={showAllAddresses}
                onShowAllAddressesChange={setShowAllAddresses}
              />
            </div>

            {user?.role === ROLES.VENDEDOR && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Vendedor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                      RUT
                    </label>
                    <input
                      type="text"
                      id="rut"
                      name="rut"
                      value={formData.rut}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="cuenta_bancaria" className="block text-sm font-medium text-gray-700">
                      Cuenta Bancaria
                    </label>
                    <input
                      type="text"
                      id="cuenta_bancaria"
                      name="cuenta_bancaria"
                      value={formData.cuenta_bancaria}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="banco" className="block text-sm font-medium text-gray-700">
                      Banco
                    </label>
                    <input
                      type="text"
                      id="banco"
                      name="banco"
                      value={formData.banco}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="direccion_local" className="block text-sm font-medium text-gray-700">
                      Dirección del Local
                    </label>
                    <input
                      type="text"
                      id="direccion_local"
                      name="direccion_local"
                      value={formData.direccion_local}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="horario" className="block text-sm font-medium text-gray-700">
                      Horario
                    </label>
                    <input
                      type="text"
                      id="horario"
                      name="horario"
                      value={formData.horario}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                      placeholder="Ej: Lun-Vie 9:00-18:00"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono_local" className="block text-sm font-medium text-gray-700">
                      Teléfono del Local
                    </label>
                    <input
                      type="tel"
                      id="telefono_local"
                      name="telefono_local"
                      value={formData.telefono_local}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {user?.role === ROLES.ADMIN && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Administrativa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                      Cargo
                    </label>
                    <input
                      type="text"
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                      Departamento
                    </label>
                    <input
                      type="text"
                      id="departamento"
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="border-t pt-6 mt-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {console.log('Profile - Estado del botón desplegar:', {
                    addressesLength: addresses.length,
                    showAllAddresses: showAllAddresses,
                    addresses: addresses
                  })}
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botón desplegar clickeado');
                        console.log('showAllAddresses antes del click:', showAllAddresses);
                        const newValue = !showAllAddresses;
                        console.log('Nuevo valor de showAllAddresses:', newValue);
                        setShowAllAddresses(newValue);
                        console.log('setShowAllAddresses ejecutado con:', newValue);
                      }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 bg-transparent hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      {showAllAddresses ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span>Mostrar menos</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>Ver direcciones ({addresses.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isLoading}
                        disabled={isLoading}
                        form="profile-form"
                        onClick={(e) => {
                          console.log('Botón Guardar clickeado');
                          console.log('Tipo de evento:', e.type);
                          console.log('Target:', e.target);
                          // No prevenir el default aquí para que el submit funcione
                        }}
                      >
                        {!isLoading && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 