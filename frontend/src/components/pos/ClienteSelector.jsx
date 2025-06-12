import { useState, useEffect, useRef } from 'react';
import ClientesService from '../../services/clientesService';
import { showError } from '../../services/notificationService';

const ClienteSelector = ({ 
  selectedCliente, 
  onClienteSelect, 
  placeholder = "Buscar cliente...",
  allowCreate = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClienteData, setNewClienteData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  });
  
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (selectedCliente) {
      setSearchTerm(selectedCliente.nombreCompleto || `${selectedCliente.nombre} ${selectedCliente.apellido}`);
    }
  }, [selectedCliente]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Buscar después de 300ms de inactividad
    searchTimeoutRef.current = setTimeout(() => {
      searchClientes(value);
    }, 300);
  };

  const searchClientes = async (term) => {
    if (!term || term.trim().length < 2) {
      setClientes([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await ClientesService.searchClientes(term);
      setClientes(results);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      showError('Error al buscar clientes');
      setClientes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClienteSelect = (cliente) => {
    setSearchTerm(cliente.nombreCompleto);
    setShowDropdown(false);
    setShowCreateForm(false);
    onClienteSelect(cliente);
  };

  const handleCreateCliente = async () => {
    // Validaciones básicas
    if (!newClienteData.nombre.trim()) {
      showError('El nombre es obligatorio');
      return;
    }

    // Validar email si se proporciona
    if (newClienteData.email && newClienteData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClienteData.email.trim())) {
        showError('El formato del email no es válido');
        return;
      }
    }

    // Validar teléfono si se proporciona
    if (newClienteData.telefono && newClienteData.telefono.trim()) {
      const telefonoRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
      if (!telefonoRegex.test(newClienteData.telefono.trim())) {
        showError('El formato del teléfono no es válido');
        return;
      }
    }

    try {
      const nuevoCliente = await ClientesService.createClienteRapido(newClienteData);
      handleClienteSelect(nuevoCliente);
      setNewClienteData({ nombre: '', apellido: '', telefono: '', email: '' });
      setShowCreateForm(false);
    } catch (error) {
      showError(error.message);
    }
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    setNewClienteData({ ...newClienteData, nombre: searchTerm });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isSearching && (
            <div className="px-3 py-2 text-gray-500 text-center">
              Buscando...
            </div>
          )}

          {!isSearching && clientes.length === 0 && searchTerm.length >= 2 && (
            <div className="px-3 py-2 text-gray-500">
              No se encontraron clientes
              {allowCreate && (
                <button
                  onClick={handleShowCreateForm}
                  className="block w-full mt-2 px-3 py-2 text-left text-primary hover:bg-gray-50 rounded"
                >
                  + Crear nuevo cliente "{searchTerm}"
                </button>
              )}
            </div>
          )}

          {!isSearching && clientes.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => handleClienteSelect(cliente)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{cliente.nombreCompleto}</div>
              <div className="text-sm text-gray-500">
                {cliente.telefono && `Tel: ${cliente.telefono}`}
                {cliente.telefono && cliente.email && ' • '}
                {cliente.email}
              </div>
            </button>
          ))}

          {showCreateForm && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <h4 className="font-medium mb-2">Crear nuevo cliente</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nombre *"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  value={newClienteData.nombre}
                  onChange={(e) => setNewClienteData({ ...newClienteData, nombre: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  value={newClienteData.apellido}
                  onChange={(e) => setNewClienteData({ ...newClienteData, apellido: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  value={newClienteData.telefono}
                  onChange={(e) => setNewClienteData({ ...newClienteData, telefono: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  value={newClienteData.email}
                  onChange={(e) => setNewClienteData({ ...newClienteData, email: e.target.value })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCliente}
                    className="flex-1 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClienteSelector; 