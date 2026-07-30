'use client';

import React from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Mail, Key, ShieldCheck, UserCheck, UserX } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold px-3 py-1 rounded border border-indigo-200 dark:border-indigo-900">
            <ShieldCheck className="w-4 h-4" />
            ADMINISTRATOR
          </span>
        );
      case 'MANAGER':
        return (
          <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold px-3 py-1 rounded border border-emerald-200 dark:border-emerald-900">
            <UserCheck className="w-4 h-4" />
            MANAGER
          </span>
        );
      case 'STAFF':
      default:
        return (
          <span className="flex items-center gap-1 text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700">
            <UserX className="w-4 h-4" />
            STAFF MEMBER
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review your account profile details, system roles, and authorization status.
        </p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-150 dark:border-zinc-850 mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-indigo-600/10">
            {user?.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1 space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user?.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {getRoleBadge(user?.role)}
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold px-2 py-0.5 rounded dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-350">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Profile Attributes List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Email Address</span>
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-white mt-1 sm:mt-0">{user?.email}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Key className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Account ID Reference</span>
            </div>
            <span className="text-sm font-mono text-zinc-900 dark:text-white mt-1 sm:mt-0">{user?.id}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Authentication Strategy</span>
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-white mt-1 sm:mt-0">JWT Access & Refresh</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
