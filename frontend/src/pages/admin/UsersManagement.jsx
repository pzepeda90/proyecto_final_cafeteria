import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AdminService from '../../services/adminService';

// Datos mock de usuarios
const mockUsers = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@cafe.com', role: 'VENDEDOR', activo: true, telefono: '+56912345678' },
  { id: 2, nombre: 'Ana', apellido: 'López', email: 'ana@cafe.com', role: 'VENDEDOR', activo: true, telefono: '+56987654321' },
  { id: 3, nombre: 'Carlos', apellido: 'Cliente', email: 'carlos@cliente.com', role: 'CLIENTE', activo: true, telefono: '+56911111111' },
  { id: 4, nombre: 'Admin', apellido: 'Sistema', email: 'admin@cafe.com', role: 'ADMIN', activo: true, telefono: '+56900000000' },
];

const allPermissions = [
  { key: 'VER_PEDIDOS', label: 'Ver Pedidos' },
  { key: 'GESTIONAR_PRODUCTOS', label: 'Gestionar Productos' },
  { key: 'GESTIONAR_USUARIOS', label: 'Gestionar Usuarios' },
];

const roles = [
  { key: 'ADMIN', label: 'Administrador' },
  { key: 'VENDEDOR', label: 'Vendedor' },
  { key: 'CLIENTE', label: 'Cliente' },
];

const tabOptions = [
  { key: 'ADMIN', label: 'Administradores' },
  { key: 'VENDEDOR', label: 'Vendedores' },
  { key: 'CLIENTE', label: 'Clientes' },
  { key: 'MESAS', label: 'Mesas' },
];

// Opciones de filtro para mesas
const mesaFilterOptions = [
  { key: 'TODAS', label: 'Todas', color: 'bg-gray-100 text-gray-800' },
  { key: 'LIBRES', label: 'Libres', color: 'bg-green-100 text-green-800' },
  { key: 'OCUPADAS', label: 'Ocupadas', color: 'bg-red-100 text-red-800' },
  { key: 'RESERVADAS', label: 'Reservadas', color: 'bg-blue-100 text-blue-800' },
  { key: 'INABILITADAS', label: 'Inabilitadas', color: 'bg-yellow-100 text-yellow-800' },
];

const UsersManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [mesas, setMesas] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('VENDEDOR');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editMesa, setEditMesa] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [mesaToDelete, setMesaToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mesaFilter, setMesaFilter] = useState('TODAS'); // Filtro para mesas

  // Función para determinar el estado de una mesa
  const getMesaEstado = (mesa) => {
    // La mesa tiene un campo estado en la base de datos
    if (mesa.estado) {
      // Mapear los estados de la BD a nuestros filtros
      const estadoMap = {
        'disponible': 'LIBRES',
        'ocupada': 'OCUPADAS',
        'reservada': 'RESERVADAS',
        'fuera_servicio': 'INABILITADAS'
      };
      return estadoMap[mesa.estado] || 'LIBRES';
    }
    
    return 'LIBRES'; // Por defecto
  };

  // Función para obtener el estilo del estado
  const getMesaEstadoStyle = (estado) => {
    const styles = {
      'LIBRES': 'bg-green-100 text-green-800',
      'OCUPADAS': 'bg-red-100 text-red-800', 
      'RESERVADAS': 'bg-blue-100 text-blue-800',
      'INABILITADAS': 'bg-yellow-100 text-yellow-800'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener el texto del estado
  const getMesaEstadoText = (estado) => {
    const texts = {
      'LIBRES': 'Libre',
      'OCUPADAS': 'Ocupada',
      'RESERVADAS': 'Reservada', 
      'INABILITADAS': 'Inabilitada'
    };
    return texts[estado] || 'Desconocido';
  };



  // Cargar mesas
  const loadMesas = async () => {
    try {
      const mesasData = await AdminService.getMesas();
      // Ordenar las mesas por número antes de guardarlas en el estado
      const mesasOrdenadas = mesasData.sort((a, b) => {
        const numA = parseInt(a.numero) || 0;
        const numB = parseInt(b.numero) || 0;
        return numA - numB;
      });
      setMesas(mesasOrdenadas);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  // Cargar datos al cambiar de tab
  useEffect(() => {
    if (activeTab === 'MESAS') {
      loadMesas();
    }
  }, [activeTab]);

  // Filtros por tab y búsqueda
  const filteredUsers = users.filter(user => {
    const matchesRole = user.role === activeTab;
    const matchesSearch = search
      ? user.nombre.toLowerCase().includes(search.toLowerCase()) || 
        user.apellido.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesRole && matchesSearch;
  });

  const filteredMesas = mesas
    .filter(mesa => {
      const matchesSearch = search
        ? mesa.numero.toString().includes(search.toLowerCase()) ||
          mesa.ubicacion?.toLowerCase().includes(search.toLowerCase()) ||
          mesa.capacidad.toString().includes(search.toLowerCase())
        : true;
      
      // Filtrar por estado
      const matchesFilter = mesaFilter === 'TODAS' || getMesaEstado(mesa) === mesaFilter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Ordenar por número de mesa de forma ascendente
      const numA = parseInt(a.numero) || 0;
      const numB = parseInt(b.numero) || 0;
      return numA - numB;
    });

  // Abrir modal para crear/editar
  const handleOpenModal = (item = null) => {
    if (activeTab === 'MESAS') {
      if (item) {
        setEditMesa(item);
      } else {
        setEditMesa({
          numero: '',
          capacidad: 4,
          ubicacion: '',
          estado: 'disponible'
        });
      }
    } else {
      if (item) {
        setEditUser(item);
      } else {
        setEditUser({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          telefono: '',
          role: activeTab,
          activo: true
        });
      }
    }
    setIsModalOpen(true);
  };

  // Guardar usuario o mesa
  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (activeTab === 'MESAS') {
        console.log('=== INTENTANDO GUARDAR MESA ===');
        console.log('Datos de la mesa:', data);
        
        if (data.mesa_id) {
          // Editar mesa existente
          await AdminService.updateMesa(data.mesa_id, data);
          const mesasActualizadas = mesas.map(m => m.mesa_id === data.mesa_id ? { ...m, ...data } : m);
          // Reordenar después de la edición
          mesasActualizadas.sort((a, b) => {
            const numA = parseInt(a.numero) || 0;
            const numB = parseInt(b.numero) || 0;
            return numA - numB;
          });
          setMesas(mesasActualizadas);
        } else {
          // Crear nueva mesa
          const response = await AdminService.createMesa(data);
          const nuevasMesas = [...mesas, response];
          // Ordenar después de agregar la nueva mesa
          nuevasMesas.sort((a, b) => {
            const numA = parseInt(a.numero) || 0;
            const numB = parseInt(b.numero) || 0;
            return numA - numB;
          });
          setMesas(nuevasMesas);
        }
        setEditMesa(null);
      } else {
        console.log('=== INTENTANDO GUARDAR USUARIO ===');
        console.log('Datos del usuario:', data);
        
        if (data.id) {
          // Editar usuario existente
          if (data.role === 'VENDEDOR') {
            await AdminService.updateVendedor(data.id, data);
          }
          // Actualizar en el estado local
          setUsers(users.map(u => u.id === data.id ? data : u));
        } else {
          // Crear nuevo usuario
          let newUser;
          if (data.role === 'VENDEDOR') {
            console.log('Creando vendedor...');
            const response = await AdminService.createVendedor(data);
            newUser = {
              id: response.vendedor.vendedor_id,
              nombre: response.vendedor.nombre,
              apellido: response.vendedor.apellido,
              email: response.vendedor.email,
              telefono: response.vendedor.telefono,
              role: 'VENDEDOR',
              activo: true
            };
          } else if (data.role === 'CLIENTE') {
            console.log('Creando cliente...');
            const response = await AdminService.createUsuario(data);
            newUser = {
              id: response.user.id,
              nombre: response.user.nombre,
              apellido: response.user.apellido,
              email: response.user.email,
              telefono: data.telefono,
              role: 'CLIENTE',
              activo: true
            };
          }
          
          if (newUser) {
            setUsers([...users, newUser]);
          }
        }
        setEditUser(null);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario o mesa
  const handleDelete = (item) => {
    if (activeTab === 'MESAS') {
      setMesaToDelete(item);
    } else {
      setUserToDelete(item);
    }
  };
  
  const confirmDelete = async () => {
    setLoading(true);
    try {
      if (activeTab === 'MESAS' && mesaToDelete) {
        await AdminService.deleteMesa(mesaToDelete.mesa_id);
        setMesas(mesas.filter(m => m.mesa_id !== mesaToDelete.mesa_id));
        setMesaToDelete(null);
      } else if (userToDelete) {
        if (userToDelete.role === 'VENDEDOR') {
          await AdminService.deleteVendedor(userToDelete.id);
        }
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };
  
  const cancelDelete = () => {
    setUserToDelete(null);
    setMesaToDelete(null);
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Tabs */}
      <div className="mb-4 flex gap-1 sm:gap-2 border-b overflow-x-auto">
        {tabOptions.map(tab => (
          <button
            key={tab.key}
            className={`px-2 sm:px-4 py-2 font-semibold border-b-2 transition-colors duration-200 whitespace-nowrap text-sm sm:text-base ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
            }`}
            onClick={() => { 
              setActiveTab(tab.key); 
              setSearch(''); 
              setMesaFilter('TODAS'); // Reiniciar filtro de mesas
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header y controles */}
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          Gestión de {tabOptions.find(t => t.key === activeTab)?.label}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <input
            type="text"
            placeholder={activeTab === 'MESAS' ? "Buscar por número, ubicación o capacidad..." : "Buscar por nombre, apellido o email..."}
            className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button 
            variant="primary" 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            + Nueva {activeTab === 'MESAS' ? 'Mesa' : (roles.find(r => r.key === activeTab)?.label || 'Item')}
          </Button>
        </div>

        {/* Filtros de estado para mesas */}
        {activeTab === 'MESAS' && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Filtrar por estado:</span>
            {mesaFilterOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setMesaFilter(option.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                  mesaFilter === option.key
                    ? option.color + ' ring-2 ring-primary ring-opacity-50'
                    : 'bg-gray-100 text-gray-600 hover:' + option.color
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabla responsiva */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'MESAS' ? (
          <>
            {/* Vista móvil - Cards para Mesas */}
            <div className="block sm:hidden">
              <div className="divide-y divide-gray-200">
                {filteredMesas.map(mesa => (
                  <div key={mesa.mesa_id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Mesa #{mesa.numero}
                        </h3>
                        <p className="text-sm text-gray-600">Capacidad: {mesa.capacidad} personas</p>
                        {mesa.ubicacion && (
                          <p className="text-sm text-gray-600">Ubicación: {mesa.ubicacion}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getMesaEstadoStyle(getMesaEstado(mesa))
                      }`}>
                        {getMesaEstadoText(getMesaEstado(mesa))}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="info" onClick={() => handleOpenModal(mesa)} className="flex-1">
                        Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(mesa)} className="flex-1">
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista desktop - Tabla para Mesas */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMesas.map(mesa => (
                    <tr key={mesa.mesa_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Mesa #{mesa.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mesa.capacidad} personas</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mesa.ubicacion || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getMesaEstadoStyle(getMesaEstado(mesa))
                        }`}>
                          {getMesaEstadoText(getMesaEstado(mesa))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button size="sm" variant="info" onClick={() => handleOpenModal(mesa)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(mesa)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Vista móvil - Cards para Usuarios */}
            <div className="block sm:hidden">
              <div className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.telefono && (
                          <p className="text-sm text-gray-600">{user.telefono}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="info" onClick={() => handleOpenModal(user)} className="flex-1">
                        Editar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user)} className="flex-1">
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista desktop - Tabla para Usuarios */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.telefono || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button size="sm" variant="info" onClick={() => handleOpenModal(user)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(user)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal para crear/editar usuario o mesa */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={
          activeTab === 'MESAS' 
            ? (editMesa?.mesa_id ? 'Editar Mesa' : 'Nueva Mesa')
            : (editUser?.id ? 'Editar Usuario' : 'Nuevo Usuario')
        } 
        size="lg"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave(activeTab === 'MESAS' ? editMesa : editUser);
          }}
          className="space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {activeTab === 'MESAS' ? (
            <>
              {/* Formulario para Mesas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Mesa *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editMesa?.numero || ''}
                    onChange={e => setEditMesa({ ...editMesa, numero: parseInt(e.target.value) || '' })}
                    required
                    min="1"
                    placeholder="Ej: 1, 2, 3..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editMesa?.capacidad || ''}
                    onChange={e => setEditMesa({ ...editMesa, capacidad: parseInt(e.target.value) || '' })}
                    required
                    min="1"
                    max="20"
                    placeholder="Número de personas"
                  />
                </div>
              </div>
              
              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  value={editMesa?.ubicacion || ''}
                  onChange={e => setEditMesa({ ...editMesa, ubicacion: e.target.value })}
                  placeholder="Ej: Terraza, Interior, Ventana..."
                />
              </div>
              
              {/* Estado de la mesa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  value={editMesa?.estado || 'disponible'}
                  onChange={e => setEditMesa({ ...editMesa, estado: e.target.value })}
                  required
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="reservada">Reservada</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Formulario para Usuarios */}
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editUser?.nombre || ''}
                    onChange={e => setEditUser({ ...editUser, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editUser?.apellido || ''}
                    onChange={e => setEditUser({ ...editUser, apellido: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  value={editUser?.email || ''}
                  onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                  required
                />
              </div>
              
              {/* Contraseña - Solo para nuevos usuarios */}
              {!editUser?.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editUser?.password || ''}
                    onChange={e => setEditUser({ ...editUser, password: e.target.value })}
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              )}
              
              {/* Teléfono y Rol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editUser?.telefono || ''}
                    onChange={e => setEditUser({ ...editUser, telefono: e.target.value })}
                    placeholder="+56912345678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    value={editUser?.role || ''}
                    onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(r => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Estado activo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={editUser?.activo || false}
                  onChange={e => setEditUser({ ...editUser, activo: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                  Usuario activo
                </label>
              </div>
            </>
          )}
          
          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal 
        isOpen={!!(userToDelete || mesaToDelete)} 
        onClose={cancelDelete} 
        title={userToDelete ? "Eliminar Usuario" : "Eliminar Mesa"} 
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm sm:text-base">
            {userToDelete ? (
              <>
                ¿Estás seguro de que deseas eliminar al usuario{' '}
                <span className="font-semibold">
                  {userToDelete?.nombre} {userToDelete?.apellido}
                </span>?
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas eliminar la{' '}
                <span className="font-semibold">
                  Mesa #{mesaToDelete?.numero}
                </span>?
              </>
            )}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={cancelDelete} 
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete} 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagement; 