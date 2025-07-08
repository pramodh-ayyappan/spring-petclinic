# PetClinic Frontend

A modern Next.js web application for the Spring PetClinic sample application, featuring veterinarian management, pet owner records, and S3 file operations with admin authentication.

## Overview

This frontend application serves as the user interface for the PetClinic backend, providing:
- **Owner Management**: View and search pet owners
- **Veterinarian Management**: Browse vets with data source visibility (database vs JSON file)
- **S3 File Operations**: Upload/download files with admin authentication
- **Export/Import**: Data export functionality with admin controls
- **Health Monitoring**: Backend connectivity status and diagnostics

## Architecture

- **Framework**: Next.js 15 with App Router and TypeScript
- **UI Components**: Radix UI with Tailwind CSS styling
- **API Proxy**: Next.js API routes proxy requests to Spring Boot backend
- **Authentication**: Admin authentication for protected operations
- **Deployment**: Docker-ready with standalone output optimization

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PetClinic backend running (see `../petclinic-backend/README.md`)

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API proxy: http://localhost:3000/api/*

### Build and Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Configuration

### Environment Variables

The frontend uses the following environment variables for configuration:

#### Backend Connection
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_URL` | Backend API URL (server-side) | `http://petclinic-be.default.svc.cluster.local:8080` | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL (client-side) | `/` | No |

**Notes**:
- `API_URL` is used by Next.js API routes (server-side) to proxy requests to the backend
- `NEXT_PUBLIC_API_URL` is used by client-side code (browser) and defaults to relative URLs
- For Kubernetes deployments, use the default Kubernetes service DNS names
- For local development, set `API_URL=http://localhost:8080`

#### Node.js Environment
| Variable | Description | Values |
|----------|-------------|--------|
| `NODE_ENV` | Runtime environment | `development`, `production`, `test` |

### Configuration Examples

#### Local Development
```bash
# .env.local
API_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

#### Docker Deployment
```bash
# Environment variables for Docker container
API_URL=http://petclinic-backend:8080
NEXT_PUBLIC_API_URL=/
NODE_ENV=production
```

#### Kubernetes Deployment
```yaml
# ConfigMap example
apiVersion: v1
kind: ConfigMap
metadata:
  name: petclinic-frontend-config
data:
  API_URL: "http://petclinic-be.default.svc.cluster.local:8080"
  NEXT_PUBLIC_API_URL: "/"
  NODE_ENV: "production"
```

## Deployment

### Docker Deployment

#### Build Docker Image
```bash
# Build optimized Docker image
docker build -t petclinic-frontend .

# Run container
docker run -p 3000:3000 \
  -e API_URL=http://petclinic-backend:8080 \
  -e NEXT_PUBLIC_API_URL=/ \
  petclinic-frontend
```

#### Docker Compose
```yaml
version: '3.8'
services:
  petclinic-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://petclinic-backend:8080
      - NEXT_PUBLIC_API_URL=/
      - NODE_ENV=production
    depends_on:
      - petclinic-backend
```

### Kubernetes Deployment

#### Basic Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: petclinic-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: petclinic-frontend
  template:
    metadata:
      labels:
        app: petclinic-frontend
    spec:
      containers:
      - name: petclinic-frontend
        image: petclinic-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: API_URL
          value: "http://petclinic-be.default.svc.cluster.local:8080"
        - name: NEXT_PUBLIC_API_URL
          value: "/"
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: petclinic-frontend
spec:
  selector:
    app: petclinic-frontend
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### With ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: petclinic-frontend-config
data:
  API_URL: "http://petclinic-be.default.svc.cluster.local:8080"
  NEXT_PUBLIC_API_URL: "/"
  NODE_ENV: "production"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: petclinic-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: petclinic-frontend
  template:
    metadata:
      labels:
        app: petclinic-frontend
    spec:
      containers:
      - name: petclinic-frontend
        image: petclinic-frontend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: petclinic-frontend-config
```

## API Proxy Routes

