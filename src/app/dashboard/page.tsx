'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts, fetchCategories } from '../../lib/products';
import { getCurrentUser, logoutUser } from '../../lib/auth';
import { Product } from '../../lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProducts({ limit: 10, skip: 0 });
      setProducts(data.products);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError('Failed to fetch products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Bar */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Product Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, <strong>{user.firstName}</strong></span>
          <button
            onClick={logoutUser}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium border border-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-200">
            <p>{error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Hidden on desktop) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow border flex gap-4">
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
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}