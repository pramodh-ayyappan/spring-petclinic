# PetClinic - Separated Frontend & Backend

This project has been modernized with a separated architecture featuring:
- **Backend**: Spring Boot REST API (located in `petclinic-backend/`)
- **Frontend**: Next.js with Neobrutalism UI styling (located in `petclinic-frontend/`)

## Architecture Overview

```
┌─────────────────────┐    HTTP/REST API    ┌─────────────────────┐
│                     │ ←─────────────────→ │                     │
│   Next.js Frontend  │                     │  Spring Boot API    │
│   (Port 3000)       │                     │   (Port 8080)       │
│                     │                     │                     │
│ - Neobrutalism UI   │                     │ - REST Controllers  │
│ - React Components  │                     │ - JPA Entities      │
│ - Axios API calls   │                     │ - H2/MySQL/Postgres │
│                     │                     │                     │
└─────────────────────┘                     └─────────────────────┘
```

## Backend Changes

### New API Structure
- **DTOs**: Clean data transfer objects in `src/main/java/.../api/dto/`
- **REST Controllers**: API endpoints in `src/main/java/.../api/controller/`
- **Mappers**: Entity-to-DTO conversion in `src/main/java/.../api/mapper/`
- **CORS Configuration**: Allows frontend communication

### API Endpoints

#### Owners API (`/api/owners`)
- `GET /api/owners` - Get paginated owners list
- `GET /api/owners/{id}` - Get owner by ID
- `POST /api/owners` - Create new owner
- `PUT /api/owners/{id}` - Update owner
- `DELETE /api/owners/{id}` - Delete owner

#### Vets API (`/api/vets`)
- `GET /api/vets` - Get paginated vets list
- `GET /api/vets/all` - Get all vets (simple list)

### Removed Dependencies
- Thymeleaf (server-side templating)
- Webjars (Bootstrap, Font Awesome)

## Frontend Features

### Technology Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Neobrutalism UI** components inspired by [neobrutalism.dev](https://www.neobrutalism.dev/)

### Design System
- **Bold borders** (3px, 4px)
- **Drop shadows** with offset
- **Bright colors** (orange, blue, purple, green, yellow)
- **Strong typography** with Inter font
- **Interactive elements** with hover effects and transforms

### Pages
- **Home** (`/`) - Welcome page with feature overview
- **Owners** (`/owners`) - Pet owners management with search and pagination
- **Vets** (`/vets`) - Veterinarians directory with specialties

### Components
- **Neobrutalism Button** - Multiple variants (default, destructive, success, etc.)
- **Neobrutalism Card** - Content containers with bold styling
- **Neobrutalism Input** - Form inputs with distinctive borders
- **Header Navigation** - Responsive navigation bar

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd petclinic-backend
   ```
2. Start the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Backend will run on `http://localhost:8080`
4. API endpoints available at `http://localhost:8080/api/`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd petclinic-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Frontend will run on `http://localhost:3000`

### Database Configuration
The backend supports multiple databases:
- **H2** (default, in-memory)
- **MySQL** - Use profile `spring.profiles.active=mysql`
- **PostgreSQL** - Use profile `spring.profiles.active=postgres`

## API Testing
You can test the API endpoints using:
- Browser: Visit `http://localhost:8080/api/owners`
- Postman/Insomnia: Import the API endpoints
- cURL: Example commands in the API documentation

## Development Workflow
1. **Backend**: Make changes to Spring Boot code, API will hot-reload
2. **Frontend**: Make changes to React components, frontend will hot-reload
3. **CORS**: Already configured to allow localhost:3000 → localhost:8080

## Key Features

### Neobrutalism Design Elements
- **Bold, thick borders** on all interactive elements
- **High contrast colors** for accessibility
- **Playful rotations** and hover effects
- **Chunky shadows** for depth
- **Strong typography** for readability

### Modern UX Patterns
- **Responsive design** for mobile and desktop
- **Loading states** for API calls
- **Error handling** with user-friendly messages
- **Pagination** for large datasets
- **Search functionality** for owners

### Performance Optimizations
- **TypeScript** for compile-time error checking
- **Next.js optimizations** (automatic code splitting, image optimization)
- **Efficient API calls** with proper error handling
- **Component reusability** with consistent design system

## Future Enhancements
- Pet management pages
- Visit scheduling system
- User authentication
- Real-time notifications
- Mobile app with React Native
- Advanced search and filtering
- Dashboard with analytics

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend is running and CORS is configured
2. **API connection failed**: Check if Spring Boot is running on port 8080
3. **Frontend build errors**: Ensure all dependencies are installed

### Backend Issues
- Check application logs for Spring Boot errors
- Verify database connection (H2 console at `/h2-console`)
- Ensure proper Java version (17+)

### Frontend Issues
- Check browser console for JavaScript errors
- Verify API endpoints are responding
- Ensure Node.js version compatibility

## Contributing
1. Fork the repository
2. Create feature branches for backend and frontend changes
3. Test both applications together
4. Submit pull requests with clear descriptions

---

This separated architecture provides better scalability, maintainability, and allows for independent deployment of frontend and backend components. 
