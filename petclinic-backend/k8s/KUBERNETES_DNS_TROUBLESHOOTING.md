# Kubernetes DNS and Service Communication Troubleshooting

## The Problem

Your application works when port-forwarded locally (`localhost`) but fails when deployed in Kubernetes because:

1. **CORS Configuration**: Backend was configured to only allow `localhost` origins
2. **Service Discovery**: Frontend needs to use Kubernetes internal DNS names, not `localhost`
3. **Network Communication**: Services communicate internally using cluster DNS

## Fixed Issues

### ✅ **1. CORS Configuration Updated**

**Before (❌ Wrong):**
```java
@CrossOrigin(origins = "http://localhost:3000")
```

**After (✅ Correct):**
```java
@CrossOrigin(originPatterns = "*") // Allow requests from any origin for Kubernetes
```

### ✅ **2. Updated All Controllers**

Fixed CORS in:
- `CorsConfiguration.java` - Global CORS configuration
- `S3ApiController.java` - S3 and export endpoints
- `VetApiController.java` - Veterinarian endpoints  
- `OwnerApiController.java` - Owner endpoints

## Kubernetes Service Communication

### How Services Communicate in Kubernetes

When both frontend and backend are deployed in the same Kubernetes cluster:

1. **Frontend Environment Variable:**
   ```bash
   NEXT_PUBLIC_API_URL=http://petclinic-be-service:8080
   ```

2. **Internal DNS Resolution:**
   - `petclinic-be-service` resolves to the backend service IP
   - No external load balancer needed for internal communication
   - Much faster than external routing

3. **Service Discovery:**
   ```bash
   # Full DNS name format:
   <service-name>.<namespace>.svc.cluster.local
   
   # Short form (same namespace):
   <service-name>
   
   # Examples:
   petclinic-be-service.default.svc.cluster.local
   petclinic-be-service  # Short form
   ```

## Verification Commands

### 1. Check Service Discovery

```bash
# List services
kubectl get svc

# Check service endpoints
kubectl get endpoints

# Verify service exists
kubectl describe svc petclinic-be-service
kubectl describe svc petclinic-fe-service
```

### 2. Test DNS Resolution from Frontend Pod

```bash
# Get frontend pod name
kubectl get pods -l app=petclinic-fe

# Test DNS resolution
kubectl exec -it <frontend-pod-name> -- nslookup petclinic-be-service
kubectl exec -it <frontend-pod-name> -- nslookup petclinic-be-service.default.svc.cluster.local

# Test connectivity
kubectl exec -it <frontend-pod-name> -- zcurl -v http://petclinic-be-service:8080/actuator/health
```

### 3. Test Backend from Frontend Pod

```bash
# Test API endpoints
kubectl exec -it <frontend-pod-name> -- curl -s http://petclinic-be-service:8080/api/vets/all
kubectl exec -it <frontend-pod-name> -- curl -s http://petclinic-be-service:8080/api/owners
kubectl exec -it <frontend-pod-name> -- curl -s http://petclinic-be-service:8080/api/s3/files
```

### 4. Check Environment Variables

```bash
# Frontend environment variables
kubectl exec -it <frontend-pod-name> -- env | grep -E "(API_URL|NEXT_PUBLIC)"

# Backend environment variables  
kubectl exec -it <backend-pod-name> -- env | grep -E "(PETCLINIC|AWS)"
```

## Common Issues and Solutions

### Issue 1: "Connection Refused"

**Symptoms:**
- Frontend cannot reach backend
- `curl: (7) Failed to connect to petclinic-be-service port 8080: Connection refused`

**Solutions:**
```bash
# Check if backend pod is running
kubectl get pods -l app=petclinic-be

# Check backend logs
kubectl logs -f deployment/petclinic-be

# Verify backend is listening on port 8080
kubectl exec -it <backend-pod-name> -- netstat -tulpn | grep 8080
```

### Issue 2: "Name Resolution Failed"

**Symptoms:**
- `nslookup: can't resolve 'petclinic-be-service'`
- DNS resolution fails

**Solutions:**
```bash
# Check if service exists
kubectl get svc petclinic-be-service

# Check service has endpoints
kubectl get endpoints petclinic-be-service

# Verify service selector matches pod labels
kubectl describe svc petclinic-be-service
kubectl get pods --show-labels
```

### Issue 3: "CORS Errors"

**Symptoms:**
- Browser console shows CORS errors
- `Access to fetch at 'http://...' has been blocked by CORS policy`

**Solutions:**
- ✅ **Fixed**: Updated all controllers to use `@CrossOrigin(originPatterns = "*")`
- ✅ **Fixed**: Updated global CORS configuration

### Issue 4: "Service Not Found"

**Symptoms:**
- `service "petclinic-be-service" not found`

**Solutions:**
```bash
# Check service name in your deployment
kubectl get svc

# Verify the service name matches your configuration
# It might be named differently like:
# - petclinic-be
# - petclinic-backend
# - petclinic-backend-service

# Update frontend environment variable to match actual service name
```

## Testing End-to-End Connectivity

### 1. Port Forward for Initial Testing
```bash
# Port forward backend (for testing)
kubectl port-forward svc/petclinic-be-service 8080:8080

# Port forward frontend (for testing)
kubectl port-forward svc/petclinic-fe-service 3000:3000
```

### 2. Test Internal Communication
```bash
# Create a test pod for debugging
kubectl run debug --image=curlimages/curl --rm -it --restart=Never -- sh

# Inside the debug pod:
curl -v http://petclinic-be-service:8080/actuator/health
curl -v http://petclinic-be-service:8080/api/vets/all
curl -v http://petclinic-fe-service:3000/api/health
```

### 3. Verify Application Flow
```bash
# Test full application flow
kubectl exec -it <frontend-pod-name> -- curl -s "http://petclinic-be-service:8080/api/owners?page=0&size=5"
kubectl exec -it <frontend-pod-name> -- curl -s "http://petclinic-be-service:8080/api/vets/all"
kubectl exec -it <frontend-pod-name> -- curl -s "http://petclinic-be-service:8080/api/s3/admin/info"
```

## Expected Results

### ✅ **Successful DNS Resolution:**
```bash
$ kubectl exec -it frontend-pod -- nslookup petclinic-be-service
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      petclinic-be-service
Address 1: 10.100.200.150 petclinic-be-service.default.svc.cluster.local
```

### ✅ **Successful Health Check:**
```bash
$ kubectl exec -it frontend-pod -- curl -s http://petclinic-be-service:8080/actuator/health
{"status":"UP"}
```

### ✅ **Successful API Call:**
```bash
$ kubectl exec -it frontend-pod -- curl -s http://petclinic-be-service:8080/api/vets/all
{"vetList":[{"id":1,"firstName":"James","lastName":"Carter",...}]}
```

## Next Steps

1. **Redeploy with Updated Code**: Ensure the CORS fixes are deployed
2. **Verify Service Names**: Make sure your frontend uses the correct backend service name
3. **Test Incrementally**: Use the verification commands above
4. **Monitor Logs**: Watch both frontend and backend logs during testing

The key insight is that Kubernetes internal communication doesn't use `localhost` - it uses service names that resolve via the cluster's internal DNS system. 
