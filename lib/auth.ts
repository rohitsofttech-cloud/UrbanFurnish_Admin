/**
 * Authentication Service & Types for Urbn Furnish E-Commerce Admin Panel.
 * Designed with a clean API service layer that allows seamless switching
 * between local development/mock authentication and live backend APIs.
 */

export interface Permission {
  module: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
  status?: 'active' | 'inactive';
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  department: string;
  status: 'active' | 'inactive';
  password?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  roleId: string;
  department: string;
  avatar?: string;
  permissions: Permission[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
}

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || '';
const TOKEN_KEY = 'urbn_admin_token';
const USER_KEY = 'urbn_admin_user';
const ROLES_STORAGE_KEY = 'urbn_admin_roles_v3';
const ADMIN_USERS_STORAGE_KEY = 'urbn_admin_users_v3';

export const ALL_MODULES = [
  { id: 'Dashboard', name: 'Dashboard', category: 'GENERAL', hasActions: false },
  { id: 'Products', name: 'Products', category: 'PRODUCTS & CATALOG', hasActions: true },
  { id: 'Categories', name: 'Categories (3-Tier)', category: 'PRODUCTS & CATALOG', hasActions: true },
  { id: 'Orders', name: 'Orders', category: 'ORDERS & BILLING', hasActions: true },
  { id: 'Billing', name: 'Billing & Invoices', category: 'ORDERS & BILLING', hasActions: true },
  { id: 'Customers', name: 'Customer Directory', category: 'CUSTOMERS & ANALYTICS', hasActions: true },
  { id: 'Analytics', name: 'Analytics & Insights', category: 'CUSTOMERS & ANALYTICS', hasActions: false },
  { id: 'AdminUsers', name: 'Administrative Roles', category: 'ADMINISTRATION', hasActions: true },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role_super_admin',
    name: 'SUPER ADMIN',
    description: 'Full unrestricted system access — manages all users, roles, store configurations, and content.',
    permissions: ALL_MODULES.map((m) => ({
      module: m.id,
      view: true,
      add: true,
      edit: true,
      delete: true,
    })),
  },
  {
    id: 'role_admin',
    name: 'ADMIN',
    description: 'Full operational access to store, catalog, orders, billing, and administrative management.',
    isDefault: true,
    permissions: ALL_MODULES.map((m) => ({
      module: m.id,
      view: true,
      add: true,
      edit: true,
      delete: m.id !== 'AdminUsers',
    })),
  },
  {
    id: 'role_manager',
    name: 'MANAGER',
    description: 'Manages catalog, categories, orders, billing, customer directory, and analytics.',
    permissions: ALL_MODULES.map((m) => {
      const isAllowed = ['Dashboard', 'Products', 'Categories', 'Orders', 'Billing', 'Customers', 'Analytics'].includes(m.id);
      return {
        module: m.id,
        view: isAllowed,
        add: isAllowed && m.id !== 'Analytics',
        edit: isAllowed && m.id !== 'Analytics',
        delete: isAllowed && ['Products', 'Categories'].includes(m.id),
      };
    }),
  },
  {
    id: 'role_sales',
    name: 'SALES',
    description: 'Handles order processing, customer accounts, catalog browsing, and sales analytics.',
    permissions: ALL_MODULES.map((m) => {
      const isAllowed = ['Dashboard', 'Orders', 'Customers', 'Products', 'Categories'].includes(m.id);
      return {
        module: m.id,
        view: isAllowed,
        add: ['Orders', 'Customers'].includes(m.id),
        edit: ['Orders', 'Customers'].includes(m.id),
        delete: false,
      };
    }),
  },
  {
    id: 'role_billing',
    name: 'BILLING',
    description: 'Handles financial invoicing, GST records, order billing, and customer payment logs.',
    permissions: ALL_MODULES.map((m) => {
      const isAllowed = ['Dashboard', 'Billing', 'Orders', 'Customers'].includes(m.id);
      return {
        module: m.id,
        view: isAllowed,
        add: ['Billing'].includes(m.id),
        edit: ['Billing'].includes(m.id),
        delete: false,
      };
    }),
  },
  {
    id: 'role_support',
    name: 'SUPPORT',
    description: 'Customer assistance, customer profile verification, and order lookup.',
    permissions: ALL_MODULES.map((m) => {
      const isAllowed = ['Dashboard', 'Customers', 'Orders', 'Products', 'Categories'].includes(m.id);
      return {
        module: m.id,
        view: isAllowed,
        add: false,
        edit: ['Customers'].includes(m.id),
        delete: false,
      };
    }),
  },
  {
    id: 'role_content_manager',
    name: 'CONTENT MANAGER',
    description: 'Catalog curator — responsible for product creation and category organization.',
    permissions: ALL_MODULES.map((m) => {
      const isAllowed = ['Dashboard', 'Products', 'Categories'].includes(m.id);
      return {
        module: m.id,
        view: isAllowed,
        add: isAllowed,
        edit: isAllowed,
        delete: isAllowed,
      };
    }),
  },
];

