# Spring PetClinic Backend API

This is the backend API for the Spring PetClinic application, providing REST endpoints for managing owners, pets, veterinarians, and visits.

## Technology Stack

- **Java 17**
- **Spring Boot 3.4.2**
- **Spring Data JPA**
- **H2 Database** (default, with MySQL/PostgreSQL support)
- **Maven** for dependency management

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
```

### CORS Configuration

The API is configured to accept requests from `http://localhost:3000` (frontend development server). This can be modified in the `CorsConfiguration` class.

### S3 Configuration (Optional)

The application supports AWS S3 integration for uploading veterinarian and owner data. To enable S3 features:

1. **Set AWS credentials** (choose one method):
   ```bash
   # Option 1: Environment variables
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   export AWS_S3_BUCKET=your-bucket-name
   
   # Option 2: AWS Profile
   export AWS_PROFILE=your-profile-name
   export AWS_S3_BUCKET=your-bucket-name
   ```

2. **Test S3 endpoints**:
   ```bash
   # List S3 files
   curl http://localhost:8080/api/s3/files
   
   # Upload data (requires admin auth: admin/admin123)
   curl -X POST "http://localhost:8080/api/s3/vets/upload" \
     -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
   ```

For detailed S3 configuration, see `S3_CONFIGURATION.md`.

### Development

- **Code formatting**: Run `./mvnw spring-javaformat:apply` to format code
- **Tests**: Run `./mvnw test`
- **Build**: Run `./mvnw clean package`

### Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t petclinic-backend .

# Run container
docker run -p 8080:8080 petclinic-backend
```

Or use docker-compose:

```bash
docker-compose up
``` 
