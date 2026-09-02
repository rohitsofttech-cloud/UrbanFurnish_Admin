'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/app/common/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import {
  getStoredRoles,
  setStoredRoles,
  getStoredAdminUsers,
  setStoredAdminUsers,
  Role,
  AdminUserRecord,
  Permission,
  ALL_MODULES,
  SIDEBAR_MODULE_GROUPS,
} from '@/lib/auth';
import {
  Users,
  Shield,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Edit2,
  Trash2,
  X,
  Check,
  Lock,
  LayoutDashboard,
  Package,
  Factory,
  ShoppingCart,
  Receipt,
  CreditCard,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdministrativeRolesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>(
    tabQuery === 'roles' ? 'roles' : 'users'
  );

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabQuery === 'roles') {
      setActiveTab('roles');
    } else if (tabQuery === 'users') {
      setActiveTab('users');
    }
  }, [tabQuery]);

  const handleTabChange = (tab: 'users' | 'roles') => {
    setActiveTab(tab);
    router.replace(`/administrative-roles?tab=${tab}`);
  };

  // Roles state & Admin Users state
  const [roles, setRoles] = useState<Role[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);

  // Search & Filter state for Admin Users
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Search state for Roles
  const [roleSearch, setRoleSearch] = useState('');

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);

  // Role Form state
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);

  // Admin User Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRoleId, setUserRoleId] = useState('');
  const [userDepartment, setUserDepartment] = useState('IT');
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');
  const [userPassword, setUserPassword] = useState('Password@123');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load dataset on mount
  useEffect(() => {
    const loadedRoles = getStoredRoles();
    const loadedUsers = getStoredAdminUsers();
    setRoles(loadedRoles);
    setAdminUsers(loadedUsers);
  }, []);

  // Sync back to storage when states update
  const saveRoles = (newRoles: Role[]) => {
    setRoles(newRoles);
    setStoredRoles(newRoles);
  };

  const saveAdminUsers = (newUsers: AdminUserRecord[]) => {
    setAdminUsers(newUsers);
    setStoredAdminUsers(newUsers);
  };

  // Guard: Check access for Super Admin or authorized users
  const isSuperAdmin = user?.roleName === 'Super Admin' || user?.roleName === 'SUPER ADMIN';
  const hasAccess = isSuperAdmin || user?.permissions?.some((p) =>
    (p.module === 'AdminUsers' || p.module === 'RolesPermissions') && p.view
  );

  // Filtered Admin Users
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone.includes(userSearch);

      const matchStatus =
        statusFilter === 'ALL' || u.status.toUpperCase() === statusFilter.toUpperCase();

      const matchRole =
        roleFilter === 'ALL' || u.roleName.toLowerCase() === roleFilter.toLowerCase();

      return matchSearch && matchStatus && matchRole;
    });
  }, [adminUsers, userSearch, statusFilter, roleFilter]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(roleSearch.toLowerCase())
    );
  }, [roles, roleSearch]);

  // Handle Open Create/Edit Role Modal
  const handleOpenRoleModal = (roleToEdit?: Role) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleName(roleToEdit.name);
      setRoleDescription(roleToEdit.description);

      // Ensure all modules are represented in rolePermissions state
      const initialPerms = ALL_MODULES.map((m) => {
        const existing = roleToEdit.permissions.find((p) => p.module === m.id);
        return (
          existing || {
            module: m.id,
            view: false,
            add: false,
            edit: false,
            delete: false,
          }
        );
      });
      setRolePermissions(initialPerms);
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDescription('');
      setRolePermissions(
        ALL_MODULES.map((m) => ({
          module: m.id,
          view: false,
          add: false,
          edit: false,
          delete: false,
        }))
      );
    }
    setIsRoleModalOpen(true);
  };

  // Toggle entire module permission (checked gives full module access)
  const toggleModulePermission = (moduleId: string) => {
    setRolePermissions((prev) =>
      prev.map((p) => {
        if (p.module !== moduleId) return p;
        const nextState = !p.view;
        return {
          module: moduleId,
          view: nextState,
          add: nextState,
          edit: nextState,
          delete: nextState,
        };
      })
    );
  };

  // Toggle all permissions at once
  const toggleSelectAllPermissions = () => {
    const allSelected = rolePermissions.every((p) => p.view);
    setRolePermissions((prev) =>
      prev.map((p) => ({
        module: p.module,
        view: !allSelected,
        add: !allSelected,
        edit: !allSelected,
        delete: !allSelected,
      }))
    );
  };

  // Save Role
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert('Please enter a role name.');
      return;
    }

    if (editingRole) {
      // Update existing role
      const updatedRoles = roles.map((r) =>
        r.id === editingRole.id
          ? {
            ...r,
            name: roleName.toUpperCase(),
            description: roleDescription,
            permissions: rolePermissions,
          }
          : r
      );
      saveRoles(updatedRoles);
      showToast(`Role "${roleName.toUpperCase()}" updated successfully!`);
    } else {
      // Create new role
      const newRole: Role = {
        id: 'role_' + Date.now(),
        name: roleName.toUpperCase(),
        description: roleDescription || 'Custom administrative role',
        status: 'active',
        permissions: rolePermissions,
      };
      saveRoles([...roles, newRole]);
      showToast(`Role "${newRole.name}" created successfully!`);
    }

    setIsRoleModalOpen(false);
  };

  // Delete Role
  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (roleId === 'role_super_admin') {
      alert('The Super Admin role cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      const updatedRoles = roles.filter((r) => r.id !== roleId);
      saveRoles(updatedRoles);
      showToast(`Role "${roleName}" deleted.`);
    }
  };

  // Handle Open Create/Edit User Modal
  const handleOpenUserModal = (userToEdit?: AdminUserRecord) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserName(userToEdit.name);
      setUserEmail(userToEdit.email);
      setUserPhone(userToEdit.phone);
      setUserRoleId(userToEdit.roleId);
      setUserDepartment(userToEdit.department);
      setUserStatus(userToEdit.status);
      setUserPassword(userToEdit.password || 'Password@123');
    } else {
      setEditingUser(null);
      setUserName('');
      setUserEmail('');
      setUserPhone('');
      setUserRoleId(roles[1]?.id || roles[0]?.id || '');
      setUserDepartment('SUPPORT');
      setUserStatus('active');
      setUserPassword('Password@123');
    }
    setIsUserModalOpen(true);
  };

  // Save Admin User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      alert('Please fill out Name and Email fields.');
      return;
    }

    const selectedRole = roles.find((r) => r.id === userRoleId);
    const roleNameFormatted = selectedRole ? selectedRole.name : 'Admin';

    if (editingUser) {
      const updatedUsers = adminUsers.map((u) =>
        u.id === editingUser.id
          ? {
            ...u,
            name: userName,
            email: userEmail,
            phone: userPhone,
            roleId: userRoleId,
            roleName: roleNameFormatted,
            department: userDepartment,
            status: userStatus,
            password: userPassword,
          }
          : u
      );
      saveAdminUsers(updatedUsers);
      showToast(`Admin user "${userName}" updated successfully!`);
    } else {
      const newUser: AdminUserRecord = {
        id: 'usr_' + Date.now(),
        name: userName,
        email: userEmail,
        phone: userPhone || '+910000000000',
        roleId: userRoleId,
        roleName: roleNameFormatted,
        department: userDepartment,
        status: userStatus,
        password: userPassword,
      };
      saveAdminUsers([newUser, ...adminUsers]);
      showToast(`Admin user "${userName}" created successfully!`);
    }

    setIsUserModalOpen(false);
  };

  // Delete Admin User
  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
      const updatedUsers = adminUsers.filter((u) => u.id !== userId);
      saveAdminUsers(updatedUsers);
      showToast(`Admin user "${userName}" deleted.`);
    }
  };

  // Count active modules selected in Role Modal
  const selectedModulesCount = useMemo(() => {
    return rolePermissions.filter((p) => p.view || p.add || p.edit || p.delete).length;
  }, [rolePermissions]);

  if (!hasAccess) {
    return (
      <AdminLayout>
        <div className="p-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-textColor mb-2">Access Denied</h2>
          <p className="text-textMuted text-sm mb-6">
            The Administrative Roles module is restricted strictly to Super Admin users or account handlers with role management permissions.
          </p>
          <div className="p-4 bg-surfaceColor rounded-xl border border-borderColor text-xs text-textMuted text-left">
            <span className="font-semibold text-textColor">Current Account:</span> {user?.name} ({user?.roleName})
            <br />
            <span className="font-semibold text-textColor">Required Credentials:</span> Log in as <code className="text-primary font-bold">superadmin@gmail.com</code> to manage roles and access permissions.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 font-medium text-sm"
            >
              <Check size={18} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Top Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textColor tracking-tight">
            Administrative Roles
          </h1>
          <p className="text-xs sm:text-sm text-textMuted font-medium mt-1">
            Define roles and assign permissions
          </p>
        </div>

        {/* Navigation Tabs Header */}
        <div className="border-b border-borderColor flex items-center gap-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={`pb-3 flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all relative ${activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textMuted hover:text-textColor'
              }`}
          >
            <Users size={17} />
            <span>Users Creation</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold">
              {adminUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('roles')}
            className={`pb-3 flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all relative ${activeTab === 'roles'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textMuted hover:text-textColor'
              }`}
          >
            <ShieldCheck size={17} />
            <span>Roles & Permissions</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold">
              {roles.length}
            </span>
          </button>
        </div>

        {/* TAB 1: ADMIN USERS */}
        {activeTab === 'users' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Subheader & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-textColor">Admin Users Management</h2>
                <p className="text-xs text-textMuted font-medium">
                  Manage admin users and their access permissions
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenUserModal()}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Add New User</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-surfaceColor p-3 rounded-2xl border border-borderColor shadow-xs">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-bgColor border border-borderColor rounded-xl pl-9 pr-4 py-2 text-xs text-textColor focus:border-primary outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-bgColor border border-borderColor rounded-xl px-3 py-2 text-xs font-semibold text-textColor focus:border-primary outline-hidden"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-bgColor border border-borderColor rounded-xl px-3 py-2 text-xs font-semibold text-textColor focus:border-primary outline-hidden"
                >
                  <option value="ALL">All Roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-bgColor hover:bg-sidebarHover border border-borderColor px-3 py-2 rounded-xl text-xs font-semibold text-textColor transition-colors"
                >
                  <Filter size={14} />
                  <span>Bulk Actions (0)</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-surfaceColor border border-borderColor rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-borderColor bg-bgColor/50 text-[11px] font-bold text-textMuted uppercase tracking-wider">
                      <th className="py-3.5 px-4">Admin User</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderColor/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-textMuted">
                          No admin users found matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const avatarLetter = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                        return (
                          <tr key={u.id} className="hover:bg-sidebarHover/50 transition-colors">
                            {/* User name & avatar */}
                            <td className="py-3.5 px-4 font-semibold text-textColor">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-black text-sm uppercase shrink-0">
                                  {avatarLetter}
                                </div>
                                <span className="font-bold text-sm text-textColor">{u.name}</span>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="py-3.5 px-4 text-textMuted">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-textColor font-medium">
                                  <Mail size={13} className="text-textMuted" />
                                  <span>{u.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-textMuted">
                                  <Phone size={13} />
                                  <span>{u.phone}</span>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 font-bold text-textColor">
                                <Shield size={14} className="text-primary" />
                                <span>{u.roleName}</span>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="py-3.5 px-4 uppercase text-[11px] font-bold text-textMuted">
                              {u.department}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-textMuted/20 text-textMuted'
                                  }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {u.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserModal(u)}
                                  className="p-1.5 hover:bg-sidebarHover text-textMuted hover:text-textColor rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 hover:bg-danger/10 text-textMuted hover:text-danger rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROLES & PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Subheader & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-textColor">Roles & Permissions</h2>
                <p className="text-xs text-textMuted font-medium">
                  Define roles and assign module-level permissions
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenRoleModal()}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Create New Role</span>
              </button>
            </div>

            {/* Search roles */}
            <div className="bg-surfaceColor p-3 rounded-2xl border border-borderColor shadow-xs">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="w-full bg-bgColor border border-borderColor rounded-xl pl-9 pr-4 py-2 text-xs text-textColor focus:border-primary outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Roles Table (Table structure instead of cards) */}
            <div className="bg-surfaceColor border border-borderColor rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-borderColor bg-bgColor/50 text-[11px] font-bold text-textMuted uppercase tracking-wider">
                      <th className="py-3.5 px-4">Role Name</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Permissions / Modules</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderColor/60">
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-textMuted">
                          No roles found matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((r) => {
                        const visiblePermissions = r.permissions.filter((p) => p.view);
                        const isSuperAdminRole = r.id === 'role_super_admin';

                        return (
                          <tr key={r.id} className="hover:bg-sidebarHover/50 transition-colors">
                            {/* Role Name */}
                            <td className="py-3.5 px-4 font-semibold text-textColor">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                  <Shield size={17} />
                                </div>
                                <div>
                                  <span className="font-bold text-sm text-textColor block uppercase tracking-tight">
                                    {r.name}
                                  </span>
                                  {isSuperAdminRole && (
                                    <span className="text-[10px] font-bold text-primary">System Default</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="py-3.5 px-4 text-textMuted max-w-xs">
                              <p className="line-clamp-2 text-xs font-medium">{r.description || '-'}</p>
                            </td>

                            {/* Permissions Pills */}
                            <td className="py-3.5 px-4 max-w-md">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {visiblePermissions.length === 0 ? (
                                  <span className="text-textMuted text-xs italic">No permissions assigned</span>
                                ) : (
                                  <>
                                    {visiblePermissions.slice(0, 4).map((p) => (
                                      <span
                                        key={p.module}
                                        className="px-2 py-0.5 rounded-md bg-bgColor border border-borderColor text-[10px] font-bold text-textColor uppercase tracking-wider"
                                      >
                                        {p.module}
                                      </span>
                                    ))}
                                    {visiblePermissions.length > 4 && (
                                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold uppercase">
                                        +{visiblePermissions.length - 4} more
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {r.status || 'active'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenRoleModal(r)}
                                  className="p-1.5 hover:bg-sidebarHover text-textMuted hover:text-textColor rounded-lg transition-colors cursor-pointer"
                                  title="Edit Role"
                                >
                                  <Edit2 size={15} />
                                </button>
                                {!isSuperAdminRole && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRole(r.id, r.name)}
                                    className="p-1.5 hover:bg-danger/10 text-textMuted hover:text-danger rounded-lg transition-colors cursor-pointer"
                                    title="Delete Role"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT-SIDE DRAWER: CREATE / EDIT ROLE */}
        <AnimatePresence>
          {isRoleModalOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsRoleModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />

              <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="w-screen max-w-xl bg-surfaceColor border-l border-borderColor shadow-2xl flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-borderColor flex items-center justify-between bg-bgColor/40">
                    <div>
                      <h3 className="text-xl font-extrabold text-textColor tracking-tight">
                        {editingRole ? 'Edit Role' : 'Create New Role'}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-textMuted mt-0.5">
                        Define role details & module access
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRoleModalOpen(false)}
                      className="w-9 h-9 rounded-full border border-borderColor flex items-center justify-center text-textMuted hover:text-textColor hover:bg-sidebarHover transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                          Role Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Content Manager"
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                          className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-3 text-sm text-textColor focus:border-primary outline-hidden font-semibold"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                          Description *
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of responsibilities..."
                          value={roleDescription}
                          onChange={(e) => setRoleDescription(e.target.value)}
                          className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Permissions Mapping Card Header */}
                    <div className="bg-bgColor/50 border border-borderColor rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-textColor">
                          Module Permissions
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-extrabold">
                          {selectedModulesCount}/{ALL_MODULES.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleSelectAllPermissions}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {rolePermissions.every((p) => p.view) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Sidebar-Structured Module & Submodule Permissions */}
                    <div className="space-y-2">
                      {SIDEBAR_MODULE_GROUPS.map((group) => {
                        const ICON_MAP: Record<string, React.ReactNode> = {
                          LayoutDashboard: <LayoutDashboard size={17} />,
                          ShieldCheck: <ShieldCheck size={17} />,
                          Package: <Package size={17} />,
                          Factory: <Factory size={17} />,
                          ShoppingCart: <ShoppingCart size={17} />,
                          Receipt: <Receipt size={17} />,
                          CreditCard: <CreditCard size={17} />,
                          Users: <Users size={17} />,
                          BarChart3: <BarChart3 size={17} />,
                        };

                        const hasChildren = group.children && group.children.length > 0;

                        if (!hasChildren) {
                          // Standalone module (no submodules) — e.g. Dashboard, Orders, etc.
                          const currentPerm = rolePermissions.find((p) => p.module === group.id);
                          const isChecked = Boolean(currentPerm?.view);

                          return (
                            <label
                              key={group.id}
                              onClick={() => toggleModulePermission(group.id)}
                              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                                isChecked
                                  ? 'bg-primary/10 border-primary/40 shadow-xs'
                                  : 'bg-bgColor/60 border-borderColor hover:bg-sidebarHover/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                    isChecked
                                      ? 'bg-primary border-primary text-white'
                                      : 'border-borderColor bg-surfaceColor text-transparent'
                                  }`}
                                >
                                  <Check size={14} strokeWidth={3} />
                                </div>
                                <span className={`${
                                  isChecked ? 'text-primary' : 'text-textMuted'
                                }`}>
                                  {ICON_MAP[group.icon]}
                                </span>
                                <div>
                                  <h4 className="font-bold text-xs text-textColor">{group.name}</h4>
                                  <p className="text-[11px] text-textMuted">Enable access to {group.name}</p>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md transition-colors ${
                                  isChecked
                                    ? 'bg-primary text-white'
                                    : 'bg-borderColor/50 text-textMuted'
                                }`}
                              >
                                {isChecked ? 'Allowed' : 'Disabled'}
                              </span>
                            </label>
                          );
                        }

                        // Module with submodules — e.g. Administrative Roles, Products & Catalog
                        const childPerms = group.children!.map((child) => ({
                          child,
                          perm: rolePermissions.find((p) => p.module === child.id),
                        }));
                        const allChildrenChecked = childPerms.every((cp) => cp.perm?.view);
                        const someChildrenChecked = childPerms.some((cp) => cp.perm?.view);
                        const isExpanded = someChildrenChecked || allChildrenChecked;

                        const toggleAllChildren = () => {
                          const nextState = !allChildrenChecked;
                          setRolePermissions((prev) =>
                            prev.map((p) => {
                              if (group.children!.some((c) => c.id === p.module)) {
                                return {
                                  module: p.module,
                                  view: nextState,
                                  add: nextState,
                                  edit: nextState,
                                  delete: nextState,
                                };
                              }
                              return p;
                            })
                          );
                        };

                        return (
                          <div key={group.id} className="rounded-xl border border-borderColor overflow-hidden">
                            {/* Parent module header */}
                            <div
                              onClick={toggleAllChildren}
                              className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-all ${
                                someChildrenChecked
                                  ? 'bg-primary/8 border-b border-primary/20'
                                  : 'bg-bgColor/60 hover:bg-sidebarHover/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                    allChildrenChecked
                                      ? 'bg-primary border-primary text-white'
                                      : someChildrenChecked
                                        ? 'bg-primary/40 border-primary/60 text-white'
                                        : 'border-borderColor bg-surfaceColor text-transparent'
                                  }`}
                                >
                                  {someChildrenChecked && !allChildrenChecked ? (
                                    <span className="w-2 h-0.5 bg-white rounded-full" />
                                  ) : (
                                    <Check size={14} strokeWidth={3} />
                                  )}
                                </div>
                                <span className={`${
                                  someChildrenChecked ? 'text-primary' : 'text-textMuted'
                                }`}>
                                  {ICON_MAP[group.icon]}
                                </span>
                                <div>
                                  <h4 className="font-bold text-xs text-textColor">{group.name}</h4>
                                  <p className="text-[11px] text-textMuted">
                                    {childPerms.filter((cp) => cp.perm?.view).length}/{group.children!.length} submodules enabled
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md transition-colors ${
                                    allChildrenChecked
                                      ? 'bg-primary text-white'
                                      : someChildrenChecked
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-borderColor/50 text-textMuted'
                                  }`}
                                >
                                  {allChildrenChecked ? 'All Allowed' : someChildrenChecked ? 'Partial' : 'Disabled'}
                                </span>
                                <span className="text-textMuted">
                                  {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                </span>
                              </div>
                            </div>

                            {/* Submodule children — always visible */}
                            <div className="divide-y divide-borderColor/40">
                              {group.children!.map((child) => {
                                const childPerm = rolePermissions.find((p) => p.module === child.id);
                                const isChildChecked = Boolean(childPerm?.view);

                                return (
                                  <label
                                    key={child.id}
                                    onClick={(e) => { e.stopPropagation(); toggleModulePermission(child.id); }}
                                    className={`flex items-center justify-between py-3 px-4 pl-12 cursor-pointer select-none transition-all ${
                                      isChildChecked
                                        ? 'bg-primary/5'
                                        : 'bg-bgColor/30 hover:bg-sidebarHover/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                          isChildChecked
                                            ? 'bg-primary border-primary text-white'
                                            : 'border-borderColor bg-surfaceColor text-transparent'
                                        }`}
                                      >
                                        <Check size={11} strokeWidth={3} />
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-[11px] text-textColor">{child.name}</h5>
                                        <p className="text-[10px] text-textMuted">Enable access to {child.name}</p>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded transition-colors ${
                                        isChildChecked
                                          ? 'bg-primary text-white'
                                          : 'bg-borderColor/50 text-textMuted'
                                      }`}
                                    >
                                      {isChildChecked ? 'Allowed' : 'Disabled'}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 border-t border-borderColor flex items-center justify-end gap-3 sticky bottom-0 bg-surfaceColor py-3">
                      <button
                        type="button"
                        onClick={() => setIsRoleModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-borderColor text-textColor font-bold text-xs uppercase tracking-wider hover:bg-sidebarHover transition-colors cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/30 transition-all cursor-pointer"
                      >
                        {editingRole ? 'UPDATE ROLE' : 'CREATE ROLE'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* RIGHT-SIDE DRAWER: CREATE / EDIT ADMIN USER */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsUserModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />

              <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="w-screen max-w-md bg-surfaceColor border-l border-borderColor shadow-2xl flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-borderColor flex items-center justify-between bg-bgColor/40">
                    <div>
                      <h3 className="text-xl font-extrabold text-textColor tracking-tight">
                        {editingUser ? 'Edit Admin User' : 'Add New Admin User'}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-textMuted mt-0.5">
                        Assign administrative role & credentials
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="w-9 h-9 rounded-full border border-borderColor flex items-center justify-center text-textMuted hover:text-textColor hover:bg-sidebarHover transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Smith"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="john.smith@company.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+1-555-0123"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Assign Role *
                      </label>
                      <select
                        value={userRoleId}
                        onChange={(e) => setUserRoleId(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-bold"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Department
                      </label>
                      <select
                        value={userDepartment}
                        onChange={(e) => setUserDepartment(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-bold"
                      >
                        <option value="IT">IT</option>
                        <option value="SUPPORT">SUPPORT</option>
                        <option value="CONTENT">CONTENT</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="EXECUTIVE">EXECUTIVE</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Password
                      </label>
                      <input
                        type="text"
                        placeholder="Password@123"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Account Status
                      </label>
                      <select
                        value={userStatus}
                        onChange={(e) => setUserStatus(e.target.value as 'active' | 'inactive')}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-bold"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 border-t border-borderColor flex items-center justify-end gap-3 sticky bottom-0 bg-surfaceColor py-3">
                      <button
                        type="button"
                        onClick={() => setIsUserModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-borderColor text-textColor font-bold text-xs uppercase tracking-wider hover:bg-sidebarHover transition-colors cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/30 transition-all cursor-pointer"
                      >
                        {editingUser ? 'SAVE USER' : 'ADD ADMIN'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

export default function AdministrativeRolesPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </AdminLayout>
      }
    >
      <AdministrativeRolesContent />
    </Suspense>
  );
}
