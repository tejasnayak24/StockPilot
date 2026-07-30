'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  History,
  Tags,
  Truck,
  Users,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isRole = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Inventory', href: '/inventory', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Transactions', href: '/transactions', icon: History, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Categories', href: '/categories', icon: Tags, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Team Members', href: '/users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'My Profile', href: '/profile', icon: User, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-zinc-300 flex flex-col h-screen fixed left-0 top-0 z-20 border-r border-zinc-800">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 gap-2 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white tracking-wider">
          SP
        </div>
        <span className="font-semibold text-lg text-white tracking-wide">StockPilot</span>
        <span className="text-[10px] bg-zinc-800 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-zinc-700">
          MVP
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {navItems
          .filter(item => isRole(item.roles))
          .map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'hover:bg-zinc-800 hover:text-white text-zinc-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* Bottom Footer User Section */}
      <div className="p-4 border-t border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-semibold text-zinc-300 border border-zinc-700">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-zinc-800/50 hover:bg-rose-950/40 hover:text-rose-200 border border-zinc-800 hover:border-rose-900/50 text-xs font-semibold tracking-wide text-zinc-400 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
