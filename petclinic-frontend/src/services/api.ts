import axios from 'axios';
import { Owner, Vet, PagedResponse, CreateOwnerRequest } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Owner API
export const ownerApi = {
  getAll: async (page: number = 0, size: number = 10, lastName?: string): Promise<PagedResponse<Owner>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (lastName) {
      params.append('lastName', lastName);
    }
    
    const response = await api.get<PagedResponse<Owner>>(`/api/owners?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Owner> => {
    const response = await api.get<Owner>(`/api/owners/${id}`);
    return response.data;
  },

  create: async (owner: CreateOwnerRequest): Promise<Owner> => {
    const response = await api.post<Owner>('/api/owners', owner);
    return response.data;
  },

  update: async (id: number, owner: CreateOwnerRequest): Promise<Owner> => {
    const response = await api.put<Owner>(`/api/owners/${id}`, owner);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/owners/${id}`);
  },
};

// Vet API
export const vetApi = {
  getAll: async (page: number = 0, size: number = 10): Promise<PagedResponse<Vet>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await api.get<PagedResponse<Vet>>(`/api/vets?${params}`);
    return response.data;
  },

  getAllSimple: async (): Promise<Vet[]> => {
    const response = await api.get<Vet[]>('/api/vets/all');
    return response.data;
  },
};

export default api; 
