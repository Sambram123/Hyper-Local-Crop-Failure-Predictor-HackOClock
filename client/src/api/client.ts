import axios from 'axios';
import type { AnalyzeResponse, RecommendResponse, Language } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

const client = axios.create({
  baseURL: BASE_URL,
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

export interface AnalysisRequest {
  district: string;
  state: string;
  crop: string;
  growthStage: string;
  language: Language;
}

export const analysisApi = {
  async analyze(request: AnalysisRequest): Promise<AnalyzeResponse> {
    const payload = {
      district: request.district,
      state: request.state,
      crop: request.crop,
      growthStage: request.growthStage,
      language: request.language
    };
    const { data } = await client.post<AnalyzeResponse>('/api/analyze', payload);
    return data;
  },
};

// ============================================================
// Recommendations API
// ============================================================

export interface RecommendRequestPayload {
  district: string;
  crop: string;
  growthStage: string;
  riskPayload: {
    droughtScore: number;
    pestScore: number;
    nutrientScore: number;
    compositeScore: number;
    droughtLevel: string;
    pestLevel: string;
    nutrientLevel: string;
    droughtDriver: string;
    pestDriver: string;
    nutrientDriver: string;
    weather: {
      current: {
        temperature: { max: number; min: number };
        precipitation: { value: number };
        humidity: { value: number };
      };
      forecast: unknown[];
    };
    ndvi: { value: number; anomaly: number; status: string } | null;
    forecast7Day: unknown[];
  };
  language: Language;
}

export const recommendationsApi = {
  async recommend(request: RecommendRequestPayload): Promise<RecommendResponse> {
    const payload = {
      district: request.district,
      crop: request.crop,
      growthStage: request.growthStage,
      language: request.language,
      riskPayload: request.riskPayload
    };
    const { data } = await client.post<RecommendResponse>('/api/recommend', payload);
    return data;
  },
};