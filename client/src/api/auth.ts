import api from './client';
import { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data),
};