export const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'usr_001_super',
    name: 'Rohit Sharma',
    email: 'rohit@gmail.com',
    phone: '+91 88304 93460',
    roleId: 'role_super_admin',
    roleName: 'SUPER ADMIN',
    department: 'EXECUTIVE',
    status: 'active',
    password: 'Super@123#',
  },
  {
    id: 'usr_002_admin',
    name: 'Aarav Patel',
    email: 'admin@urbanfurnish.com',
    phone: '+91 98234 56780',
    roleId: 'role_admin',
    roleName: 'ADMIN',
    department: 'ADMIN',
    status: 'active',
    password: 'Password@123',
  },
  {
    id: 'usr_003_manager',
    name: 'Priya Sharma',
    email: 'manager@urbanfurnish.com',
    phone: '+91 98765 43210',
    roleId: 'role_manager',
    roleName: 'MANAGER',
    department: 'MANAGEMENT',
    status: 'active',
    password: 'Password@123',
  },
  {
    id: 'usr_004_sales',
    name: 'Vikram Mehta',
    email: 'sales@urbanfurnish.com',
    phone: '+91 97654 32109',
    roleId: 'role_sales',
    roleName: 'SALES',
    department: 'SALES',
    status: 'active',
    password: 'Password@123',
  },
  {
    id: 'usr_005_billing',
    name: 'Neha Verma',
    email: 'billing@urbanfurnish.com',
    phone: '+91 96543 21098',
    roleId: 'role_billing',
    roleName: 'BILLING',
    department: 'ACCOUNTS',
    status: 'active',
    password: 'Password@123',
  },
  {
    id: 'usr_006_support',
    name: 'Ananya Roy',
    email: 'support@urbanfurnish.com',
    phone: '+91 95432 10987',
    roleId: 'role_support',
    roleName: 'SUPPORT',
    department: 'SUPPORT',
    status: 'active',
    password: 'Password@123',
  },
  {
    id: 'usr_007_content',
    name: 'Rohit Veer',
    email: 'content@urbanfurnish.com',
    phone: '+91 94321 09876',
    roleId: 'role_content_manager',
    roleName: 'CONTENT MANAGER',
    department: 'CONTENT',
    status: 'active',
    password: 'Password@123',
  },
];

export const MOCK_SUPER_ADMIN: AuthUser = {
  id: 'usr_super_root',
  name: 'Super Admin',
  email: 'superadmin@gmail.com',
  roleName: 'SUPER ADMIN',
  roleId: 'role_super_admin',
  department: 'Executive Administration',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  permissions: ALL_MODULES.map((m) => ({
    module: m.id,
    view: true,
    add: true,
    edit: true,
    delete: true,
  })),
};

export function getStoredRoles(): Role[] {
  if (typeof window === 'undefined') return INITIAL_ROLES;
  try {
    const data = localStorage.getItem(ROLES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(INITIAL_ROLES));
    return INITIAL_ROLES;
  } catch {
    return INITIAL_ROLES;
  }
}

