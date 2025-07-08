# Kubernetes Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Admin Page Returns Internal Server Error

**Symptoms:**
- Admin authentication endpoints return 500 errors
- Export functionality fails
- Local file operations fail

**Root Causes:**
1. **Environment Variable Mismatch**: Your original config used `ADMIN_USERNAME` but application expects `PETCLINIC_ADMIN_USERNAME`
2. **Export Directory Permissions**: `/app/exports` directory not writable
3. **Missing Persistent Volume**: Export directory not properly mounted

**Solutions:**

#### A. Update Environment Variables (Use corrected config)
```bash
# Original (WRONG):
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EXPORT_DIRECTORY=/app/exports

# Corrected (RIGHT):
PETCLINIC_ADMIN_USERNAME=admin
PETCLINIC_ADMIN_PASSWORD=admin123
PETCLINIC_EXPORT_DIRECTORY=/app/exports
```

#### B. Verify Persistent Volume Mount
```bash
# Check if exports directory exists and is writable
kubectl exec -it deployment/petclinic-be -- ls -la /app/
kubectl exec -it deployment/petclinic-be -- ls -la /app/exports/
kubectl exec -it deployment/petclinic-be -- touch /app/exports/test.txt
```

#### C. Check Pod Logs for Specific Errors
```bash
kubectl logs -f deployment/petclinic-be | grep -E "(Error|Exception|admin|export)"
```

### 2. S3 Operations Fail

**Symptoms:**
- S3 upload returns false
- S3 file listing is empty
- "AWS credentials not configured" in logs

**Root Causes:**
1. **IRSA Not Properly Configured**: Service account missing IAM role annotation
2. **Missing STS Dependency**: Fixed in latest code
3. **Incorrect S3 Bucket Environment Variable**

**Solutions:**

#### A. Verify IRSA Configuration
```bash
# Check service account annotation
kubectl describe serviceaccount petclinic-service-account

# Should show:
# Annotations: eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/petclinic-s3-role

# Check pod environment variables
kubectl exec -it deployment/petclinic-be -- env | grep AWS
# Should show:
# AWS_ROLE_ARN=arn:aws:iam::ACCOUNT:role/petclinic-s3-role
# AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket-name
```

#### B. Test S3 Access Manually
```bash
# Test S3 credentials inside pod
kubectl exec -it deployment/petclinic-be -- bash
# Inside pod:
curl -s http://localhost:8080/api/s3/files
curl -s http://localhost:8080/api/s3/admin/info
```

#### C. Check IAM Role Permissions
Ensure your IAM role has these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

### 3. Frontend Cannot Connect to Backend

**Symptoms:**
- Frontend shows network errors
- API calls timeout or fail
- CORS errors in browser console

**Root Causes:**
1. **Incorrect Backend URL**: Service discovery not working
2. **CORS Configuration**: Backend not allowing frontend origin
3. **Network Policies**: K8s network policies blocking traffic

**Solutions:**

#### A. Verify Backend URL Resolution
```bash
# Check frontend environment variables
kubectl exec -it deployment/petclinic-fe -- env | grep API
# Should show: NEXT_PUBLIC_API_URL=http://petclinic-be-service:8080

# Test connectivity from frontend pod
kubectl exec -it deployment/petclinic-fe -- curl -s http://petclinic-be-service:8080/actuator/health
```

#### B. Check Service Discovery
```bash
# Verify backend service exists
kubectl get svc petclinic-be-service

# Check endpoints
kubectl get endpoints petclinic-be-service

# Test DNS resolution
kubectl exec -it deployment/petclinic-fe -- nslookup petclinic-be-service
```

#### C. Update CORS Configuration
Backend now allows all origins with `@CrossOrigin(origins = {"http://localhost:3000", "*"})`.

### 4. ConfigMap Mount Issues

**Symptoms:**
- Additional vets not loading
- "Cannot deserialize value" errors
- File not found errors for additional-vets.json

**Solutions:**

#### A. Verify ConfigMap Exists
```bash
kubectl get configmap additional-vets
kubectl describe configmap additional-vets
```

#### B. Check File Mount
```bash
kubectl exec -it deployment/petclinic-be -- ls -la /app/additional-vets.json
kubectl exec -it deployment/petclinic-be -- cat /app/additional-vets.json
```

#### C. Verify JSON Format
The file should have this structure:
```json
{
  "additionalVets": [
    {
      "id": 1001,
      "firstName": "Emma",
      "lastName": "Rodriguez",
      "specialties": [
        {
          "id": 101,
          "name": "Emergency Medicine"
        }
      ]
    }
  ]
}
```

## Quick Diagnostic Commands

### Backend Health Check
```bash
kubectl exec -it deployment/petclinic-be -- curl -s http://localhost:8080/actuator/health | jq
```

### Test Admin Authentication
```bash
kubectl exec -it deployment/petclinic-be -- curl -s -u admin:your-password http://localhost:8080/api/s3/admin/info | jq
```

### Test Export Functionality
```bash
kubectl exec -it deployment/petclinic-be -- curl -s -X POST -u admin:your-password "http://localhost:8080/api/s3/vets/export?filename=test&uploadToS3=false" | jq
```

### Test S3 Integration
```bash
kubectl exec -it deployment/petclinic-be -- curl -s http://localhost:8080/api/s3/files | jq
```

### Check All Environment Variables
```bash
kubectl exec -it deployment/petclinic-be -- env | sort
```

## Expected Log Messages

### Successful Startup
```
Successfully connected to AWS S3 bucket: your-bucket-name using region: us-east-1
```

### Successful Export
```
Vets data exported to /app/exports/vets_merged_20250106_120000.json
```

### Successful S3 Upload
```
Successfully uploaded to S3: vets_merged_20250106_120000.json
```

## Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| `AWS credentials not configured` | Fix IRSA configuration or add AWS environment variables |
| `Error exporting vets data: Permission denied` | Check persistent volume mount and permissions |
| `Admin authentication required` | Update environment variables to use `PETCLINIC_ADMIN_*` prefix |
| `Cannot deserialize value` | Fix additional-vets.json format |
| `Connection refused` | Check service discovery and network connectivity |
| `CORS error` | Update CORS configuration in backend |

## Recovery Steps

1. **Update Kubernetes Configuration**: Use the corrected config from `CORRECTED_K8S_CONFIG.md`
2. **Rebuild and Redeploy**: Ensure latest code with fixes is deployed
3. **Verify Environment Variables**: Check all `PETCLINIC_*` and `AWS_*` variables
4. **Test Incrementally**: Test each component (health, admin, export, S3) separately
5. **Check Logs**: Monitor logs during testing to identify specific issues 
