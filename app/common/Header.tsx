'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  User,
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GLOBAL_SEARCH_ITEMS } from '@/lib/mockData';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof GLOBAL_SEARCH_ITEMS>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize theme from storage or system preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('urbn_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('urbn_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      const results = GLOBAL_SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(path);
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  const notifications = [
    {
      id: 1,
      title: 'New Order #ORD-9821',
      description: 'Eleanor Vance placed order for Nordic Oak Table (₹1,240.00)',
      time: '5m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      description: 'Minimalist Walnut Bed Frame down to 5 units in warehouse A',
      time: '25m ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Settlement Completed',
      description: 'Daily merchant payout batch processed successfully',
      time: '2h ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-headerBg px-4 sm:px-6 border-b border-borderColor shadow-xs transition-colors duration-200">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-textMuted hover:text-textColor hover:bg-bgColor transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1" ref={searchRef}>
          <div className="flex items-center px-3.5 py-2 bg-bgColor rounded-xl border border-borderColor focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search size={17} className="text-textMuted mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search products, orders, categories, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setIsSearchOpen(true);
              }}
              className="w-full bg-transparent text-sm text-textColor outline-hidden placeholder:text-textMuted/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-textMuted hover:text-textColor font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surfaceColor border border-borderColor rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 text-[11px] font-bold text-textMuted uppercase border-b border-borderColor bg-bgColor/50">
                Quick Navigation Results
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-borderColor/40">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResultClick(item.path)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-sidebarHover transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="font-medium text-textColor">{item.title}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-bgColor border border-borderColor text-textMuted">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-xl text-textMuted hover:text-textColor hover:bg-bgColor border border-transparent hover:border-borderColor transition-all"
        >
          {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl text-textMuted hover:text-textColor hover:bg-bgColor border border-transparent hover:border-borderColor transition-all"
            title="Notifications"
          >
            <Bell size={19} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surfaceColor border border-borderColor rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-borderColor flex items-center justify-between bg-bgColor/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-textColor">Notifications</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    2 New
                  </span>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-borderColor/50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-sidebarHover transition-colors flex gap-3 ${
                      n.unread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {n.unread ? (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      ) : (
                        <CheckCircle2 size={14} className="text-textMuted" />
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-semibold text-textColor">{n.title}</p>
                      <p className="text-xs text-textMuted leading-relaxed">{n.description}</p>
                      <span className="text-[10px] text-textMuted/70 block mt-1">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-borderColor bg-bgColor/30 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    router.push('/orders');
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  View all store activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-borderColor mx-1 hidden sm:block" />

        {/* Profile Dropdown at the Right Corner */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-bgColor border border-transparent hover:border-borderColor transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-hover text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-textColor leading-tight">
                {user?.name || 'Super Admin'}
              </span>
              <span className="text-[10px] text-textMuted font-medium">
                {user?.email || 'superadmin@gmail.com'}
              </span>
            </div>
            <ChevronDown size={14} className="text-textMuted hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surfaceColor border border-borderColor rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
              {/* Profile Card Header */}
              <div className="p-4 border-b border-borderColor bg-bgColor/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-hover text-white font-bold flex items-center justify-center text-base shadow-sm">
                    {user?.name ? user.name.charAt(0) : 'A'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-textColor">
                      {user?.name || 'Super Admin'}
                    </span>
                    <span className="text-xs text-textMuted truncate max-w-[150px]">
                      {user?.email || 'superadmin@gmail.com'}
                    </span>
                    <span className="mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary w-fit uppercase">
                      {user?.roleName || 'Super Admin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Actions (Commented Out) */}
              {/* <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-textColor hover:bg-sidebarHover rounded-xl transition-colors"
                >
                  <SettingsIcon size={16} className="text-textMuted" />
                  <span>Admin Settings & Roles</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/analytics');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-textColor hover:bg-sidebarHover rounded-xl transition-colors"
                >
                  <Sparkles size={16} className="text-textMuted" />
                  <span>Store Performance</span>
                </button>

                <a
                  href="https://urbnfurnish.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-textColor hover:bg-sidebarHover rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag size={16} className="text-textMuted" />
                    <span>View Live Storefront</span>
                  </div>
                  <ExternalLink size={13} className="text-textMuted" />
                </a>
              </div> */}

              {/* Logout Button */}
              <div className="p-2 border-t border-borderColor bg-bgColor/20">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
