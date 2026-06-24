import api from './api';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export const sendMessage = async (message: string): Promise<ChatResponse> => {
  const response = await api.post('/chat', { message });
  return response.data;
};
