'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Boxes,
  Percent,
  Store,
  CreditCard,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  PlusCircle,
  Clock,
  Truck,
  RotateCcw,
  Receipt,
  AlertTriangle,
  Sliders,
  FileText,
  Building2,
  PieChart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface SidebarSubItem {
  name: string;
  path: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SidebarCategory {
  category: string;
  path?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: SidebarSubItem[];
}

const MENU_DATA: SidebarCategory[] = [
  {
    category: 'Dashboard',
    icon: <LayoutDashboard size={19} />,
    path: '/dashboard',
  },
  {
    category: 'Products & Catalog',
    icon: <Package size={19} />,
    children: [
      { name: 'All Products', path: '/products', icon: <Package size={15} /> },
      { name: 'Add New Product', path: '/products?action=new', icon: <PlusCircle size={15} />, badge: 'Fast' },
      { name: 'Categories (3-Tier)', path: '/categories', icon: <Tags size={15} /> },
      { name: 'Inventory & Stock', path: '/inventory', icon: <Boxes size={15} /> },
    ],
  },
  {
    category: 'Orders & Sales',
    icon: <ShoppingCart size={19} />,
    badge: '12 New',
    children: [
      { name: 'All Orders', path: '/orders', icon: <ShoppingCart size={15} /> },
      { name: 'Billing & Invoices', path: '/billing', icon: <Receipt size={15} />, badge: 'GST' },
    ],
  },
  {
    category: 'Customer Directory',
    icon: <Users size={19} />,
    path: '/customers',
  },
  {
    category: 'Analytics & Insights',
    icon: <BarChart3 size={19} />,
    path: '/analytics',
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  // Automatically expand category if current path is in it
  useEffect(() => {
    MENU_DATA.forEach((cat) => {
      if (cat.children) {
        const hasActiveChild = cat.children.some(
          (child) => pathname === child.path || (child.path !== '/' && pathname.startsWith(child.path.split('?')[0]))
        );
        if (hasActiveChild && !openCategories.includes(cat.category)) {
          setOpenCategories((prev) => [...prev, cat.category]);
        }
      }
    });
  }, [pathname]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((item) => item !== categoryName)
        : [...prev, categoryName]
    );
  };

  const isActiveLink = (path?: string) => {
    if (!path) return false;
    const cleanPath = path.split('?')[0];
    if (cleanPath === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(cleanPath);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-sidebarBg border-r border-borderColor flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-borderColor bg-sidebarBg">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              U
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-textColor leading-tight">
                URBN FURNISH
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">
                Admin Console
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-sidebarHover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Role Snapshot Banner */}
        <div className="px-4 py-3 border-b border-borderColor/60 bg-bgColor/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-textColor">
                {user?.name || 'Super Admin'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
              {user?.roleName || 'Super Admin'}
            </span>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-1 text-[11px] font-bold tracking-wider uppercase text-textMuted/70">
            Store Management
          </div>

          {MENU_DATA.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isCategoryOpen = openCategories.includes(item.category);
            const isDirectActive = isActiveLink(item.path);

            if (!hasChildren && item.path) {
              return (
                <Link
                  key={item.category}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isDirectActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/30 font-semibold'
                    : 'text-sidebarText hover:text-textColor hover:bg-sidebarHover'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isDirectActive ? 'text-white' : 'text-textMuted'}>
                      {item.icon}
                    </span>
                    <span>{item.category}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDirectActive
                        ? 'bg-white/25 text-white'
                        : 'bg-primary/15 text-primary'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <div key={item.category} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(item.category)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isCategoryOpen
                    ? 'bg-sidebarHover/80 text-textColor font-semibold'
                    : 'text-sidebarText hover:text-textColor hover:bg-sidebarHover'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isCategoryOpen ? 'text-primary' : 'text-textMuted'}>
                      {item.icon}
                    </span>
                    <span>{item.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-textMuted transition-transform duration-200">
                      {isCategoryOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                  </div>
                </button>

                {/* Submenu Dropdown */}
                {isCategoryOpen && item.children && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-primary/20 ml-4 my-1 animate-fadeIn">
                    {item.children.map((subItem) => {
                      const isSubActive = pathname === subItem.path.split('?')[0];
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isSubActive
                            ? 'bg-primary/15 text-primary font-semibold'
                            : 'text-sidebarText hover:text-textColor hover:bg-sidebarHover'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isSubActive ? 'text-primary' : 'text-textMuted'}>
                              {subItem.icon}
                            </span>
                            <span>{subItem.name}</span>
                          </div>
                          {subItem.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-borderColor bg-sidebarBg">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-bgColor border border-borderColor/60 text-[11px] text-textMuted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              v2.4.0 • Production
            </span>
            <span className="font-semibold text-textColor">Urbn Furnish</span>
          </div>
        </div>
      </aside>
    </>
  );
}
