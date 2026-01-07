import api from './api';
import type { ChatRequest, ChatResponse } from '../types/chat.type';

export const chatWithAgent = async (payload: ChatRequest): Promise<ChatResponse> => {
  const response = await api.post('/agent', payload);
  return response.data;
};
