# S3 Configuration Guide

## Overview

The PetClinic backend supports AWS S3 integration for uploading and managing veterinarian and owner data. This guide explains how to configure S3 properly.

## Configuration Options

The application supports three methods of AWS authentication:

### 1. Environment Variables (Recommended for Production)

Set the following environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_REGION=us-east-1
export AWS_S3_BUCKET=your-bucket-name
```

### 2. AWS Profile (Recommended for Development)

If you have AWS CLI configured with profiles:

```bash
export AWS_PROFILE=your-profile-name
export AWS_REGION=us-east-1
export AWS_S3_BUCKET=your-bucket-name
```

### 3. IAM Roles (For EC2/ECS Deployment)

When running on EC2 or ECS, the application can use IAM roles automatically. Just set:

```bash
export AWS_REGION=us-east-1
export AWS_S3_BUCKET=your-bucket-name
```

### 4. IRSA (IAM Roles for Service Accounts) - For Kubernetes

When running in Kubernetes with IRSA configured, the application will automatically use the service account's IAM role. The following environment variables are automatically set by Kubernetes:

```bash
AWS_REGION=us-east-1
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/your-service-account-role
AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token
AWS_S3_BUCKET=your-bucket-name
```

**Note**: The application now includes the AWS STS dependency required for IRSA authentication.

## Application Properties

You can also configure these in `application.properties`:

```properties
# AWS S3 Configuration
aws.accessKeyId=${AWS_ACCESS_KEY_ID:}
aws.secretKey=${AWS_SECRET_ACCESS_KEY:}
aws.profile=${AWS_PROFILE:}
aws.region=${AWS_REGION:us-east-1}
aws.s3.bucket=${AWS_S3_BUCKET:petclinic-vets}
```

## Required AWS Permissions

Your AWS user/role needs the following S3 permissions:

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

## Testing S3 Configuration

### 1. Check Backend Logs

When the application starts, you should see:

```
Successfully connected to AWS S3 bucket: your-bucket-name
```

If credentials are invalid, you'll see:

```
Error initializing AWS S3 client: [error message]
AWS credentials not configured. S3 operations are unavailable.
```

### 2. Test API Endpoints

```bash
# List S3 files
curl http://localhost:8080/api/s3/files

# Upload vets data (requires admin auth)
curl -X POST "http://localhost:8080/api/s3/vets/upload" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" \
  -d "filename=test-vets&source=merged"
```

## Troubleshooting

### Common Issues

1. **"AWS credentials not configured"**
   - Verify environment variables are set correctly
   - Check AWS profile configuration if using profiles
   - Ensure IAM role is attached if running on EC2/ECS

2. **"Access Denied" errors**
   - Verify S3 bucket permissions
   - Check if bucket exists and is in the correct region
   - Ensure your AWS user/role has the required permissions

3. **"Bucket does not exist"**
   - Create the S3 bucket in your AWS account
   - Verify the bucket name in configuration
   - Ensure the bucket is in the correct region

4. **IRSA-specific issues**
   - **"To use web identity tokens, the 'sts' service module must be on the class path"**
     - This is now fixed with the AWS STS dependency
   - **"Unable to load credentials from any of the providers in the chain"**
     - Verify the service account is annotated with the IAM role ARN
     - Check that the IAM role has the correct trust policy for the service account
     - Ensure the pod is using the correct service account
   - **Check IRSA environment variables**:
     ```bash
     kubectl exec -it <pod-name> -- env | grep AWS
     ```
     Should show: `AWS_ROLE_ARN`, `AWS_WEB_IDENTITY_TOKEN_FILE`, `AWS_REGION`

### Enable Debug Logging

Add to `application.properties`:

```properties
logging.level.org.springframework.samples.petclinic.vet.S3Service=DEBUG
logging.level.software.amazon.awssdk=DEBUG
```

## Quick Setup for Development

1. Install AWS CLI: `brew install awscli` (macOS) or equivalent
2. Configure AWS: `aws configure`
3. Create S3 bucket: `aws s3 mb s3://your-bucket-name`
4. Set environment variables:
   ```bash
   export AWS_PROFILE=default
   export AWS_S3_BUCKET=your-bucket-name
   ```
5. Restart the application

## IRSA Setup for Kubernetes

1. **Create IAM Role with S3 permissions**:
   ```bash
   aws iam create-role --role-name petclinic-s3-role --assume-role-policy-document '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/oidc.eks.REGION.amazonaws.com/id/OIDC-ID"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "oidc.eks.REGION.amazonaws.com/id/OIDC-ID:sub": "system:serviceaccount:NAMESPACE:SERVICE-ACCOUNT-NAME"
           }
         }
       }
     ]
   }'
   ```

2. **Attach S3 policy to the role**:
   ```bash
   aws iam attach-role-policy --role-name petclinic-s3-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
   ```

3. **Annotate service account**:
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: petclinic-service-account
     annotations:
       eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT-ID:role/petclinic-s3-role
   ```

4. **Update deployment to use service account**:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: petclinic-backend
   spec:
     template:
       spec:
         serviceAccountName: petclinic-service-account
         containers:
         - name: petclinic
           env:
           - name: AWS_REGION
             value: "us-east-1"
           - name: AWS_S3_BUCKET
             value: "your-bucket-name"
   ```

## Disabling S3 Features

If you don't want to use S3, the application will work without it. S3 operations will simply fail gracefully and return empty results or error messages. 
