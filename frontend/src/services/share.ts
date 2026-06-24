import api from './api';

export interface ShareGenerateRequest {
  report_id?: string;
  expires_in_days?: number;
}

export interface ShareGenerateResponse {
  token: string;
  expires_at: string;
}

export interface SharedDataResponse {
  patient_name: string;
  reports: any[];
  trends?: any;
}

export const generateShareLink = async (data: ShareGenerateRequest): Promise<ShareGenerateResponse> => {
  const response = await api.post('/share/generate', data);
  return response.data;
};

// Used by public unauthenticated pages
export const getSharedData = async (token: string): Promise<SharedDataResponse> => {
  // Use fetch or an axios instance without auth headers
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/share/${token}`);
  if (!response.ok) {
    throw new Error('Link expired or invalid');
  }
  return response.json();
};
