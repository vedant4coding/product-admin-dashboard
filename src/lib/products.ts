import api from './axios';
import { ProductResponse, Product } from './types';

export interface FetchProductsParams {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  signal?: AbortSignal;
}

export const fetchProducts = async (params: FetchProductsParams): Promise<ProductResponse> => {
  const { limit = 10, skip = 0, search, category, sortBy, order, signal } = params;

  let url = '/products';

  if (search) {
    url = `/products/search?q=${encodeURIComponent(search)}`;
  } else if (category && category !== 'all') {
    url = `/products/category/${encodeURIComponent(category)}`;
  }

  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  queryParams.append('skip', skip.toString());

  if (sortBy) {
    queryParams.append('sortBy', sortBy);
    queryParams.append('order', order || 'asc');
  }

  const response = await api.get<ProductResponse>(`${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`, { signal });
  return response.data;
};

export const fetchCategories = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/products/category-list');
  return response.data;
};