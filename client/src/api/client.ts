import axios from 'axios';
import type { AnalyzeResponse, RecommendResponse, Language } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// Request / Response logging
// ============================================================

client.interceptors.request.use((config) => {
  console.info(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

client.interceptors.response.use(
  (response) => {
    console.info(`[API] ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('[API] ⚠ Backend unreachable — will use offline data');
    } else {
      console.error(`[API] ✖ ${error.response?.status ?? 'NETWORK_ERROR'} ${error.config?.url}`, error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Analysis API
// ============================================================

interface AnalyzePayload {
  district: { id: string; name: string; state: string; lat: number; lon: number };
  crop: { id: string; name: string };
  stage: { id: string; name: string };
}

export const analysisApi = {
  async analyze(payload: AnalyzePayload): Promise<AnalyzeResponse> {
    const { data } = await client.post<AnalyzeResponse>('/analyze', payload);
    return data;
  },
};

// ============================================================
// Recommendations API
// ============================================================

interface RecommendPayload {
  district: { id: string; name: string; state: string };
  crop: { id: string; name: string };
  stage: { id: string; name: string };
  riskPayload: AnalyzeResponse['data'];
  language: Language;
}

export const recommendationsApi = {
  async recommend(payload: RecommendPayload): Promise<RecommendResponse> {
    const { data } = await client.post<RecommendResponse>('/recommend', payload);
    return data;
  },
};

// ============================================================
// Reference Data APIs
// ============================================================

export const cropsApi = {
  async getAll() {
    const { data } = await client.get('/crops');
    return data;
  },
  async getStages(cropId: string) {
    const { data } = await client.get(`/crops/${cropId}/stages`);
    return data;
  },
};

export const districtsApi = {
  async getAll() {
    const { data } = await client.get('/districts');
    return data;
  },
};
