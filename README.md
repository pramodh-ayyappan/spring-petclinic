# Spring PetClinic - Full Stack Application

A modernized version of the Spring PetClinic sample application with completely separated frontend and backend architectures, featuring comprehensive S3 integration, data export capabilities, and multi-platform Docker support.

## 🏗️ Architecture Overview

```
spring-petclinic/
├── petclinic-backend/          # Spring Boot REST API
│   ├── src/main/java/          # Java source code
│   ├── src/main/resources/     # Configuration & static resources
│   ├── k8s/                    # Kubernetes manifests
│   ├── Dockerfile              # Production Docker build
│   ├── Dockerfile.fast         # Optimized Docker build
│   └── README.md               # 📖 Detailed backend documentation
├── petclinic-frontend/         # Next.js Frontend
│   ├── src/app/                # Next.js App Router pages
│   ├── src/components/         # React components
│   ├── src/services/           # API service layer
│   ├── Dockerfile              # Production Docker build
│   └── README.md               # 📖 Detailed frontend documentation
├── docker-compose.yml          # Multi-service Docker setup
├── build-optimized.sh          # Multi-platform Docker builds
├── start.sh                    # Automated startup script
└── additional-vets.json        # Sample additional veterinarian data
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Start all services (PostgreSQL backend)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access Points:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8080
- 🗄️ **Database**: localhost:5432

### Option 2: Development Mode
```bash
# Terminal 1: Start Backend
cd petclinic-backend
./mvnw spring-boot:run

# Terminal 2: Start Frontend  
cd petclinic-frontend
npm install && npm run dev
```

### Option 3: Automated Startup
```bash
# Intelligent startup script
./start.sh
```

## 🎯 Key Features

### 🏥 Core PetClinic Functionality
- **Owner Management**: Browse, search, and manage pet owners
- **Veterinarian Management**: View vets with specialty information
- **Pet Records**: Complete pet information and visit history
- **Data Source Visibility**: See if vets are loaded from database, JSON file, or merged

### 📊 Advanced S3 & Export Features
- **Local Exports**: Export data to JSON files in `/app/exports`
- **S3 Integration**: Upload/download files directly to/from S3
- **Admin Authentication**: Secure access to sensitive operations
- **File Management**: List, download, and delete S3 files
- **Comprehensive API**: RESTful endpoints for all operations

### 🔒 Security & Authentication
- **Admin Portal**: Protected S3 and export operations
- **CORS Configuration**: Secure frontend-backend communication
- **Environment-based Credentials**: Configurable admin authentication

### 🌐 Multi-Platform Support
- **Docker Multi-Architecture**: AMD64, ARM64, ARM/v7 support
- **Kubernetes Ready**: Complete K8s manifests included
- **Cloud Deployment**: AWS, GCP, Azure compatible

## 💻 Technology Stack

### Backend (Spring Boot)
- **Java 17** with Spring Boot 3.4.2
- **Database**: H2 (dev) / PostgreSQL / MySQL
- **Security**: Spring Security with custom admin auth
- **API**: RESTful with pagination and DTOs
- **S3**: AWS SDK integration with multiple auth methods
- **Build**: Maven with Spring Boot DevTools

### Frontend (Next.js)
- **Next.js 15** with App Router and TypeScript
- **UI**: Tailwind CSS with Radix UI components
- **State Management**: React hooks and context
- **API**: Fetch-based service layer with proxy routes
- **Build**: Optimized standalone output for Docker

### Infrastructure
- **Docker**: Multi-stage builds with optimization
- **Database**: PostgreSQL (default) or MySQL
- **Reverse Proxy**: Nginx configuration included
- **Monitoring**: Health checks and diagnostics

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Database profile | `h2` |
| `MYSQL_URL` / `POSTGRES_URL` | Database connection | - |
| `AWS_ACCESS_KEY_ID` | AWS credentials | - |
| `AWS_S3_BUCKET` | S3 bucket name | - |
| `PETCLINIC_ADMIN_USERNAME` | Admin username | `admin` |
| `PETCLINIC_ADMIN_PASSWORD` | Admin password | `admin` |
| `PETCLINIC_ADDITIONAL_VETS_ENABLED` | Enable additional vets | `true` |

#### Frontend Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend URL (server-side) | `http://petclinic-be.default.svc.cluster.local:8080` |
| `NEXT_PUBLIC_API_URL` | Backend URL (client-side) | `/` |
| `NODE_ENV` | Runtime environment | `production` |

### Configuration Examples

#### Docker Compose
```yaml
services:
  backend:
    environment:
      - SPRING_PROFILES_ACTIVE=postgres
      - POSTGRES_URL=jdbc:postgresql://postgres:5432/petclinic
      - AWS_S3_BUCKET=my-petclinic-bucket
      - PETCLINIC_ADMIN_USERNAME=admin
      - PETCLINIC_ADMIN_PASSWORD=secure-password
  
  frontend:
    environment:
      - API_URL=http://backend:8080
      - NEXT_PUBLIC_API_URL=/
```

