import api from './client';
import { Screen } from '../types';

export const screensApi = {
  list: () => api.get<Screen[]>('/screens').then((r) => r.data),
  get: (id: string) => api.get<Screen>(`/screens/${id}`).then((r) => r.data),
  create: (data: Partial<Screen>) => api.post<Screen>('/screens', data).then((r) => r.data),
  update: (id: string, data: Partial<Screen>) => api.put<Screen>(`/screens/${id}`, data).then((r) => r.data),
  regenerateKey: (id: string) => api.post<{ screenKey: string }>(`/screens/${id}/regenerate-key`).then((r) => r.data),
};
