'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
            <ShieldCheck className="w-3 h-3" />
            ADMINISTRATOR
          </span>
        );
      case 'MANAGER':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
            <UserCheck className="w-3 h-3" />
            MANAGER
          </span>
        );
      case 'STAFF':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            <UserX className="w-3 h-3" />
            STAFF MEMBER
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between px-8 fixed right-0 top-0 left-64 z-10">
      {/* Welcome Left Section */}
      <div>
        <h1 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Welcome back, <span className="text-zinc-950 dark:text-white">{user?.name}</span>
        </h1>
      </div>

      {/* Profile/Badge Right Section */}
      <div className="flex items-center gap-4">
        {getRoleBadge(user?.role)}
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-850" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-900">
            {user?.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
