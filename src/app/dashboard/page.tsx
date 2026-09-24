'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../lib/products';
import { getCurrentUser, logoutUser } from '../../lib/auth';
import { Product } from '../../lib/types';
import ProductModal from '../../components/ProductModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Params state extraction & sanitization
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = [10, 20, 50].includes(parseInt(searchParams.get('limit') || '10', 10))
    ? parseInt(searchParams.get('limit') || '10', 10)
    : 10;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sortBy') || '';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  // Local component states
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(search);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // AbortController ref for canceling outdated API requests (Race condition prevention)
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to update URL params
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Initial Auth Check & Categories Load
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    fetchCategories()
      .then(setCategories)
      .catch(() => console.error('Failed to load categories'));
  }, [router]);

  // Fetch Products whenever URL params change
  useEffect(() => {
    if (!user) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError('');

    const skip = (page - 1) * limit;

    fetchProducts({
      limit,
      skip,
      search,
      category,
      sortBy,
      order,
      signal: controller.signal,
    })
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setError('Failed to fetch products. Please check your connection and try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [user, page, limit, search, category, sortBy, order]);

  // Debounced Search Handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        updateUrlParams({ search: searchInput, page: 1, category: null });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, search, updateUrlParams]);

  // CRUD Handler functions
  const handleSaveProduct = async (formData: Partial<Product>) => {
    if (selectedProduct) {
      const updated = await updateProduct(selectedProduct.id, formData);
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...updated } : p))
      );
    } else {
      const created = await createProduct(formData);
      setProducts((prev) => [{ ...created, id: Date.now(), rating: 5 }, ...prev]);
      setTotal((prev) => prev + 1);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    await deleteProduct(deleteTarget.id);
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setTotal((prev) => prev - 1);
  };

  if (!user) return null;

  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Product Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, <strong>{user.firstName}</strong>
          </span>
          <button
            onClick={logoutUser}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium border border-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Controls Section: Search, Category Filter, Sorting & Add Button */}
        <div className="bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 bg-white"
            />
          </div>

          {/* Filters, Sort & Add New */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            {/* Category Filter */}
            <select
              value={category}
              disabled={!!search}
              onChange={(e) => updateUrlParams({ category: e.target.value, page: 1 })}
              className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 text-gray-900 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => updateUrlParams({ sortBy: e.target.value, page: 1 })}
              className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 bg-white"
            >
              <option value="">Sort By (Default)</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>

            {/* Sort Order */}
            {sortBy && (
              <select
                value={order}
                onChange={(e) => updateUrlParams({ order: e.target.value })}
                className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 bg-white"
              >
                <option value="asc">Ascending ⬆️</option>
                <option value="desc">Descending ⬇️</option>
              </select>
            )}

            {/* Add Product Button */}
            <button
              onClick={() => {
                setSelectedProduct(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        {search && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            ℹ️ Category filter is disabled while search query is active (DummyJSON API constraint).
          </p>
        )}

        {/* Content Body */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center border border-red-200">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => updateUrlParams({ page })}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border text-gray-500">
            No products found matching your criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Image</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <img src={p.thumbnail} alt={p.title} className="w-12 h-12 object-cover rounded" />
                      </td>
                      <td className="p-4 font-medium text-gray-900">{p.title}</td>
                      <td className="p-4 capitalize">{p.category}</td>
                      <td className="p-4 font-semibold">${p.price}</td>
                      <td className="p-4">⭐ {p.rating}</td>
                      <td className="p-4">{p.stock}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="px-2.5 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow border flex flex-col gap-3">
                  <div className="flex gap-4">
                    <img src={p.thumbnail} alt={p.title} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base">{p.title}</h3>
                      <p className="text-xs text-gray-500 capitalize">{p.category}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-blue-600 font-bold">${p.price}</span>
                        <span className="text-xs text-gray-600">⭐ {p.rating} | Stock: {p.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startItem}</span>–<span className="font-semibold">{endItem}</span> of{' '}
                <span className="font-semibold">{total}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => updateUrlParams({ limit: Number(e.target.value), page: 1 })}
                    className="border rounded px-2 py-1 focus:outline-none text-gray-900 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateUrlParams({ page: page - 1 })}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 text-gray-900 bg-white"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700 flex items-center">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateUrlParams({ page: page + 1 })}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 text-gray-900 bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={selectedProduct}
        categories={categories}
      />

      {/* Product Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
        title={deleteTarget?.title || ''}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}