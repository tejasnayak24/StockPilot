'use client';

import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useToast } from '../../context/ToastContext';
import { Settings, Bell, Code, Info, ArrowUpRight } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [skuAuto, setSkuAuto] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const handleSave = () => {
    showToast('Application configuration saved!', 'success');
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Application Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure safety stock alerts, SKU automation rules, and system documentation.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* SKU Automation Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4 text-indigo-500" />
            Inventory SKU Automation
          </h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-300">Auto-Generate Product SKUs</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Automatically generate unique SKUs from category and name parameters if left blank.
              </p>
            </div>
            <input
              type="checkbox"
              checked={skuAuto}
              onChange={e => setSkuAuto(e.target.checked)}
              className="w-9 h-5 bg-zinc-200 rounded-full appearance-none checked:bg-indigo-600 relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 checked:after:translate-x-4 after:transition-all cursor-pointer border border-zinc-300"
            />
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4 text-indigo-500" />
            Stock Notifications & Alarms
          </h3>
          <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-850">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-300">Low Stock Visual Warnings</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Highlight items falling below minimum safety limits with blinking alarm badges.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={e => setNotifyLowStock(e.target.checked)}
                className="w-9 h-5 bg-zinc-200 rounded-full appearance-none checked:bg-indigo-600 relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 checked:after:translate-x-4 after:transition-all cursor-pointer border border-zinc-300"
              />
            </div>

            <div className="flex items-center justify-between py-3 pt-4">
              <div>
                <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-300">Weekly Audit Email Summary</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Receive a weekly summary report of transaction logs and inventory valuations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={e => setEmailDigest(e.target.checked)}
                className="w-9 h-5 bg-zinc-200 rounded-full appearance-none checked:bg-indigo-600 relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 checked:after:translate-x-4 after:transition-all cursor-pointer border border-zinc-300"
              />
            </div>
          </div>
        </div>

        {/* Developer / Swagger Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <Code className="w-4 h-4 text-indigo-500" />
            Developer Resources
          </h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-300">Interactive Swagger Documentation</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Explore, test, and validate API endpoints interactively via Swagger UI.
              </p>
            </div>
            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500 font-bold px-4 py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-150"
            >
              Open API Docs <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
