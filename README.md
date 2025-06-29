# Spring PetClinic - Separated Architecture

This is a modernized version of the Spring PetClinic application with completely separated frontend and backend architectures.

## Project Structure

```
spring-petclinic/
├── petclinic-backend/          # Spring Boot REST API
│   ├── src/                    # Java source code
│   ├── pom.xml                 # Maven configuration
│   ├── mvnw                    # Maven wrapper
│   └── README.md               # Backend documentation
├── petclinic-frontend/         # Next.js Frontend
│   ├── src/                    # React/TypeScript source
│   ├── package.json            # npm configuration
│   └── README.md               # Frontend documentation
└── README-SEPARATED.md         # Detailed architecture guide
```

## Quick Start

### Prerequisites
- **Java 17+** for backend
- **Node.js 18+** for frontend

### Running the Application

1. **Start the Backend** (Terminal 1):
   ```bash
   cd petclinic-backend
   ./mvnw spring-boot:run
   ```
   Backend runs on: `http://localhost:8080`

2. **Start the Frontend** (Terminal 2):
   ```bash
   cd petclinic-frontend
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

## Architecture Overview

- **Backend**: Spring Boot 3.4.2 REST API with JPA entities and H2/MySQL/PostgreSQL support
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Neobrutalism UI design
- **Communication**: REST API calls from frontend to backend with CORS enabled

## Key Features

### Backend API
- RESTful endpoints for owners, pets, vets, and visits
- Paginated responses for large datasets
- DTO pattern for clean API contracts
- CORS configuration for frontend integration

### Frontend UI
- Modern Neobrutalism design system
- Responsive React components
- TypeScript for type safety
- Real-time API integration

## Documentation

- **[README-SEPARATED.md](./README-SEPARATED.md)** - Complete architecture and setup guide
- **[Backend README](./petclinic-backend/README.md)** - Backend-specific documentation
- **[Frontend README](./petclinic-frontend/README.md)** - Frontend-specific documentation

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.4.2
- Spring Data JPA
- H2/MySQL/PostgreSQL
- Maven

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- Axios for API calls
- Neobrutalism UI components

## Development

Each component can be developed independently:

- Backend changes are automatically reloaded by Spring Boot DevTools
- Frontend changes are hot-reloaded by Next.js development server
- API testing can be done independently using tools like Postman or curl

## Deployment

Both applications can be deployed separately:

- **Backend**: Build JAR with `./mvnw clean package` and deploy to any Java hosting
- **Frontend**: Build with `npm run build` and deploy to Vercel, Netlify, or any static hosting

---

For detailed setup instructions, API documentation, and troubleshooting, see [README-SEPARATED.md](./README-SEPARATED.md).
