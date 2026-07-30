'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  DollarSign,
  Tag,
  Truck,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  costPrice: number;
  sellingPrice: number;
  imageUrl: string | null;
  categoryId: string;
  supplierId: string;
  isActive: boolean;
  category: { name: string };
  supplier: { name: string };
  inventory: { quantity: number; minimumStock: number } | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface SupplierOption {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Data lists
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [costInput, setCostInput] = useState(0.00);
  const [sellInput, setSellInput] = useState(0.00);
  const [imageInput, setImageInput] = useState('');
  const [catInput, setCatInput] = useState('');
  const [supInput, setSupInput] = useState('');
  const [minStockInput, setMinStockInput] = useState(10);
  const [statusInput, setStatusInput] = useState(true);

  const fetchRelations = async () => {
    try {
      const catsRes = await apiRequest('/categories?limit=100&isActive=true');
      const supsRes = await apiRequest('/suppliers?limit=100&isActive=true');
      setCategories(catsRes.data);
      setSuppliers(supsRes.data);
    } catch (e) {
      // Quiet fail or logged
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (categoryFilter) queryParams.append('categoryId', categoryFilter);
      if (supplierFilter) queryParams.append('supplierId', supplierFilter);
      if (statusFilter) queryParams.append('isActive', statusFilter);
      if (lowStockFilter) queryParams.append('lowStock', lowStockFilter);

      const res = await apiRequest(`/products?${queryParams.toString()}`);
      setProducts(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve catalog products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelations();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, supplierFilter, statusFilter, lowStockFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !catInput || !supInput || costInput <= 0 || sellInput <= 0) {
      showToast('Please check all input values', 'warning');
      return;
    }

    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: nameInput,
          sku: skuInput || undefined,
          barcode: barcodeInput || undefined,
          description: descInput || undefined,
          costPrice: costInput,
          sellingPrice: sellInput,
          imageUrl: imageInput || undefined,
          categoryId: catInput,
          supplierId: supInput,
          minimumStock: minStockInput,
        }),
      });
      showToast('Product added successfully!', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to add product', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!nameInput || !catInput || !supInput || costInput <= 0 || sellInput <= 0) {
      showToast('Please check all input values', 'warning');
      return;
    }

    try {
      await apiRequest(`/products/${selectedProduct.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: nameInput,
          sku: skuInput || undefined,
          barcode: barcodeInput || undefined,
          description: descInput || undefined,
          costPrice: costInput,
          sellingPrice: sellInput,
          imageUrl: imageInput || undefined,
          categoryId: catInput,
          supplierId: supInput,
          isActive: statusInput,
        }),
      });
      showToast('Product specifications updated!', 'success');
      setIsEditOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product', 'error');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate/delete this product?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      showToast('Product removed/deactivated successfully!', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const openEditModal = (p: ProductItem) => {
    setSelectedProduct(p);
    setNameInput(p.name);
    setSkuInput(p.sku);
    setBarcodeInput(p.barcode || '');
    setDescInput(p.description || '');
    setCostInput(p.costPrice);
    setSellInput(p.sellingPrice);
    setImageInput(p.imageUrl || '');
    setCatInput(p.categoryId);
    setSupInput(p.supplierId);
    setStatusInput(p.isActive);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setNameInput('');
    setSkuInput('');
    setBarcodeInput('');
    setDescInput('');
    setCostInput(0.00);
    setSellInput(0.00);
    setImageInput('');
    setCatInput('');
    setSupInput('');
    setMinStockInput(10);
    setStatusInput(true);
    setSelectedProduct(null);
  };

  const isWriteAuthorized = user && ['ADMIN', 'MANAGER'].includes(user.role);

  return (
    <AppLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Product Catalog</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse and configure product specifications, pricing, and references.
          </p>
        </div>
        {isWriteAuthorized && (
          <button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        )}
      </div>

      {/* Query Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 gap-4 flex flex-col md:flex-row mb-8 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-zinc-400 outline-none transition-all duration-150"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-44">
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 px-4 text-sm outline-none transition-all duration-150 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier Filter */}
        <div className="w-full md:w-44">
          <select
            value={supplierFilter}
            onChange={e => {
              setSupplierFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 px-4 text-sm outline-none transition-all duration-150 cursor-pointer"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-40">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 px-4 text-sm outline-none transition-all duration-150 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="w-full md:w-40">
          <select
            value={lowStockFilter}
            onChange={e => {
              setLowStockFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 px-4 text-sm outline-none transition-all duration-150 cursor-pointer"
          >
            <option value="">Stock Warnings</option>
            <option value="true">Low Stock Only</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-950/20">
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Pricing</th>
                  <th className="px-6 py-4">Stock level</th>
                  <th className="px-6 py-4">Relations</th>
                  <th className="px-6 py-4">Status</th>
                  {isWriteAuthorized && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                {products.map(p => (
                  <tr key={p.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/40 dark:hover:bg-zinc-850/15 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">SKU: {p.sku}</p>
                        {p.barcode && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">UPC: {p.barcode}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">Sale: ${Number(p.sellingPrice).toFixed(2)}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Cost: ${Number(p.costPrice).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.inventory ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            p.inventory.quantity <= p.inventory.minimumStock
                              ? 'text-rose-600 dark:text-rose-450'
                              : 'text-zinc-900 dark:text-white'
                          }`}>
                            {p.inventory.quantity}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            / min {p.inventory.minimumStock}
                          </span>
                          {p.inventory.quantity <= p.inventory.minimumStock && (
                            <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-700 font-extrabold px-1 rounded dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                              LOW
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <p className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-medium">
                        <Tag className="w-3.5 h-3.5 opacity-60" /> {p.category.name}
                      </p>
                      <p className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                        <Truck className="w-3.5 h-3.5 opacity-60" /> {p.supplier.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-350 dark:border-emerald-900'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-350 dark:border-rose-900'
                      }`}>
                        {p.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> INACTIVE
                          </>
                        )}
                      </span>
                    </td>
                    {isWriteAuthorized && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {p.isActive && (
                            <button
                              onClick={() => handleDeactivate(p.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md text-zinc-500 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm">
            No catalog products matched filters.
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

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 max-w-lg w-full rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-500" />
              Add Product details
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPad Pro 11"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    SKU (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={skuInput}
                    onChange={e => setSkuInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Barcode / UPC (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1901980667"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Details and specifications..."
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costInput || ''}
                    onChange={e => setCostInput(parseFloat(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellInput || ''}
                    onChange={e => setSellInput(parseFloat(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Category Reference
                  </label>
                  <select
                    required
                    value={catInput}
                    onChange={e => setCatInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Supplier Reference
                  </label>
                  <select
                    required
                    value={supInput}
                    onChange={e => setSupInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Minimum Alert Threshold
                  </label>
                  <input
                    type="number"
                    required
                    value={minStockInput}
                    onChange={e => setMinStockInput(parseInt(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.png"
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
                >
                  Register Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 max-w-lg w-full rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 text-indigo-500" />
              Configure Product Details
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    SKU (Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={skuInput}
                    onChange={e => setSkuInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Barcode / UPC
                  </label>
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costInput}
                    onChange={e => setCostInput(parseFloat(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellInput}
                    onChange={e => setSellInput(parseFloat(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Category Reference
                  </label>
                  <select
                    required
                    value={catInput}
                    onChange={e => setCatInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Supplier Reference
                  </label>
                  <select
                    required
                    value={supInput}
                    onChange={e => setSupInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={statusInput ? 'true' : 'false'}
                    onChange={e => setStatusInput(e.target.value === 'true')}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="true">ACTIVE (Visible in catalog)</option>
                    <option value="false">INACTIVE (Hidden / soft-deleted)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
