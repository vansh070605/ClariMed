import api from './api';

export interface DashboardResponse {
  total_reports: number;
  abnormal_findings: number;
  improving_trends: number;
  latest_upload: string | null;
}

export const getDashboardMetrics = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>('/dashboard');
  return response.data;
};
