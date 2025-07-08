// Base entity types
export interface BaseEntity {
  id?: number;
}

export interface NamedEntity extends BaseEntity {
  name: string;
}

// Owner and Pet related types
export interface Owner extends BaseEntity {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  pets?: Pet[];
}

export interface Pet extends BaseEntity {
  name: string;
  birthDate: string;
  type: PetType;
  owner: Owner;
  visits?: Visit[];
}

// PetType inherits id and name from NamedEntity
export type PetType = NamedEntity;

export interface Visit extends BaseEntity {
  date: string;
  description: string;
  pet: Pet;
}

export interface CreateOwnerRequest {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
}

// Vet related types
// Specialty inherits id and name from NamedEntity
export type Specialty = NamedEntity;

export interface Vet extends BaseEntity {
  firstName: string;
  lastName: string;
  specialties?: Specialty[];
}

// API Response types
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message: string;
}

// S3 related types
export interface S3FilesResponse {
  files: string[];
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

export interface AdminInfo {
  username: string;
  authRequired: boolean;
  authType: string;
}

// API Configuration types
export interface ApiConfig {
  apiUrl: string;
  baseUrl: string;
  mode: 'development' | 'production' | 'kubernetes';
  timestamp: string;
  features: {
    s3Enabled: boolean;
    adminEnabled: boolean;
    exportEnabled: boolean;
  };
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

export interface AxiosError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

// Data source information for vets
export interface VetDataSource {
  type: 'merged' | 'database' | 'additional';
  counts: {
    total: number;
    database: number;
    additional: number;
    merged: number;
  };
  sources: {
    database: boolean;
    additionalJson: boolean;
    merged: boolean;
  };
  description: string;
}

export interface VetsResponse {
  vets: Vet[];
  dataSource: VetDataSource;
} 
