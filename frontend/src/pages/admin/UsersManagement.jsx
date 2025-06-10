import { useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

// Datos mock de usuarios
const mockUsers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@cafe.com', role: 'VENDEDOR', active: true, permissions: ['VER_PEDIDOS', 'GESTIONAR_PRODUCTOS'] },
  { id: 2, name: 'Ana López', email: 'ana@cafe.com', role: 'VENDEDOR', active: true, permissions: ['VER_PEDIDOS'] },
  { id: 3, name: 'Carlos Cliente', email: 'carlos@cliente.com', role: 'CLIENTE', active: true, permissions: [] },
  { id: 4, name: 'Admin', email: 'admin@cafe.com', role: 'ADMIN', active: true, permissions: ['*'] },
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
];

const UsersManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ADMIN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filtros por tab y búsqueda
  const filteredUsers = users.filter(user => {
    const matchesRole = user.role === activeTab;
    const matchesSearch = search
      ? user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesRole && matchesSearch;
  });

  // Abrir modal para crear/editar
  const handleOpenModal = (user = null) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  // Guardar usuario
  const handleSaveUser = (user) => {
    if (user.id) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      setUsers([...users, { ...user, id: nextId }]);
    }
    setIsModalOpen(false);
  };

  // Cambiar permisos
  const handlePermissionChange = (perm, checked) => {
    setEditUser({
      ...editUser,
      permissions: checked
        ? [...editUser.permissions, perm]
        : editUser.permissions.filter(p => p !== perm),
    });
  };

  // Eliminar usuario
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };
  const confirmDeleteUser = () => {
    setUsers(users.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
  };
  const cancelDeleteUser = () => setUserToDelete(null);

  return (
    <div className="p-6">
      <div className="mb-4 flex gap-2 border-b">
        {tabOptions.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-200 ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Gestión de {tabOptions.find(t => t.key === activeTab)?.label}</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="primary" onClick={() => handleOpenModal({ role: activeTab, name: '', email: '', permissions: [], active: true })}>
            Nuevo Usuario
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.active ? 'Sí' : 'No'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.permissions.length === 0 ? '—' : user.permissions.map(p => allPermissions.find(ap => ap.key === p)?.label).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <Button size="sm" variant="info" onClick={() => handleOpenModal(user)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editUser ? 'Editar Usuario' : 'Nuevo Usuario'} size="md">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSaveUser(editUser);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={editUser?.name || ''}
              onChange={e => setEditUser({ ...editUser, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={editUser?.email || ''}
              onChange={e => setEditUser({ ...editUser, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permisos</label>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map(perm => (
                <label key={perm.key} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editUser?.permissions?.includes(perm.key) || false}
                    onChange={e => handlePermissionChange(perm.key, e.target.checked)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activo</label>
            <input
              type="checkbox"
              checked={editUser?.active || false}
              onChange={e => setEditUser({ ...editUser, active: e.target.checked })}
            />
            <span className="ml-2">Usuario activo</span>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={!!userToDelete} onClose={cancelDeleteUser} title="Eliminar Usuario" size="sm">
        <div className="space-y-4">
          <p>¿Estás seguro de que deseas eliminar al usuario <span className="font-semibold">{userToDelete?.name}</span>?</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={cancelDeleteUser}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDeleteUser}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagement; 