import api from './api';

export interface TrendAnalysis {
  biomarker: string;
  classification: string;
  change_percent: number;
  first_value: number;
  latest_value: number;
  report_count: number;
}

export interface TrendsResponse {
  total_reports: number;
  tracked_biomarkers: number;
  trends: TrendAnalysis[];
}

export type TrendHistoryResponse = Record<string, { category: string; history: { date: string; value: number }[] }>;

export const getTrends = async (): Promise<TrendsResponse> => {
  const response = await api.get<TrendsResponse>('/trends');
  return response.data;
};

export const getTrendsHistory = async (): Promise<TrendHistoryResponse> => {
  const response = await api.get<TrendHistoryResponse>('/trends/history');
  return response.data;
};
