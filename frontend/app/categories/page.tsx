'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Tag, CheckCircle, XCircle } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [statusInput, setStatusInput] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      const res = await apiRequest(`/categories?${queryParams.toString()}`);
      setCategories(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput) {
      showToast('Please enter category name', 'warning');
      return;
    }
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: nameInput,
          description: descInput || undefined,
        }),
      });
      showToast('Category created successfully!', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!nameInput) {
      showToast('Please enter category name', 'warning');
      return;
    }
    try {
      await apiRequest(`/categories/${selectedCategory.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: nameInput,
          description: descInput || undefined,
          isActive: statusInput,
        }),
      });
      showToast('Category updated successfully!', 'success');
      setIsEditOpen(false);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to update category', 'error');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate/delete this category?')) return;
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' });
      showToast('Category removed/deactivated successfully!', 'success');
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  const openEditModal = (cat: CategoryItem) => {
    setSelectedCategory(cat);
    setNameInput(cat.name);
    setDescInput(cat.description || '');
    setStatusInput(cat.isActive);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setNameInput('');
    setDescInput('');
    setStatusInput(true);
    setSelectedCategory(null);
  };

  const isWriteAuthorized = user && ['ADMIN', 'MANAGER'].includes(user.role);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Product Categories</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure product classifications to structure and filter catalog items.
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
            Add Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-8 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-zinc-400 outline-none transition-all duration-150"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-950/20">
                  <th className="px-6 py-4">Category Details</th>
                  <th className="px-6 py-4">Status</th>
                  {isWriteAuthorized && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                {categories.map(cat => (
                  <tr key={cat.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/40 dark:hover:bg-zinc-850/15 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-zinc-400" />
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-md">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-350 dark:border-emerald-900'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-350 dark:border-rose-900'
                      }`}>
                        {cat.isActive ? (
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
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {cat.isActive && (
                            <button
                              onClick={() => handleDeactivate(cat.id)}
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
            No categories registered yet.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 max-w-md w-full rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-500" />
              Add Product Category
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Stationery"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Classification details..."
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
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
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 max-w-md w-full rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 text-indigo-500" />
              Configure Category
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category Status
                </label>
                <select
                  value={statusInput ? 'true' : 'false'}
                  onChange={e => setStatusInput(e.target.value === 'true')}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="true">ACTIVE (Available for listing)</option>
                  <option value="false">INACTIVE (Hidden / soft-deleted)</option>
                </select>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
