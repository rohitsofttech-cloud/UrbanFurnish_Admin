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

// Default mock Super Admin user for development and testing
export const MOCK_SUPER_ADMIN: AuthUser = {
  id: 'usr_super_001',
  name: 'Super Admin',
  email: 'superadmin@gmail.com',
  roleName: 'Super Admin',
  roleId: 'role_super_admin',
  department: 'Executive Administration',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  permissions: [
    { module: 'Dashboard', view: true, add: true, edit: true, delete: true },
    { module: 'Products', view: true, add: true, edit: true, delete: true },
    { module: 'Orders', view: true, add: true, edit: true, delete: true },
    { module: 'Customers', view: true, add: true, edit: true, delete: true },
    { module: 'Categories', view: true, add: true, edit: true, delete: true },
    { module: 'Inventory', view: true, add: true, edit: true, delete: true },
    { module: 'Promotions', view: true, add: true, edit: true, delete: true },
    { module: 'Vendors', view: true, add: true, edit: true, delete: true },
    { module: 'Financials', view: true, add: true, edit: true, delete: true },
    { module: 'Analytics', view: true, add: true, edit: true, delete: true },
    { module: 'Settings', view: true, add: true, edit: true, delete: true },
  ],
};

/**
 * Perform login. If backend API is configured, calls the API.
 * Otherwise uses the pre-configured fallback credentials.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const { email, password } = credentials;

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
      // Fallback if API fails or is unreachable
      console.warn('API unreachable, checking local credentials fallback');
    }
  }

  // 2. Default Local Authentication Fallback
  // Verified credentials requested: superadmin@gmail.com / Super@123#
  if (email.trim().toLowerCase() === 'superadmin@gmail.com' && password === 'Super@123#') {
    const mockToken = 'jwt_urbn_furnish_super_admin_session_' + Date.now();
    setSession(mockToken, MOCK_SUPER_ADMIN);
    return {
      success: true,
      user: MOCK_SUPER_ADMIN,
      token: mockToken,
      message: 'Login successful',
    };
  }

  return {
    success: false,
    message: 'Invalid email or password. Please use the valid credentials.',
  };
}

/** Store session in cookies & localStorage */
export function setSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;

  // Set Cookie for Next.js Middleware route protection (expires in 7 days)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

/** Get current authenticated user */
export async function getMe(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;

  // 1. If backend API is active, fetch from server
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

  // 2. Client-side storage fallback
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
    // Clear Cookie
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
  if (user.roleName === 'Super Admin') return true;
  const entry = user.permissions?.find((p) => p.module.toLowerCase() === module.toLowerCase());
  return entry ? entry[action] : false;
}
