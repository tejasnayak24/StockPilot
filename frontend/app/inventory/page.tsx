'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';
import {
  Search,
  Sliders,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Minus,
  Settings2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  minimumStock: number;
  maximumStock: number | null;
  updatedAt: string;
  product: {
    name: string;
    sku: string;
    barcode: string | null;
    costPrice: number;
    sellingPrice: number;
    category: { name: string };
    supplier: { name: string };
  };
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Data list
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // URL parameter check for lowStock
  const lowStockParam = searchParams.get('lowStock') === 'true';
  const [lowStockFilter, setLowStockFilter] = useState(lowStockParam);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);

  // Form states
  const [adjustType, setAdjustType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>('STOCK_IN');
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustRemarks, setAdjustRemarks] = useState('');
  const [adjustOverride, setAdjustOverride] = useState(false);

  const [minStockInput, setMinStockInput] = useState(10);
  const [maxStockInput, setMaxStockInput] = useState('');

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (lowStockFilter) queryParams.append('lowStock', 'true');

      const res = await apiRequest(`/inventory?${queryParams.toString()}`);
      setInventories(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch inventory reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Keep filter state synced if URL parameter changes
    setLowStockFilter(searchParams.get('lowStock') === 'true');
  }, [searchParams]);

  useEffect(() => {
    fetchInventory();
  }, [page, search, lowStockFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventory || adjustQty <= 0 && adjustType !== 'ADJUSTMENT') {
      showToast('Please specify a positive adjust amount', 'warning');
      return;
    }

    try {
      await apiRequest(`/inventory/${selectedInventory.productId}/adjust`, {
        method: 'POST',
        body: JSON.stringify({
          type: adjustType,
          quantity: adjustType === 'STOCK_OUT' ? Math.abs(adjustQty) : adjustQty,
          remarks: adjustRemarks || undefined,
          isOverride: adjustType === 'ADJUSTMENT' ? adjustOverride : undefined,
        }),
      });
      showToast('Stock quantity adjusted successfully!', 'success');
      setIsAdjustOpen(false);
      resetForm();
      fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  const handleLimitsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventory) return;
    try {
      await apiRequest(`/inventory/${selectedInventory.productId}/limits`, {
        method: 'PATCH',
        body: JSON.stringify({
          minimumStock: minStockInput,
          maximumStock: maxStockInput ? parseInt(maxStockInput) : null,
        }),
      });
      showToast('Stock limits updated successfully!', 'success');
      setIsLimitsOpen(false);
      resetForm();
      fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock limits', 'error');
    }
  };

  const openAdjustModal = (inv: InventoryItem) => {
    setSelectedInventory(inv);
    setAdjustType('STOCK_IN');
    setAdjustQty(1);
    setAdjustRemarks('');
    setAdjustOverride(false);
    setIsAdjustOpen(true);
  };

  const openLimitsModal = (inv: InventoryItem) => {
    setSelectedInventory(inv);
    setMinStockInput(inv.minimumStock);
    setMaxStockInput(inv.maximumStock ? inv.maximumStock.toString() : '');
    setIsLimitsOpen(true);
  };

  const resetForm = () => {
    setSelectedInventory(null);
    setAdjustType('STOCK_IN');
    setAdjustQty(1);
    setAdjustRemarks('');
    setAdjustOverride(false);
    setMinStockInput(10);
    setMaxStockInput('');
  };

  const getStockStatus = (quantity: number, min: number, max: number | null) => {
    if (quantity <= min) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-250 text-rose-700 font-extrabold px-2 py-0.5 rounded dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          LOW STOCK
        </span>
      );
    }
    if (max && quantity >= max) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-250 text-amber-700 font-extrabold px-2 py-0.5 rounded dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300">
          <AlertCircle className="w-3.5 h-3.5" />
          OVERSTOCKED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold px-2 py-0.5 rounded dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-350">
        <CheckCircle2 className="w-3.5 h-3.5" />
        ADEQUATE
      </span>
    );
  };

  const isLimitsAuthorized = user && ['ADMIN', 'MANAGER'].includes(user.role);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Stock Room Inventory</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Reconcile current quantities, track safety stock thresholds, and configure alarms.
          </p>
        </div>
      </div>

      {/* Query Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 mb-8 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search inventory by product name or SKU..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-zinc-400 outline-none transition-all duration-150"
          />
        </div>

        {/* Low Stock Toggle */}
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            id="low-stock"
            checked={lowStockFilter}
            onChange={e => {
              setLowStockFilter(e.target.checked);
              setPage(1);
              const url = e.target.checked ? '/inventory?lowStock=true' : '/inventory';
              router.push(url);
            }}
            className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="low-stock" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 select-none cursor-pointer flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Low Stock Warnings Only
          </label>
        </div>
      </div>

      {/* Inventory Levels Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inventories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-950/20">
                  <th className="px-6 py-4">Product Specs</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Alert Thresholds</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                {inventories.map(inv => (
                  <tr key={inv.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/40 dark:hover:bg-zinc-850/15 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{inv.product.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">SKU: {inv.product.sku}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{inv.product.category.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${
                        inv.quantity <= inv.minimumStock
                          ? 'text-rose-600 dark:text-rose-450'
                          : 'text-zinc-900 dark:text-white'
                      }`}>
                        {inv.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5 font-medium">
                        <p className="text-zinc-500">Min: <span className="text-zinc-900 dark:text-zinc-300">{inv.minimumStock}</span></p>
                        <p className="text-zinc-500">Max: <span className="text-zinc-900 dark:text-zinc-300">{inv.maximumStock || 'No Limit'}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStockStatus(inv.quantity, inv.minimumStock, inv.maximumStock)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openAdjustModal(inv)}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-300 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Adjust
                        </button>
                        {isLimitsAuthorized && (
                          <button
                            onClick={() => openLimitsModal(inv)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-800 transition-colors"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm">
            No stock levels matched filters.
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

      {/* Stock Adjustment Modal */}
      {isAdjustOpen && selectedInventory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 max-w-md w-full rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex flex-col mb-4">
              <span>Adjust Stock levels</span>
              <span className="text-xs text-zinc-400 font-normal mt-0.5">Product: {selectedInventory.product.name} (SKU: {selectedInventory.product.sku})</span>
            </h3>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Adjustment Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setAdjustType('STOCK_IN'); setAdjustOverride(false); }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                      adjustType === 'STOCK_IN'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-350'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> STOCK IN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdjustType('STOCK_OUT'); setAdjustOverride(false); }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                      adjustType === 'STOCK_OUT'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> STOCK OUT
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADJUSTMENT')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                      adjustType === 'ADJUSTMENT'
                        ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" /> OVERRIDE
                  </button>
                </div>
              </div>

              {adjustType === 'ADJUSTMENT' && (
                <div className="flex items-center gap-2 py-1 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850">
                  <input
                    type="checkbox"
                    id="is-override"
                    checked={adjustOverride}
                    onChange={e => setAdjustOverride(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="is-override" className="text-xs text-zinc-500 select-none cursor-pointer">
                    Override stock directly (Sets stock value to exact amount)
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  {adjustType === 'ADJUSTMENT' && adjustOverride ? 'New Stock Amount' : 'Quantity Amount'}
                </label>
                <input
                  type="number"
                  required
                  min={adjustType === 'ADJUSTMENT' && adjustOverride ? 0 : 1}
                  value={adjustQty}
                  onChange={e => setAdjustQty(parseInt(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Remarks / Notes
                </label>
                <textarea
                  required
                  placeholder="Reason for stock adjustments..."
                  value={adjustRemarks}
                  onChange={e => setAdjustRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Stock limits Modal */}
      {isLimitsOpen && selectedInventory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 max-w-md w-full rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex flex-col mb-4">
              <span>Safety Stock Alarms</span>
              <span className="text-xs text-zinc-400 font-normal mt-0.5">Product: {selectedInventory.product.name} (SKU: {selectedInventory.product.sku})</span>
            </h3>
            <form onSubmit={handleLimitsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Minimum Stock Threshold (Low stock warning trigger)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={minStockInput}
                  onChange={e => setMinStockInput(parseInt(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Maximum Stock Limit (Optional - overstock trigger)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={maxStockInput}
                  onChange={e => setMaxStockInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsLimitsOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
                >
                  Save Stock Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm text-zinc-500 font-medium tracking-wide">Syncing inventory database parameters...</span>
        </div>
      </AppLayout>
    }>
      <InventoryContent />
    </Suspense>
  );
}
