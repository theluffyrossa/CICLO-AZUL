import { api } from './api.service';
import { ApiResponse, Recipient } from '@/types';

class RecipientsService {
  async getActiveRecipients(): Promise<Recipient[]> {
    const response = await api.get<ApiResponse<Recipient[]>>('/recipients/active');
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async getRecipientById(id: string): Promise<Recipient> {
    const response = await api.get<ApiResponse<Recipient>>(`/recipients/${id}`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }
}

export const recipientsService = new RecipientsService();
