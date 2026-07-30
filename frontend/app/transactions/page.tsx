'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Sliders,
  History,
  FileText,
} from 'lucide-react';

interface TransactionItem {
  id: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  quantity: number;
  remarks: string | null;
  createdAt: string;
  inventory: {
    product: {
      name: string;
      sku: string;
    };
  };
  createdBy: {
    name: string;
    email: string;
    role: string;
  };
}

function TransactionsContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (typeFilter) queryParams.append('type', typeFilter);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const res = await apiRequest(`/transactions?${queryParams.toString()}`);
      setTransactions(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch transaction logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search, typeFilter, startDate, endDate]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Audit Transaction Logs</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse through historical stock entries, adjust records, and operator signatures.
          </p>
        </div>
      </div>

      {/* Query Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 gap-4 flex flex-col md:flex-row mb-8 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or remarks..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-zinc-400 outline-none transition-all duration-150"
          />
        </div>

        {/* Action Type Filter */}
        <div className="w-full md:w-44">
          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 px-4 text-sm outline-none transition-all duration-150 cursor-pointer"
          >
            <option value="">All Action Types</option>
            <option value="STOCK_IN">STOCK IN</option>
            <option value="STOCK_OUT">STOCK OUT</option>
            <option value="ADJUSTMENT">ADJUSTMENT / OVERRIDE</option>
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex gap-2 w-full md:w-auto items-center">
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition-all duration-150 cursor-pointer"
          />
          <span className="text-zinc-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition-all duration-150 cursor-pointer"
          />
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-950/20">
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Action Type</th>
                  <th className="px-6 py-4 text-right">Delta Amount</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                {transactions.map(tx => (
                  <tr key={tx.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/40 dark:hover:bg-zinc-850/15 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-55" />
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{tx.inventory.product.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">SKU: {tx.inventory.product.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        tx.type === 'STOCK_IN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-350 dark:border-emerald-900'
                          : tx.type === 'STOCK_OUT'
                          ? 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/30 dark:text-rose-350 dark:border-rose-900'
                          : 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-350 dark:border-amber-900'
                      }`}>
                        {tx.type === 'STOCK_IN' && <TrendingUp className="w-3.5 h-3.5" />}
                        {tx.type === 'STOCK_OUT' && <TrendingUp className="w-3.5 h-3.5 rotate-180" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${
                      tx.quantity > 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450'
                    }`}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5 opacity-55" />
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{tx.createdBy.name}</p>
                          <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{tx.createdBy.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 italic max-w-xs truncate">
                      {tx.remarks || 'No remarks provided.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm">
            No transactions matched filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mb-8">
          <span className="text-xs text-zinc-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm text-zinc-500 font-medium tracking-wide">Syncing transaction history logs...</span>
        </div>
      </AppLayout>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
