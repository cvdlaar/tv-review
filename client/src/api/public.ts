import axios from 'axios';
import { TvScreenData } from '../types';

const publicApi = axios.create({ baseURL: '/api' });

export const fetchTvScreen = (slug: string, key: string): Promise<TvScreenData> =>
  publicApi.get<TvScreenData>(`/public/screens/${slug}`, { params: { key } }).then((r) => r.data);
