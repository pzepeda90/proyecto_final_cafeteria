import { useState, useEffect } from 'react';
import { showSuccess, showError } from '../../services/notificationService';
import Swal from 'sweetalert2';

const AddressManager = ({ addresses = [], onAddressesChange, isEditing, showAllAddresses, onShowAllAddressesChange }) => {
  const [newAddress, setNewAddress] = useState({
    calle: '',
    numero: '',
    comuna: '',
    ciudad: '',
    codigo_postal: '',
    pais: 'Chile',
    principal: false,
  });

  // Determinar qué direcciones mostrar
  const visibleAddresses = showAllAddresses ? addresses : addresses.slice(0, 1);
  
  console.log('AddressManager - Estado actual:', {
    addresses: addresses,
    addressesLength: addresses.length,
    showAllAddresses: showAllAddresses,
    visibleAddresses: visibleAddresses,
    visibleAddressesLength: visibleAddresses.length
  });

  // Efecto para resetear showAllAddresses cuando cambian las direcciones
  useEffect(() => {
    if (addresses.length <= 1) {
      onShowAllAddressesChange(false);
    }
  }, [addresses, onShowAllAddressesChange]);

  const handleAddAddress = async () => {
    if (!newAddress.calle || !newAddress.numero || !newAddress.comuna || !newAddress.ciudad) {
      showError('Por favor completa los campos obligatorios: Calle, Número, Comuna y Ciudad');
      return;
    }

    try {
      console.log('Intentando agregar dirección:', newAddress);

      // Si la nueva dirección será principal, confirmar con el usuario
      if (newAddress.principal && addresses.some(addr => addr.principal)) {
        const result = await Swal.fire({
          title: '¿Cambiar dirección principal?',
          text: 'Ya existe una dirección principal. ¿Deseas cambiarla?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#78350f',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Sí, cambiar',
          cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) {
          console.log('Usuario canceló el cambio de dirección principal');
          setNewAddress({ ...newAddress, principal: false });
          return;
        }
      }

      const requestData = {
        calle: newAddress.calle,
        numero: newAddress.numero,
        ciudad: newAddress.ciudad || 'Santiago',
        comuna: newAddress.comuna,
        codigo_postal: newAddress.codigo_postal || '0000000',
        pais: newAddress.pais || 'Chile',
        principal: newAddress.principal
      };

      console.log('Enviando datos al servidor:', requestData);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/direcciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        throw new Error(errorData.mensaje || errorData.message || 'Error al agregar dirección');
      }

      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);
      console.log('Dirección recibida:', data.direccion);
      console.log('Direcciones actuales antes de agregar:', addresses);
      
      // Actualizar la lista de direcciones
      const updatedAddresses = [...addresses, data.direccion];
      console.log('Direcciones después de agregar:', updatedAddresses);
      onAddressesChange(updatedAddresses);
      showSuccess('Dirección agregada correctamente');
      
      // Limpiamos el formulario
      setNewAddress({
        calle: '',
        numero: '',
        comuna: '',
        ciudad: '',
        codigo_postal: '',
        pais: 'Chile',
        principal: false,
      });

      // Si hay más de una dirección, mostramos todas
      if (updatedAddresses.length > 1) {
        onShowAllAddressesChange(true);
      }
    } catch (error) {
      console.error('Error al agregar dirección:', error);
      showError(error.message || 'Error al agregar dirección');
    }
  };

  const handleUpdateAddress = async (id, field, value) => {
    try {
      console.log('Intentando actualizar dirección:', { id, field, value });

      const updatedAddress = addresses.find(addr => addr.direccion_id === id);
      if (!updatedAddress) {
        console.error('No se encontró la dirección a actualizar');
        return;
      }

      // Si estamos actualizando el campo principal, usamos la función específica
      if (field === 'principal') {
        console.log('Actualizando dirección principal');
        await handleSetMainAddress(id);
        return;
      }

      const updatedData = {
        ...updatedAddress,
        [field]: value
      };

      console.log('Enviando datos de actualización:', updatedData);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/direcciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        throw new Error(errorData.mensaje || errorData.message || 'Error al actualizar dirección');
      }

      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);

      // Actualizamos la dirección en el estado local
      const updatedAddresses = addresses.map(addr => 
        addr.direccion_id === id ? { ...addr, ...updatedData } : addr
      );
      onAddressesChange(updatedAddresses);
      showSuccess('Dirección actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      showError(error.message || 'Error al actualizar dirección');
    }
  };

  const handleRemoveAddress = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar dirección?',
        text: '¿Estás seguro de que deseas eliminar esta dirección?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/direcciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        throw new Error(errorData.mensaje || errorData.message || 'Error al eliminar dirección');
      }

      const updatedAddresses = addresses.filter(addr => addr.direccion_id !== id);
      onAddressesChange(updatedAddresses);
      showSuccess('Dirección eliminada correctamente');
    } catch (error) {
      showError(error.message || 'Error al eliminar dirección');
    }
  };

  const handleSetMainAddress = async (id) => {
    try {
      console.log('Intentando establecer dirección principal:', id);

      const result = await Swal.fire({
        title: '¿Cambiar dirección principal?',
        text: '¿Estás seguro de que deseas cambiar la dirección principal?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#78350f',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        console.log('Usuario canceló el cambio de dirección principal');
        return;
      }

      console.log('Enviando solicitud para cambiar dirección principal');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/direcciones/${id}/principal`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Respuesta del servidor (dirección principal):', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        throw new Error(errorData.mensaje || errorData.message || 'Error al establecer dirección principal');
      }

      const data = await response.json();
      console.log('Datos recibidos del servidor (dirección principal):', data);
      
      // El backend devuelve todas las direcciones actualizadas
      if (data.direcciones && Array.isArray(data.direcciones)) {
        console.log('Usando direcciones actualizadas del servidor:', data.direcciones);
        onAddressesChange(data.direcciones);
      } else {
        // Fallback: actualizar localmente si el servidor no devuelve las direcciones
        console.log('Fallback: actualizando direcciones localmente');
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          principal: addr.direccion_id == id
        }));
        console.log('Direcciones actualizadas localmente:', updatedAddresses);
        onAddressesChange(updatedAddresses);
      }
      
      showSuccess('Dirección principal actualizada');

      // Reseteamos el estado de nueva dirección si estaba marcada como principal
      if (newAddress.principal) {
        console.log('Reseteando estado de nueva dirección');
        setNewAddress({
          ...newAddress,
          principal: false
        });
      }
    } catch (error) {
      console.error('Error al establecer dirección principal:', error);
      showError(error.message || 'Error al establecer dirección principal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Mis Direcciones</h3>
      </div>
      
      {/* Lista de direcciones existentes */}
      <div className="space-y-4">
        {visibleAddresses.map((address) => (
          <div key={address.direccion_id} className={`border rounded-lg p-4 space-y-4 ${address.principal ? 'bg-brown-50 border-brown-200' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Calle</label>
                <input
                  type="text"
                  value={address.calle || ''}
                  onChange={(e) => handleUpdateAddress(address.direccion_id, 'calle', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={address.numero || ''}
                  onChange={(e) => handleUpdateAddress(address.direccion_id, 'numero', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comuna</label>
                <input
                  type="text"
                  value={address.comuna || ''}
                  onChange={(e) => handleUpdateAddress(address.direccion_id, 'comuna', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  type="text"
                  value={address.ciudad || ''}
                  onChange={(e) => handleUpdateAddress(address.direccion_id, 'ciudad', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                <input
                  type="text"
                  value={address.codigo_postal || ''}
                  onChange={(e) => handleUpdateAddress(address.direccion_id, 'codigo_postal', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">País</label>
                <input
                  type="text"
                  value={address.pais || 'Chile'}
                  onChange={(e) => handleUpdateAddress(address.direccion_id, 'pais', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 disabled:bg-gray-100"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`principal-${address.direccion_id}`}
                  name="direccion_principal_grupo"
                  checked={address.principal}
                  onChange={() => handleSetMainAddress(address.direccion_id)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded-full"
                />
                <label htmlFor={`principal-${address.direccion_id}`} className="ml-2 text-sm text-gray-700">
                  {address.principal ? '✓ Dirección Principal' : 'Establecer como Principal'}
                </label>
              </div>
              {isEditing && !address.principal && (
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(address.direccion_id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  title="Eliminar dirección"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para agregar nueva dirección */}
      {isEditing && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Agregar Nueva Dirección</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calle *</label>
              <input
                type="text"
                value={newAddress.calle}
                onChange={(e) => setNewAddress({ ...newAddress, calle: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número *</label>
              <input
                type="text"
                value={newAddress.numero}
                onChange={(e) => setNewAddress({ ...newAddress, numero: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comuna *</label>
              <input
                type="text"
                value={newAddress.comuna}
                onChange={(e) => setNewAddress({ ...newAddress, comuna: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ciudad *</label>
              <input
                type="text"
                value={newAddress.ciudad}
                onChange={(e) => setNewAddress({ ...newAddress, ciudad: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Postal</label>
              <input
                type="text"
                value={newAddress.codigo_postal}
                onChange={(e) => setNewAddress({ ...newAddress, codigo_postal: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">País</label>
              <input
                type="text"
                value={newAddress.pais}
                onChange={(e) => setNewAddress({ ...newAddress, pais: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nueva-direccion-principal"
                checked={newAddress.principal}
                onChange={(e) => setNewAddress({ ...newAddress, principal: e.target.checked })}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="nueva-direccion-principal" className="text-sm text-gray-700">
                Establecer como dirección principal
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddAddress}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
            >
              Agregar Dirección
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager; 