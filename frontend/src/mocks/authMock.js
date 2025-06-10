import { ROLES } from '../constants/roles';

export const mockUsers = [
  {
    id: 1,
    email: 'admin@lbandito.com',
    password: 'admin123',
    name: 'Administrador',
    role: ROLES.ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Administrador&background=6366f1&color=fff',
  },
  {
    id: 2,
    email: 'vendedor@lbandito.com',
    password: 'vendedor123',
    name: 'Juan Vendedor',
    role: ROLES.VENDEDOR,
    avatar: 'https://ui-avatars.com/api/?name=Juan+Vendedor&background=22c55e&color=fff',
  },
  {
    id: 3,
    email: 'cliente@lbandito.com',
    password: 'cliente123',
    name: 'María Cliente',
    role: ROLES.CLIENTE,
    avatar: 'https://ui-avatars.com/api/?name=María+Cliente&background=f59e0b&color=fff',
  },
];

export const mockAuthService = {
  login: async (email, password) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token mock
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role }));

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  },
}; 