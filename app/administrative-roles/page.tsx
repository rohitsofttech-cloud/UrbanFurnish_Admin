'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdministrativeRolesPage() {
  const { user } = useAuth();

  // Active Tab: 'users' | 'roles'
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

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

  // Toggle module permission action
  const togglePermissionAction = (
    moduleId: string,
    action: 'view' | 'add' | 'edit' | 'delete'
  ) => {
    setRolePermissions((prev) =>
      prev.map((p) => {
        if (p.module !== moduleId) return p;

        const updated = { ...p, [action]: !p[action] };
        // If enabling add, edit, or delete, ensure view is also enabled
        if ((action === 'add' || action === 'edit' || action === 'delete') && updated[action]) {
          updated.view = true;
        }
        // If disabling view, disable all sub-actions
        if (action === 'view' && !updated.view) {
          updated.add = false;
          updated.edit = false;
          updated.delete = false;
        }
        return updated;
      })
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
            onClick={() => setActiveTab('users')}
            className={`pb-3 flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all relative ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textMuted hover:text-textColor'
            }`}
          >
            <Users size={17} />
            <span>Admin Users</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold">
              {adminUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`pb-3 flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all relative ${
              activeTab === 'roles'
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
                <span>Add New Admin</span>
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
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.status === 'active'
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

            {/* Roles Grid (Matching Screenshot 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRoles.map((r) => {
                const visiblePermissionsCount = r.permissions.filter((p) => p.view).length;
                return (
                  <div
                    key={r.id}
                    className="bg-surfaceColor border border-borderColor rounded-2xl p-5 shadow-xs flex flex-col justify-between relative hover:border-primary/50 transition-all group"
                  >
                    <div>
                      {/* Status dot & Shield icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Shield size={20} />
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-extrabold text-textColor tracking-tight uppercase">
                        {r.name}
                      </h3>
                      <p className="text-xs text-textMuted font-medium mt-1 line-clamp-2 min-h-[32px]">
                        {r.description}
                      </p>

                      {/* Permissions Pills */}
                      <div className="mt-4 pt-3 border-t border-borderColor/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted/80 block mb-2">
                          Permissions
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {r.permissions
                            .filter((p) => p.view)
                            .slice(0, 6)
                            .map((p) => (
                              <span
                                key={p.module}
                                className="px-2 py-0.5 rounded-md bg-bgColor border border-borderColor text-[10px] font-bold text-textColor uppercase tracking-wider"
                              >
                                {p.module}
                              </span>
                            ))}
                          {visiblePermissionsCount > 6 && (
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">
                              +{visiblePermissionsCount - 6} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="mt-6 pt-4 border-t border-borderColor/60 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenRoleModal(r)}
                        className="flex-1 py-2 rounded-xl border border-borderColor hover:bg-sidebarHover text-textColor font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                        <span>EDIT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(r.id, r.name)}
                        className="flex-1 py-2 rounded-xl border border-borderColor hover:bg-danger/10 text-danger font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>DELETE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL: CREATE / EDIT ROLE (Matching Screenshot 3) */}
        <AnimatePresence>
          {isRoleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surfaceColor border border-borderColor rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8"
              >
                {/* Header */}
                <div className="p-6 border-b border-borderColor flex items-center justify-between bg-bgColor/40">
                  <div>
                    <h3 className="text-xl font-extrabold text-textColor tracking-tight">
                      {editingRole ? 'Edit Role' : 'Create New Role'}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-textMuted mt-0.5">
                      Define a new administrative role
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
                <form onSubmit={handleSaveRole} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  {/* Inputs Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-textMuted">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Super Admin"
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
                        placeholder="Role summary..."
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        className="w-full bg-bgColor border border-borderColor rounded-xl px-4 py-2.5 text-sm text-textColor focus:border-primary outline-hidden font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Permissions Mapping Card Header */}
                  <div className="bg-bgColor/50 border border-borderColor rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-textColor">
                      Permissions Mapping
                    </span>
                    <span className="px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                      {selectedModulesCount} Modules Selected
                    </span>
                  </div>

                  {/* Module Categories Permission Mapping */}
                  <div className="space-y-6">
                    {Array.from(new Set(ALL_MODULES.map((m) => m.category))).map(
                      (catName) => {
                        const modulesInCat = ALL_MODULES.filter((m) => m.category === catName);
                        if (modulesInCat.length === 0) return null;

                        return (
                          <div key={catName} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-textMuted">
                                {catName}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-borderColor/60 text-textColor">
                                {modulesInCat.length}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {modulesInCat.map((mod) => {
                                const currentPerm = rolePermissions.find((p) => p.module === mod.id) || {
                                  module: mod.id,
                                  view: false,
                                  add: false,
                                  edit: false,
                                  delete: false,
                                };

                                const isChecked = currentPerm.view;

                                return (
                                  <div
                                    key={mod.id}
                                    className={`p-4 rounded-2xl border transition-all ${
                                      isChecked
                                        ? 'bg-primary/5 border-primary/30 shadow-xs'
                                        : 'bg-bgColor/60 border-borderColor'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2.5">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => togglePermissionAction(mod.id, 'view')}
                                          className="w-4.5 h-4.5 rounded-md border-borderColor accent-primary cursor-pointer"
                                        />
                                        <div>
                                          <h4 className="font-bold text-sm text-textColor">{mod.name}</h4>
                                          <p className="text-[11px] text-textMuted">{mod.name} permissions</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Toggles */}
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                      <button
                                        type="button"
                                        onClick={() => togglePermissionAction(mod.id, 'view')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                          currentPerm.view
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'bg-surfaceColor border border-borderColor text-textMuted hover:text-textColor'
                                        }`}
                                      >
                                        VIEW
                                      </button>

                                      {mod.hasActions && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => togglePermissionAction(mod.id, 'add')}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                              currentPerm.add
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'bg-surfaceColor border border-borderColor text-textMuted hover:text-textColor'
                                            }`}
                                          >
                                            ADD
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => togglePermissionAction(mod.id, 'edit')}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                              currentPerm.edit
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'bg-surfaceColor border border-borderColor text-textMuted hover:text-textColor'
                                            }`}
                                          >
                                            EDIT
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => togglePermissionAction(mod.id, 'delete')}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                              currentPerm.delete
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'bg-surfaceColor border border-borderColor text-textMuted hover:text-textColor'
                                            }`}
                                          >
                                            DEL
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Form Footer Buttons */}
                  <div className="pt-6 border-t border-borderColor flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRoleModalOpen(false)}
                      className="px-6 py-3 rounded-xl border border-borderColor text-textColor font-bold text-xs uppercase tracking-wider hover:bg-sidebarHover transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/30 transition-all cursor-pointer"
                    >
                      {editingRole ? 'UPDATE ROLE' : 'CREATE ROLE'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: CREATE / EDIT ADMIN USER */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surfaceColor border border-borderColor rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
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
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-4 border-t border-borderColor flex items-center justify-end gap-3">
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
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
