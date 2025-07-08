# Dynamic API Configuration

This frontend now supports dynamic API server configuration that can be changed at runtime without rebuilding the Docker image.

## How It Works

The frontend uses a multi-layered approach to determine the API server URL:

1. **Runtime Environment Variable** (`API_URL`) - Highest priority
2. **Build-time Environment Variable** (`NEXT_PUBLIC_API_URL`) - Medium priority  
3. **Auto-detection** - Fallback based on environment

## Microservice Architecture Best Practices

### ✅ Recommended: Ingress/Reverse Proxy Pattern

For production Kubernetes deployments, use **relative paths** (empty string) with an ingress controller:

```yaml
# Kubernetes Deployment
env:
  - name: API_URL
    value: ""  # Empty string for relative paths
```

This follows microservice best practices where:
- Both frontend and backend are behind the same ingress
- Ingress routes `/api/*` to backend service
- Ingress routes `/*` to frontend service
- No CORS issues since everything appears to come from the same domain

### ❌ Avoid: Kubernetes Internal DNS in Browsers

**Don't use internal service DNS for browser requests:**
```yaml
# This WON'T work in browsers!
env:
  - name: API_URL
    value: "http://petclinic-be.default.svc.cluster.local:8080"
```

**Why it fails:**
- Browsers cannot resolve `.svc.cluster.local` DNS names
- These are only for pod-to-pod communication
- Will result in DNS resolution errors in the browser

## Environment Variables

### Runtime Configuration (Recommended)

Set the `API_URL` environment variable in your deployment:

```bash
# For Docker
docker run -e API_URL="" your-frontend-image

# For Kubernetes with ingress (recommended)
env:
  - name: API_URL
    value: ""  # Use relative paths via ingress

# For direct service access (development only)
env:
  - name: API_URL
    value: "http://localhost:8080"
```

### Build-time Configuration (Legacy)

Set `NEXT_PUBLIC_API_URL` during build (still supported for backward compatibility):

```bash
# During build
docker build --build-arg NEXT_PUBLIC_API_URL="" .
```

## Deployment Examples

### 1. Local Development
```bash
# Option 1: Runtime env var
export API_URL=http://localhost:8080
npm run dev

# Option 2: Build-time env var
export NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

### 2. Kubernetes with Ingress (Recommended)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: petclinic-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: petclinic-frontend:latest
        env:
        - name: API_URL
          value: ""  # Use relative paths
        - name: NODE_ENV
          value: "production"
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: petclinic-ingress
spec:
  rules:
  - host: petclinic.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: petclinic-backend
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: petclinic-frontend
            port:
              number: 3000
```

### 3. Docker Compose with Nginx

```yaml
version: '3.8'
services:
  frontend:
    image: petclinic-frontend:latest
    environment:
      - API_URL=""  # Use nginx proxy
    
  backend:
    image: petclinic-backend:latest
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### 4. Direct Backend Access (Development)

```yaml
version: '3.8'
services:
  frontend:
    image: petclinic-frontend:latest
    environment:
      - API_URL=http://backend:8080
    ports:
      - "3000:3000"
  
  backend:
    image: petclinic-backend:latest
    ports:
      - "8080:8080"
```

## Auto-Detection Logic

If no environment variables are set, the frontend automatically detects:

- **Kubernetes Environment**: Uses relative path (`""`) if `KUBERNETES_SERVICE_HOST` is present
- **Local/Other Environment**: Falls back to `http://localhost:8080`

**Special handling for Kubernetes internal DNS:**
- If `API_URL` contains `.svc.cluster.local`, it's automatically converted to relative path (`""`)
- This prevents browser DNS resolution errors

## UI Configuration

Users can also change the API URL through the web interface:

1. Go to the homepage
2. Click "Configure" in the API Configuration section
3. Use preset options or enter a custom URL
4. Click "Update API URL"

### Preset Options Available:
- **Relative Path (Recommended)**: `""` - Uses ingress/reverse proxy
- **Localhost**: `http://localhost:8080` - For local development
- **Kubernetes Internal (NOT for browsers)**: Shows warning about browser compatibility
- **Custom**: Any URL you specify

## API Endpoint

The configuration is exposed via the `/api/config` endpoint:

```bash
# Get current config
curl http://localhost:3000/api/config

# Response for ingress setup
{
  "apiUrl": "",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "source": "runtime_env",
  "note": "Using relative paths via ingress/proxy"
}
```

## Migration from Static Configuration

If you're currently using a static `NEXT_PUBLIC_API_URL`, you can migrate by:

1. Setting `API_URL=""` environment variable for ingress setups
2. Removing `NEXT_PUBLIC_API_URL` (optional, will be used as fallback)
3. No code changes required - it's backward compatible

## Troubleshooting

### Check Current Configuration
Visit the homepage and look at the "API Configuration" section to see:
- Current API URL being used
- Configuration status with warnings/errors
- Source of the configuration (runtime_env, build_env, auto_detected, fallback)

### Common Issues

1. **API calls to wrong URL**: Check the API Configuration section on the homepage
2. **CORS errors**: Use relative paths with ingress instead of direct service calls
3. **Kubernetes DNS not working**: This is expected for browsers - use ingress configuration
4. **Environment variable not taking effect**: Restart the container after setting `API_URL`

### Debug Mode

You can check the configuration by making a request to `/api/config`:

```javascript
// In browser console
fetch('/api/config').then(r => r.json()).then(console.log)
```

This will show you exactly what URL is being used and why.

## Architecture Diagrams

### ✅ Recommended: Ingress Pattern
```
Browser → Ingress → Frontend Service (for /)
         └─────→ Backend Service (for /api/*)
```

### ❌ Not Recommended: Direct Internal DNS
```
Browser → ❌ petclinic-be.default.svc.cluster.local (DNS failure)
```

### ✅ Alternative: Load Balancer
```
Browser → Load Balancer → Frontend Service
         └─────────────→ Backend Service
```
