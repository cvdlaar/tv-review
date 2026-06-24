import api from './client';
import { Brand } from '../types';

export const brandsApi = {
  list: () => api.get<Brand[]>('/brands').then((r) => r.data),
  create: (data: Partial<Brand>) => api.post<Brand>('/brands', data).then((r) => r.data),
  update: (id: string, data: Partial<Brand>) => api.put<Brand>(`/brands/${id}`, data).then((r) => r.data),
};
