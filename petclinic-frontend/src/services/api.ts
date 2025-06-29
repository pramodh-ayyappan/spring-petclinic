import axios from 'axios';
import { Owner, Vet, PagedResponse, CreateOwnerRequest, S3FileInfo, S3FilesResponse, S3DetailedFilesResponse, LocalFilesResponse, ApiResponse, AdminInfo } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Owner API
export const ownerApi = {
  getAll: async (page: number = 0, size: number = 10): Promise<PagedResponse<Owner>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
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

  search: async (lastName: string, page: number = 0, size: number = 10): Promise<PagedResponse<Owner>> => {
    const params = new URLSearchParams({
      lastName,
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await api.get<PagedResponse<Owner>>(`/api/owners/search?${params}`);
    return response.data;
  },
};

// Vet API - now simplified to use backend merging
export const vetApi = {
  // Get paginated vets (merged data by default)
  getAll: async (page: number = 0, size: number = 10, source: string = 'merged'): Promise<PagedResponse<Vet>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      source: source,
    });
    
    const response = await api.get<PagedResponse<Vet>>(`/api/vets?${params}`);
    return response.data;
  },

  // Get all vets without pagination (merged data by default)
  getAllVets: async (source: string = 'merged'): Promise<Vet[]> => {
    const params = new URLSearchParams({
      source: source,
    });
    
    const response = await api.get<Vet[]>(`/api/vets/all?${params}`);
    return response.data;
  },

  // Get specifically merged vets (database + JSON)
  getMerged: async (page: number = 0, size: number = 10): Promise<PagedResponse<Vet>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await api.get<PagedResponse<Vet>>(`/api/vets/merged?${params}`);
    return response.data;
  },

  // Get only database vets
  getDatabaseOnly: async (page: number = 0, size: number = 10): Promise<PagedResponse<Vet>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await api.get<PagedResponse<Vet>>(`/api/vets/database?${params}`);
    return response.data;
  },

  // Get only additional vets from JSON
  getAdditionalOnly: async (): Promise<Vet[]> => {
    const response = await api.get<Vet[]>('/api/vets/additional');
    return response.data;
  },
};

// Helper function to create Basic Auth header
const createBasicAuthHeader = (username: string, password: string): string => {
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
};

// S3 API
export const s3Api = {
  // Get admin info
  getAdminInfo: async (): Promise<AdminInfo> => {
    const response = await api.get<AdminInfo>('/api/s3/admin/info');
    return response.data;
  },
  // List S3 files
  listFiles: async (): Promise<S3FilesResponse> => {
    const response = await api.get<S3FilesResponse>('/api/s3/files');
    return response.data;
  },

  // List S3 files with metadata
  listFilesDetailed: async (): Promise<S3DetailedFilesResponse> => {
    const response = await api.get<S3DetailedFilesResponse>('/api/s3/files/detailed');
    return response.data;
  },

  // Delete S3 file
  deleteFile: async (filename: string, username: string, password: string): Promise<ApiResponse> => {
    const authHeader = createBasicAuthHeader(username, password);
    const response = await api.delete<ApiResponse>(`/api/s3/files/${encodeURIComponent(filename)}`, {
      headers: {
        'Authorization': authHeader,
      },
    });
    return response.data;
  },

  // Upload vets to S3
  uploadVets: async (filename: string = 'vets', source: string = 'merged', username: string, password: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      filename,
      source,
    });
    
    const authHeader = createBasicAuthHeader(username, password);
    const response = await api.post<ApiResponse>(`/api/s3/vets/upload?${params}`, {}, {
      headers: {
        'Authorization': authHeader,
      },
    });
    return response.data;
  },

  // Upload owners to S3
  uploadOwners: async (filename: string = 'owners', username: string, password: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      filename,
    });
    
    const authHeader = createBasicAuthHeader(username, password);
    const response = await api.post<ApiResponse>(`/api/s3/owners/upload?${params}`, {}, {
      headers: {
        'Authorization': authHeader,
      },
    });
    return response.data;
  },

  // Export vets to local file
  exportVets: async (filename: string = 'vets', source: string = 'merged', uploadToS3: boolean = false, username: string, password: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      filename,
      source,
      uploadToS3: uploadToS3.toString(),
    });
    
    const authHeader = createBasicAuthHeader(username, password);
    const response = await api.post<ApiResponse>(`/api/s3/vets/export?${params}`, {}, {
      headers: {
        'Authorization': authHeader,
      },
    });
    return response.data;
  },

  // Export owners to local file
  exportOwners: async (filename: string = 'owners', uploadToS3: boolean = false, username: string, password: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      filename,
      uploadToS3: uploadToS3.toString(),
    });
    
    const authHeader = createBasicAuthHeader(username, password);
    const response = await api.post<ApiResponse>(`/api/s3/owners/export?${params}`, {}, {
      headers: {
        'Authorization': authHeader,
      },
    });
    return response.data;
  },

  // List local files
  listLocalFiles: async (): Promise<LocalFilesResponse> => {
    const response = await api.get<LocalFilesResponse>('/api/s3/files/local');
    return response.data;
  },

  // Delete local file
  deleteLocalFile: async (filename: string, username: string, password: string): Promise<ApiResponse> => {
    const authHeader = createBasicAuthHeader(username, password);
    const response = await api.delete<ApiResponse>(`/api/s3/files/local/${encodeURIComponent(filename)}`, {
      headers: {
        'Authorization': authHeader,
      },
    });
    return response.data;
  },

  // Download local file
  downloadFile: async (filename: string): Promise<Blob> => {
    const response = await api.get(`/api/s3/files/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

export default api; 
