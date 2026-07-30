'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { apiRequest } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Tags,
  Truck,
  Plus,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalUsers: number;
    totalItemsInStock: number;
    totalCostValue: number;
    totalSellingValue: number;
    lowStockProductsCount: number;
  };
  lowStockAlerts: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minimumStock: number;
  }[];
  recentTransactions: {
    id: string;
    productName: string;
    sku: string;
    type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    quantity: number;
    remarks: string;
    operator: string;
    createdAt: string;
  }[];
  categoryDistribution: { name: string; value: number }[];
  supplierDistribution: { name: string; value: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const summary = await apiRequest('/dashboard/summary');
      setData(summary);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm text-zinc-500 font-medium tracking-wide">Compiling report metrics...</span>
        </div>
      </AppLayout>
    );
  }

  const stats = data?.stats;

  return (
    <AppLayout>
      {/* Upper header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard Summary</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time stock values, transaction history, and inventory distribution metrics.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-350 transition-all duration-150"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Total Catalog Items
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 block">
              {stats?.totalProducts || 0}
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Quantity */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Items in Stock
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 block">
              {stats?.totalItemsInStock || 0}
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Valuation Cost */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Inventory Value (Cost)
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 block">
              ${stats?.totalCostValue?.toLocaleString() || '0.00'}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Low Stock Warnings
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 block">
              {stats?.lowStockProductsCount || 0}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            stats && stats.lowStockProductsCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50 animate-pulse'
              : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-800'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Transactions & Alerts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Low Stock Warnings Alerts Table */}
          {data && data.lowStockAlerts.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Urgent Restock Needed
                </h3>
                <Link
                  href="/inventory?lowStock=true"
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Adjust Stock levels
                </Link>
              </div>
              <div className="space-y-3">
                {data.lowStockAlerts.map(product => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-semibold text-rose-900 dark:text-rose-200">{product.name}</p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-700 dark:text-rose-350">{product.quantity}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1">
                        / min {product.minimumStock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Recent Audit Activities</h3>
              <Link
                href="/transactions"
                className="text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-0.5"
              >
                View full audit logs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {data && data.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {data.recentTransactions.map(tx => (
                      <tr key={tx.id} className="text-zinc-700 dark:text-zinc-300">
                        <td className="py-3">
                          <p className="font-semibold text-zinc-900 dark:text-white">{tx.productName}</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{tx.sku}</p>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            tx.type === 'STOCK_IN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-350 dark:border-emerald-900/50'
                              : tx.type === 'STOCK_OUT'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-350 dark:border-rose-900/50'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-350 dark:border-amber-900/50'
                          }`}>
                            {tx.type === 'STOCK_IN' && <TrendingUp className="w-3 h-3" />}
                            {tx.type === 'STOCK_OUT' && <TrendingUp className="w-3 h-3 rotate-180" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 text-right font-bold ${
                          tx.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                        </td>
                        <td className="py-3 text-right text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                          {tx.operator}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category & Supplier Distributions */}
        <div className="space-y-8">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2 text-sm">
              <Tags className="w-4 h-4 text-indigo-500" />
              Category Statistics
            </h3>
            {data && data.categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {data.categoryDistribution.map((cat, idx) => {
                  const total = stats?.totalProducts || 1;
                  const pct = Math.round((cat.value / total) * 100);
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                        <span>{cat.name}</span>
                        <span>{cat.value} items ({pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-450 text-xs">No product categories mapped.</div>
            )}
          </div>

          {/* Supplier Distribution */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-indigo-500" />
              Supplier Distributions
            </h3>
            {data && data.supplierDistribution.length > 0 ? (
              <div className="space-y-4">
                {data.supplierDistribution.map((sup, idx) => {
                  const total = stats?.totalProducts || 1;
                  const pct = Math.round((sup.value / total) * 100);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                        <span>{sup.name}</span>
                        <span>{sup.value} items ({pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-450 text-xs">No vendor suppliers mapped.</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
