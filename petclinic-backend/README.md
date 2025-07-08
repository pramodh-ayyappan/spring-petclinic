# Spring PetClinic Backend API

This is the backend API for the Spring PetClinic application, providing REST endpoints for managing owners, pets, veterinarians, and visits.

## Technology Stack

- **Java 17**
- **Spring Boot 3.4.2**
- **Spring Data JPA**
- **H2 Database** (default, with MySQL/PostgreSQL support)
- **Maven** for dependency management

## Environment Variables Configuration

The PetClinic backend supports configuration through environment variables. Below is a comprehensive list of all configurable options:

### Database Configuration

#### MySQL Database
```bash
MYSQL_URL=jdbc:mysql://localhost/petclinic          # MySQL connection URL
MYSQL_USER=petclinic                                # MySQL username
MYSQL_PASS=petclinic                                # MySQL password
```

#### PostgreSQL Database
```bash
POSTGRES_URL=jdbc:postgresql://localhost/petclinic  # PostgreSQL connection URL
POSTGRES_USER=petclinic                             # PostgreSQL username
POSTGRES_PASS=petclinic                             # PostgreSQL password
```

### AWS S3 Configuration

#### Method 1: Access Key/Secret Key
```bash
AWS_ACCESS_KEY_ID=your_access_key_here              # AWS Access Key ID
AWS_SECRET_KEY=your_secret_access_key_here          # AWS Secret Access Key
AWS_REGION=us-east-1                                # AWS Region (default: us-east-1)
AWS_S3_BUCKET=petclinic-vets                       # S3 Bucket name (default: petclinic-vets)
```

#### Method 2: AWS Profile
```bash
AWS_PROFILE=your-profile-name                       # AWS CLI profile name
AWS_REGION=us-east-1                                # AWS Region
AWS_S3_BUCKET=your-bucket-name                     # S3 Bucket name
```

#### Method 3: IRSA (IAM Roles for Service Accounts) - Kubernetes
```bash
AWS_REGION=us-east-1                                # AWS Region
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/name   # IAM Role ARN (auto-set by Kubernetes)
AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/...   # Token file path (auto-set by Kubernetes)
AWS_S3_BUCKET=your-bucket-name                     # S3 Bucket name
```

### Additional Vets Configuration

```bash
ADDITIONAL_VETS_ENABLED=true                        # Enable/disable additional vets from JSON (default: true)
PETCLINIC_ADDITIONAL_VETS_FILE=additional-vets.json # Path to additional vets JSON file (default: additional-vets.json)
```

**Supported file path formats:**
- Classpath resource: `additional-vets.json`
- Absolute path: `/path/to/additional-vets.json`
- Relative path: `./data/additional-vets.json`
- File URL: `file:/path/to/additional-vets.json`

### Export Configuration

```bash
PETCLINIC_EXPORT_DIRECTORY=/app/exports             # Directory for exported files (default: ./exports)
```

### Admin Authentication

```bash
PETCLINIC_ADMIN_USERNAME=admin                      # Admin username for S3/export operations (default: admin)
PETCLINIC_ADMIN_PASSWORD=admin123                   # Admin password for S3/export operations (default: admin123)
```

### JMeter Testing Configuration

```bash
PETCLINIC_HOST=localhost                            # Host for JMeter tests (default: localhost)
PETCLINIC_PORT=8080                                 # Port for JMeter tests (default: 8080)
CONTEXT_WEB=                                        # Web context path for JMeter tests (default: empty)
```

### Example Docker Configuration

```bash
# Complete environment configuration for Docker/Kubernetes
docker run -p 8080:8080 \
  -e AWS_REGION=us-east-1 \
  -e AWS_S3_BUCKET=my-petclinic-bucket \
  -e PETCLINIC_ADMIN_USERNAME=admin \
  -e PETCLINIC_ADMIN_PASSWORD=secure_password_here \
  -e PETCLINIC_EXPORT_DIRECTORY=/app/exports \
  -e ADDITIONAL_VETS_ENABLED=true \
  -e PETCLINIC_ADDITIONAL_VETS_FILE=/app/additional-vets.json \
  petclinic-backend
```

