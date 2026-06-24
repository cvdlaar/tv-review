import api from './client';
import { SlideTemplate } from '../types';

export const templatesApi = {
  list: () => api.get<SlideTemplate[]>('/templates').then((r) => r.data),
  create: (data: Partial<SlideTemplate>) => api.post<SlideTemplate>('/templates', data).then((r) => r.data),
  update: (id: string, data: Partial<SlideTemplate>) =>
    api.put<SlideTemplate>(`/templates/${id}`, data).then((r) => r.data),
  duplicate: (id: string) => api.post<SlideTemplate>(`/templates/${id}/duplicate`).then((r) => r.data),
};