The frontend includes Next.js API routes that proxy requests to the backend:

### Core APIs
- `GET /api/health` - Health check with backend connectivity status
- `GET /api/owners` - List pet owners with pagination
- `GET /api/owners/[id]` - Get specific owner details
- `GET /api/vets` - List veterinarians
- `GET /api/vets/all` - Enhanced vets endpoint with data source information

### S3 File Operations (Admin Authentication Required)
- `GET /api/s3/files` - List S3 files
- `GET /api/s3/local-files` - List local export files
- `DELETE /api/s3/files/[filename]` - Delete S3 file
- `DELETE /api/s3/local-files/[filename]` - Delete local file
- `GET /api/s3/download/[filename]` - Download file from S3
- `GET /api/s3/admin/info` - Get S3 admin information

### Export/Upload Operations (Admin Authentication Required)
- `POST /api/s3/export/vets` - Export vets data
- `POST /api/s3/export/owners` - Export owners data
- `POST /api/s3/upload/vets` - Upload vets data to S3
- `POST /api/s3/upload/owners` - Upload owners data to S3

### Debug Endpoint
- `GET /api/s3/debug` - Comprehensive diagnostics (Admin required)

## Features

### Owner Management
- Browse all pet owners with pagination
- Search functionality
- View owner details and associated pets

### Veterinarian Management
- List all veterinarians with specialties
- **Data Source Visibility**: See if vets are loaded from database, JSON file, or merged
- Visual indicators for data sources

### S3 File Operations
- **Admin Authentication**: Secure access to file operations
- Upload and download files to/from S3
- Local file export management
- File deletion with confirmation

### Health Monitoring
- Frontend and backend connectivity status
- Detailed diagnostics for troubleshooting
- Real-time health checks

## Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API proxy routes
│   ├── owners/         # Owner management pages
│   ├── vets/           # Veterinarian pages
│   └── s3/             # S3 file management
├── components/         # Reusable UI components
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Development Commands
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

## Troubleshooting

### Common Issues

#### Backend Connection Issues
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Expected response includes backend connectivity status
{
  "status": "UP",
  "frontend": "UP", 
  "backend": "UP",
  "backendUrl": "http://localhost:8080"
}
```

#### 404 Errors on API Calls
- Verify `API_URL` environment variable points to correct backend
- Check backend is running and accessible
- Verify backend endpoints match proxy routes

#### Admin Authentication Issues
- Ensure backend has admin credentials configured
- Check `PETCLINIC_ADMIN_USERNAME` and `PETCLINIC_ADMIN_PASSWORD` in backend
- Verify Authorization header format: `Basic base64(username:password)`

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npx tsc --noEmit
```

### Debug Endpoints
Use the debug endpoint for comprehensive diagnostics:
```bash
# Admin authentication required
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" http://localhost:3000/api/s3/debug
```

## Security Considerations

### Admin Authentication
- All S3 and export operations require admin authentication
- Credentials are validated against backend configuration
- Use environment variables for admin credentials (never hardcode)

### CORS Configuration
- Backend CORS configuration allows frontend domain
- Verify `CORS_ALLOWED_ORIGINS` in backend configuration

### Production Deployment
- Use HTTPS in production environments
- Implement proper ingress/load balancer configuration
- Consider network policies for Kubernetes deployments

## Performance Optimization

### Docker Optimization
- Uses Next.js standalone output for minimal image size
- Multi-stage build for production optimization
- Image optimization disabled for production builds

### Build Optimization
- Turbopack enabled for faster development builds
- TypeScript compilation with strict settings
- ESLint configuration for code quality

## Contributing

1. Follow the existing code style and TypeScript patterns
2. Use the established component structure with Radix UI
3. Ensure all API calls go through the proxy routes
4. Add proper error handling and loading states
5. Update types in `src/types/api.ts` for new endpoints

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) - UI components
- [TypeScript](https://www.typescriptlang.org/docs/) - Type system documentation
