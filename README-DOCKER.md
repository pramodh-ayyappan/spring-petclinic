# Spring PetClinic - Docker Deployment Guide

This guide explains how to run the Spring PetClinic application using Docker and Docker Compose.

## Architecture Overview

The application consists of:
- **Frontend**: Next.js application (port 3000)
- **Backend**: Spring Boot API (port 8080) 
- **Database**: PostgreSQL (port 5432) or MySQL (port 3306)
- **Reverse Proxy**: Nginx (optional, port 80)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- At least 2GB of available disk space

## Quick Start

### 1. Basic Setup (PostgreSQL)

```bash
# Clone the repository
git clone <repository-url>
cd spring-petclinic

# Start all services with PostgreSQL
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

### 2. Alternative Setup (MySQL)

```bash
# Start with MySQL instead of PostgreSQL
docker-compose --profile mysql up -d
```

### 3. With Nginx Reverse Proxy

```bash
# Start with Nginx reverse proxy
docker-compose --profile nginx up -d
```

Application will be available at http://localhost (port 80)

## Configuration Options

### Environment Variables

#### Backend Configuration
```yaml
environment:
  - SPRING_PROFILES_ACTIVE=postgres          # Database profile (postgres/mysql)
  - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/petclinic
  - SPRING_DATASOURCE_USERNAME=petclinic
  - SPRING_DATASOURCE_PASSWORD=petclinic
  - CORS_ALLOWED_ORIGINS=http://localhost:3000
  - PETCLINIC_ADDITIONAL_VETS_ENABLED=true
  - PETCLINIC_ADDITIONAL_VETS_FILE=/app/data/additional-vets.json
```

#### Frontend Configuration
```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=http://localhost:8080
  - PORT=3000
```

### Database Configuration

#### PostgreSQL (Default)
- **Database**: petclinic
- **Username**: petclinic
- **Password**: petclinic
- **Port**: 5432

#### MySQL (Optional)
- **Database**: petclinic
- **Username**: petclinic
- **Password**: petclinic
- **Port**: 3306
- **Root Password**: root

## Data Persistence

### Database Data
- PostgreSQL data: `postgres_data` volume
- MySQL data: `mysql_data` volume

### Additional Vets Data
The `additional-vets.json` file is mounted from the host into the backend container for additional veterinarian data.

### S3 Integration & Export Features
### Admin Authentication

The S3 export and management features are protected with admin authentication. Set your admin credentials using environment variables:

```bash
export ADMIN_USERNAME=your_admin_username
export ADMIN_PASSWORD=your_secure_password
```

Default credentials (for development only):
- Username: `admin`
- Password: `admin123`

**⚠️ Important**: Change these default credentials before deploying to production!

#### Accessing the Admin UI

1. Navigate to the **S3 & Export** page from the main navigation
2. Click any export or upload button - you'll be prompted to log in
3. Use your admin credentials to authenticate
4. You'll see an admin indicator in the top-right corner when authenticated
5. Click "Logout" to end your admin session

The application includes comprehensive S3 integration and data export capabilities:

#### Local File Exports
- Export veterinarian data (merged, database-only, or additional-only)
- Export owner data to JSON files
- Files are saved to the `/app/exports` directory (mounted as `./exports` on host)

#### S3 Integration
- Upload data directly to S3 bucket
- List and manage S3 files with metadata
- Delete files from S3 storage
- Combined local + S3 export options

#### Web Interface
Access the S3 & Export management page at http://localhost:3000/s3 to:
- Export data with different options
- View and manage S3 files
- Download local exported files
- Monitor export operations

#### API Endpoints
- `GET /api/s3/files` - List S3 files
- `GET /api/s3/files/detailed` - List S3 files with metadata
- `GET /api/s3/files/local` - List local exported files
- `POST /api/s3/vets/export` - Export vets data
- `POST /api/s3/owners/export` - Export owners data
- `POST /api/s3/vets/upload` - Upload vets to S3
- `POST /api/s3/owners/upload` - Upload owners to S3
- `DELETE /api/s3/files/{filename}` - Delete S3 file

#### Testing S3 Integration
Run the comprehensive test script:
```bash
chmod +x test-s3-integration.sh
./test-s3-integration.sh
```

## Development vs Production

### Development Mode
```bash
# Run with hot reload and development features
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production Mode
```bash
# Run in production mode (default)
docker-compose up -d
```

## Common Commands

### Building Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Managing Services
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View real-time logs
docker-compose logs -f backend

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Database Management
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U petclinic -d petclinic

# Connect to MySQL
docker-compose exec mysql mysql -u petclinic -p petclinic

# Backup database
docker-compose exec postgres pg_dump -U petclinic petclinic > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U petclinic petclinic
```

## Health Checks

All services include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8080/actuator/health    # Backend
curl http://localhost:3000/api/health         # Frontend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :8080
   lsof -i :5432
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Verify database is ready
   docker-compose exec postgres pg_isready -U petclinic
   ```

3. **Frontend can't connect to backend**
   - Check CORS configuration
   - Verify NEXT_PUBLIC_API_URL environment variable
   - Check network connectivity between containers

4. **Out of memory issues**
   ```bash
   # Check container resource usage
   docker stats
   
   # Increase Docker memory limit in Docker Desktop
   ```

### Debugging

```bash
# View all container logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f backend

# Execute shell in container
docker-compose exec backend bash
docker-compose exec frontend sh

# Inspect container
docker inspect petclinic-backend
```

## Security Considerations

### Production Deployment
- Change default database passwords
- Use secrets management for sensitive data
- Enable HTTPS with SSL certificates
- Configure proper firewall rules
- Regular security updates

### Environment Variables for Production
```bash
# Use strong passwords
POSTGRES_PASSWORD=<strong-password>
MYSQL_ROOT_PASSWORD=<strong-password>
MYSQL_PASSWORD=<strong-password>

# Limit CORS origins
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Performance Tuning

### Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
```

### Database Optimization
```yaml
postgres:
  command: >
    postgres
    -c max_connections=200
    -c shared_buffers=256MB
    -c effective_cache_size=1GB
```

## Monitoring

### Container Monitoring
```bash
# Resource usage
docker stats

# Container health
docker-compose ps
```

### Application Monitoring
- Backend metrics: http://localhost:8080/actuator/metrics
- Backend health: http://localhost:8080/actuator/health
- Frontend health: http://localhost:3000/api/health

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a
``` 
