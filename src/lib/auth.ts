import api from './axios';

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken?: string;
  token?: string;
  refreshToken: string;
}

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    // Try primary DummyJSON endpoint
    const response = await api.post<LoginResponse>('/auth/login', {
      username: username.trim(),
      password: password.trim(),
      expiresInMins: 60,
    });
    
    const authToken = response.data.accessToken || response.data.token;
    
    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    // Fallback for updated DummyJSON route structure if /auth/login fails
    const fallbackResponse = await api.post<LoginResponse>('/user/login', {
      username: username.trim(),
      password: password.trim(),
      expiresInMins: 60,
    });

    const authToken = fallbackResponse.data.accessToken || fallbackResponse.data.token;

    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(fallbackResponse.data));
    }

    return fallbackResponse.data;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};