### Example Kubernetes ConfigMap/Deployment

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: petclinic-config
data:
  AWS_REGION: "us-east-1"
  AWS_S3_BUCKET: "my-petclinic-bucket"
  PETCLINIC_EXPORT_DIRECTORY: "/app/exports"
  ADDITIONAL_VETS_ENABLED: "true"
  PETCLINIC_ADDITIONAL_VETS_FILE: "/app/additional-vets.json"
---
apiVersion: v1
kind: Secret
metadata:
  name: petclinic-secrets
type: Opaque
stringData:
  PETCLINIC_ADMIN_USERNAME: "admin"
  PETCLINIC_ADMIN_PASSWORD: "secure_password_here"
```

## API Endpoints

### Owners API
- `GET /api/owners` - Get all owners (paginated)
- `GET /api/owners/{id}` - Get owner by ID
- `POST /api/owners` - Create new owner
- `PUT /api/owners/{id}` - Update owner
- `DELETE /api/owners/{id}` - Delete owner

### Veterinarians API
- `GET /api/vets` - Get all vets (paginated)
- `GET /api/vets/all` - Get all vets (simple list)

### S3 and Export API (Admin Auth Required)
- `GET /api/s3/files` - List S3 files
- `POST /api/s3/vets/upload` - Upload vets to S3
- `POST /api/s3/owners/upload` - Upload owners to S3  
- `POST /api/s3/vets/export` - Export vets (local and/or S3)
- `POST /api/s3/owners/export` - Export owners (local and/or S3)
- `GET /api/s3/files/local` - List local exported files
- `DELETE /api/s3/files/{filename}` - Delete S3 file
- `DELETE /api/s3/files/local/{filename}` - Delete local file

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+ (or use the included Maven wrapper)

### Running the Application

1. **Using Maven wrapper (recommended)**:
   ```bash
   ./mvnw spring-boot:run
   ```

2. **Using installed Maven**:
   ```bash
   mvn spring-boot:run
   ```

3. **Using Gradle wrapper**:
   ```bash
   ./gradlew bootRun
   ```

The API will be available at: `http://localhost:8080`

### Database Configuration

By default, the application uses H2 in-memory database. You can configure different databases by setting the appropriate profile:

- **H2 (default)**: No additional configuration needed
- **MySQL**: `./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql`
- **PostgreSQL**: `./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres`

### Testing the API

You can test the API endpoints using curl, Postman, or any HTTP client:

```bash
# Get all owners
curl http://localhost:8080/api/owners

# Get all vets
curl http://localhost:8080/api/vets/all

# Create a new owner
curl -X POST http://localhost:8080/api/owners \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Springfield",
    "telephone": "555-1234"
  }'

# List S3 files
curl http://localhost:8080/api/s3/files

# Upload vets data to S3 (requires admin auth)
curl -X POST "http://localhost:8080/api/s3/vets/upload?filename=export&source=merged" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="

# Export vets to local file
curl -X POST "http://localhost:8080/api/s3/vets/export?filename=export&source=merged&uploadToS3=false" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

### CORS Configuration

The API is configured to accept requests from any origin (`*`) for Kubernetes internal communication. This can be modified in the `CorsConfiguration` class.

### Development

- **Code formatting**: Run `./mvnw spring-javaformat:apply` to format code
- **Tests**: Run `./mvnw test`
- **Build**: Run `./mvnw clean package`

### Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t petclinic-backend .

# Run container with environment variables
docker run -p 8080:8080 \
  -e AWS_REGION=us-east-1 \
  -e AWS_S3_BUCKET=my-bucket \
  -e PETCLINIC_ADMIN_PASSWORD=secure_password \
  petclinic-backend
```

Or use docker-compose:

```bash
docker-compose up
``` 

### Additional Documentation

- **S3 Configuration**: See `S3_CONFIGURATION.md` for detailed AWS setup
- **Kubernetes Troubleshooting**: See `KUBERNETES_TROUBLESHOOTING.md` for deployment issues 