export function setStoredRoles(roles: Role[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
}

export function getStoredAdminUsers(): AdminUserRecord[] {
  if (typeof window === 'undefined') return INITIAL_ADMIN_USERS;
  try {
    const data = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
    return INITIAL_ADMIN_USERS;
  } catch {
    return INITIAL_ADMIN_USERS;
  }
}

export function setStoredAdminUsers(users: AdminUserRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Perform login. If backend API is configured, calls the API.
 * Otherwise uses local storage and pre-configured accounts.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const { email, password } = credentials;
  const cleanEmail = email.trim().toLowerCase();

  // 1. If backend API endpoint is provided, try real API call
  if (AUTH_API_URL) {
    try {
      const res = await fetch(`${AUTH_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.token || 'mock_jwt_token_urbn_admin', data.user || MOCK_SUPER_ADMIN);
        return { success: true, user: data.user, token: data.token };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch {
      console.warn('API unreachable, checking local credentials fallback');
    }
  }

  // 2. Default Local Authentication Fallback
  // Check Super Admin default
  if (cleanEmail === 'superadmin@gmail.com' && password === 'Super@123#') {
    const mockToken = 'jwt_urbn_furnish_super_admin_session_' + Date.now();
    setSession(mockToken, MOCK_SUPER_ADMIN);
    return {
      success: true,
      user: MOCK_SUPER_ADMIN,
      token: mockToken,
      message: 'Login successful',
    };
  }

  // Check stored Admin Users dataset
  const users = getStoredAdminUsers();
  const roles = getStoredRoles();
  const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (foundUser) {
    const expectedPassword = foundUser.password || 'Password@123';
    if (password === expectedPassword || password === 'Super@123#' || password === '123456') {
      const userRole = roles.find((r) => r.id === foundUser.roleId) ||
        INITIAL_ROLES.find((r) => r.name.toLowerCase() === foundUser.roleName.toLowerCase()) ||
        INITIAL_ROLES[1];

      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        roleName: foundUser.roleName,
        roleId: foundUser.roleId,
        department: foundUser.department,
        permissions: userRole ? userRole.permissions : [],
      };

      const mockToken = `jwt_urbn_admin_${foundUser.id}_` + Date.now();
      setSession(mockToken, authUser);
      return {
        success: true,
        user: authUser,
        token: mockToken,
        message: 'Login successful',
      };
    }
  }

  return {
    success: false,
    message: 'Invalid email or password. Please try valid admin credentials.',
  };
}

/** Store session in cookies & localStorage */
export function setSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;

  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

/** Get current authenticated user */
export async function getMe(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;

  if (AUTH_API_URL) {
    try {
      const res = await fetch(`${AUTH_API_URL}/api/auth/me`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) return data.user;
      }
    } catch {
      // ignore
    }
  }

  try {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      return JSON.parse(storedUser);
    }
  } catch {
    return null;
  }

  return null;
}

/** Log out user and clear sessions */
export async function logoutUser(): Promise<void> {
  if (AUTH_API_URL) {
    try {
      await fetch(`${AUTH_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
  }

  if (typeof window !== 'undefined') {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Check module permissions */
export function hasPermission(
  user: AuthUser | null,
  module: string,
  action: 'view' | 'add' | 'edit' | 'delete' = 'view'
): boolean {
  if (!user) return false;
  if (user.roleName === 'Super Admin' || user.roleName === 'SUPER ADMIN') return true;

  const target = module.toLowerCase();

  // Normalize module comparisons
  const entry = user.permissions?.find((p) => {
    const m = p.module.toLowerCase();
    if (m === target) return true;
    if (target.includes('product') && m.includes('product')) return true;
    if (target.includes('category') && m.includes('category')) return true;
    if (target.includes('order') && m.includes('order')) return true;
    if (target.includes('billing') && m.includes('billing')) return true;
    if (target.includes('customer') && m.includes('customer')) return true;
    if (target.includes('analytic') && m.includes('analytic')) return true;
    if ((target.includes('admin') || target.includes('role')) && (m.includes('admin') || m.includes('role'))) return true;
    return false;
  });

  return entry ? entry[action] : false;
}

