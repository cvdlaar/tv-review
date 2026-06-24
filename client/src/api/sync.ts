import api from './client';
import { SyncLog } from '../types';

export const syncApi = {
  logs: () => api.get<SyncLog[]>('/sync/logs').then((r) => r.data),
  run: (sourceId: string) => api.post<SyncLog>(`/sync/${sourceId}`).then((r) => r.data),
};
