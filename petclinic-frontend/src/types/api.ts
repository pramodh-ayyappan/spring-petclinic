// API Types for PetClinic Backend

export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  pets?: Pet[];
}

export interface Pet {
  id: number;
  name: string;
  birthDate: string;
  type: PetType;
  ownerId?: number;
  visits?: Visit[];
}

export interface PetType {
  id: number;
  name: string;
}

export interface Visit {
  id: number;
  date: string;
  description: string;
  petId?: number;
}

export interface Vet {
  id: number;
  firstName: string;
  lastName: string;
  specialties?: Specialty[];
}

export interface Specialty {
  id: number;
  name: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  number: number;
}

export interface CreateOwnerRequest {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
}

export interface ApiError {
  message: string;
  errors?: string[] | Record<string, string>;
}

// S3 and Export API Types
export interface S3FileInfo {
  key: string;
  size: number;
  lastModified: string; // ISO string format
}

export interface S3FilesResponse {
  files: string[];
  count: number;
  bucketName?: string;
  credentialsValid?: boolean;
  error?: string;
}

export interface S3DetailedFilesResponse {
  files: S3FileInfo[];
  count: number;
  bucketName?: string;
  credentialsValid?: boolean;
  error?: string;
}

export interface LocalFilesResponse {
  files: string[];
  count: number;
  directory: string;
  error?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface AdminInfo {
  username: string;
  authRequired: boolean;
  authType: string;
} 