#### Kubernetes
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: petclinic-config
data:
  # Backend config
  SPRING_PROFILES_ACTIVE: "postgres"
  POSTGRES_URL: "jdbc:postgresql://postgres.default.svc.cluster.local:5432/petclinic"
  AWS_S3_BUCKET: "my-petclinic-bucket"
  # Frontend config
  API_URL: "http://petclinic-be.default.svc.cluster.local:8080"
  NEXT_PUBLIC_API_URL: "/"
```

## 🐳 Deployment Options

### 1. Docker Compose (Development/Testing)
```bash
# PostgreSQL backend
docker-compose up -d

# MySQL backend
docker-compose --profile mysql up -d

# With Nginx reverse proxy
docker-compose --profile nginx up -d
```

### 2. Multi-Platform Docker Builds
```bash
# Build for AMD64 and ARM64
./build-optimized.sh

# Build and push to registry
./build-optimized.sh --push

# Custom platforms
./build-optimized.sh --platforms linux/amd64,linux/arm64,linux/arm/v7
```

### 3. Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f petclinic-backend/k8s/

# Check deployment status
kubectl get pods -l app=petclinic
```

### 4. Cloud Deployment
- **AWS**: ECS, EKS, or Elastic Beanstalk
- **Google Cloud**: GKE or Cloud Run
- **Azure**: AKS or Container Instances
- **Vercel/Netlify**: Frontend-only deployment

## 📊 S3 Integration & Admin Features

### Admin Authentication
Default credentials (change for production):
- **Username**: `admin`
- **Password**: `admin`

### S3 Operations
1. **Navigate to S3 page**: http://localhost:3000/s3
2. **Authenticate**: Use admin credentials when prompted
3. **Available Operations**:
   - Export vets/owners data (local + S3)
   - Upload data to S3 bucket
   - List and manage S3 files
   - Download exported files

### API Endpoints
- `GET /api/s3/files` - List S3 files
- `POST /api/s3/vets/export` - Export vets data
- `POST /api/s3/owners/export` - Export owners data
- `DELETE /api/s3/files/{filename}` - Delete S3 file
- `GET /api/s3/admin/info` - S3 configuration info

## 🔍 Health Monitoring

### Health Check Endpoints
- **Frontend**: http://localhost:3000/api/health
- **Backend**: http://localhost:8080/actuator/health

### Diagnostic Tools
- **Debug Endpoint**: http://localhost:3000/api/s3/debug (admin required)
- **Logs**: `docker-compose logs -f`
- **Status**: `docker-compose ps`

## 🛠️ Development

### Prerequisites
- **Java 17+** (backend)
- **Node.js 18+** (frontend)
- **Docker & Docker Compose** (optional)
- **Maven** (included via wrapper)

### Development Workflow
```bash
# Backend development
cd petclinic-backend
./mvnw spring-boot:run

# Frontend development
cd petclinic-frontend
npm run dev

# Full stack with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Testing
```bash
# Backend tests
cd petclinic-backend
./mvnw test

# Frontend tests
cd petclinic-frontend
npm test

# Integration tests
./test-s3-integration.sh
```

## 📖 Detailed Documentation

### Service-Specific READMEs
- **[Backend README](./petclinic-backend/README.md)** - Complete backend configuration, API documentation, database setup, S3 integration, and deployment guides
- **[Frontend README](./petclinic-frontend/README.md)** - Frontend configuration, API proxy setup, component architecture, and deployment instructions

### Deployment Guides
- **[Docker Deployment Guide](./README-DOCKER.md)** - Comprehensive Docker and Docker Compose setup
- **[Multi-Platform Builds](./README-MULTIPLATFORM.md)** - Cross-architecture Docker builds and registry integration

### Configuration Files
- **[Kubernetes Manifests](./petclinic-backend/k8s/)** - Complete K8s deployment configurations
- **[Docker Compose](./docker-compose.yml)** - Multi-service container orchestration
- **[Build Scripts](./build-optimized.sh)** - Automated multi-platform builds

## 🚨 Troubleshooting

### Common Issues

#### Connection Problems
```bash
# Check health endpoints
curl http://localhost:3000/api/health
curl http://localhost:8080/actuator/health

# Check Docker containers
docker-compose ps
docker-compose logs backend
```

#### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Check database logs
docker-compose logs postgres
```

#### S3 Configuration
```bash
# Test S3 connectivity
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" http://localhost:3000/api/s3/debug
```

#### Build Problems
```bash
# Clean Docker cache
docker system prune -a

# Rebuild images
docker-compose build --no-cache
```

### Getting Help
- **Backend Issues**: See [Backend README](./petclinic-backend/README.md#troubleshooting)
- **Frontend Issues**: See [Frontend README](./petclinic-frontend/README.md#troubleshooting)
- **Docker Issues**: See [Docker README](./README-DOCKER.md#troubleshooting)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the coding standards** in each service directory
4. **Test thoroughly** including Docker builds
5. **Submit a pull request**

### Development Standards
- **Backend**: Follow Spring Boot conventions, use DTOs, add tests
- **Frontend**: TypeScript strict mode, component-based architecture
- **Docker**: Multi-stage builds, security best practices
- **Documentation**: Update relevant README files

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE.txt](LICENSE.txt) file for details.

## 🙏 Acknowledgments

- **Spring PetClinic Team** - Original sample application
- **Spring Boot Community** - Framework and ecosystem
- **Next.js Team** - Frontend framework
- **Docker Community** - Containerization platform
