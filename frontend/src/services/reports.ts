import api from './api';
import { ReportMetadata, ReportDetail } from '../types';

export const uploadReport = async (file: File): Promise<ReportMetadata> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ReportMetadata>('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeReport = async (reportId: string): Promise<unknown> => {
  const response = await api.post(`/reports/${reportId}/analyze`);
  return response.data;
};

export const summarizeReport = async (reportId: string): Promise<unknown> => {
  const response = await api.post(`/reports/${reportId}/summarize`);
  return response.data;
};

export const getReportDetails = async (reportId: string): Promise<ReportDetail> => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

export const getReportsList = async (skip: number = 0, limit: number = 100): Promise<ReportMetadata[]> => {
  const response = await api.get<ReportMetadata[]>(`/reports?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const deleteReport = async (reportId: string): Promise<{status: string}> => {
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};
