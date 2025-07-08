import { Owner, Vet, PagedResponse, S3FilesResponse, LocalFilesResponse, AdminInfo, ApiResponse, VetsResponse } from '@/types/api';

// API service for petclinic application
class ApiService {
  
  // Owners API
  async getOwners(page = 0, size = 10): Promise<PagedResponse<Owner>> {
    const response = await fetch(`/api/owners?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch owners');
    }
    return response.json();
  }

  async createOwner(owner: Omit<Owner, 'id' | 'pets'>): Promise<Owner> {
    const response = await fetch('/api/owners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(owner),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create owner');
    }
    
    return response.json();
  }

  async updateOwner(id: number, owner: Omit<Owner, 'pets'>): Promise<Owner> {
    const response = await fetch(`/api/owners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(owner),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update owner');
    }
    
    return response.json();
  }

  async deleteOwner(id: number): Promise<void> {
    const response = await fetch(`/api/owners/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete owner');
    }
  }

  // Vets API
  async getVets(page = 0, size = 10): Promise<PagedResponse<Vet>> {
    const response = await fetch(`/api/vets?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vets');
    }
    return response.json();
  }

  async getAllVets(): Promise<VetsResponse> {
    const response = await fetch('/api/vets/all');
    if (!response.ok) {
      throw new Error('Failed to fetch all vets');
    }
    return response.json();
  }

  // S3 API
  async getS3Files(): Promise<S3FilesResponse> {
    const response = await fetch('/api/s3/files');
    if (!response.ok) {
      throw new Error('Failed to fetch S3 files');
    }
    return response.json();
  }

  async getLocalFiles(): Promise<LocalFilesResponse> {
    const response = await fetch('/api/s3/local-files');
    if (!response.ok) {
      throw new Error('Failed to fetch local files');
    }
    return response.json();
  }

  async deleteS3File(filename: string, authHeader: string): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await fetch(`/api/s3/files/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete S3 file');
    }
    
    return response.json();
  }

  async deleteLocalFile(filename: string, authHeader: string): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await fetch(`/api/s3/local-files/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete local file');
    }
    
    return response.json();
  }

  async downloadFile(filename: string): Promise<Blob> {
    const response = await fetch(`/api/s3/download/${filename}`);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    return response.blob();
  }

  async exportVets(filename: string, source: string, uploadToS3: boolean, authHeader: string): Promise<ApiResponse<Record<string, unknown>>> {
    const params = new URLSearchParams({
      filename,
      source,
      uploadToS3: uploadToS3.toString()
    });

    const response = await fetch(`/api/s3/export/vets?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export vets');
    }
    
    return response.json();
  }

  async exportOwners(filename: string, uploadToS3: boolean, authHeader: string): Promise<ApiResponse<Record<string, unknown>>> {
    const params = new URLSearchParams({
      filename,
      uploadToS3: uploadToS3.toString()
    });

    const response = await fetch(`/api/s3/export/owners?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export owners');
    }
    
    return response.json();
  }

  async uploadVets(filename: string, source: string, authHeader: string): Promise<ApiResponse<Record<string, unknown>>> {
    const params = new URLSearchParams({
      filename,
      source
    });

    const response = await fetch(`/api/s3/upload/vets?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload vets');
    }
    
    return response.json();
  }

  async uploadOwners(filename: string, authHeader: string): Promise<ApiResponse<Record<string, unknown>>> {
    const params = new URLSearchParams({
      filename
    });

    const response = await fetch(`/api/s3/upload/owners?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload owners');
    }
    
    return response.json();
  }

  async getAdminInfo(): Promise<AdminInfo> {
    const response = await fetch('/api/s3/admin/info');
    if (!response.ok) {
      throw new Error('Failed to fetch admin info');
    }
    return response.json();
  }
}

export const apiService = new ApiService(); 
