# Corrected Kubernetes Configuration

## Issues Fixed

1. **Environment Variable Names**: Updated to match application.properties
2. **Volume Mounts**: Proper persistent volume configuration for exports
3. **CORS Configuration**: Updated to allow K8s frontend access
4. **Admin Authentication**: Proper secret reference

## Backend Service Configuration

```json
{
  "flavor": "k8s_demo",
  "metadata": {
    "labels": {
      "deliveryType": "MANUAL"
    },
    "namespace": "default"
  },
  "kind": "service",
  "disabled": false,
  "version": "0.2-local-pramodhayyappan",
  "spec": {
    "type": "statefulset",
    "enable_host_anti_affinity": false,
    "restart_policy": "Always",
    "pod_distribution_enabled": false,
    "cloud_permissions": {
      "aws": {
        "enable_irsa": true,
        "iam_policies": {
          "iam-policies1": {
            "arn": "${s3.petclinic-exports.out.attributes.read_write_iam_policy_arn}"
          }
        }
      }
    },
    "runtime": {
      "args": [],
      "command": [],
      "autoscaling": {
        "scaling_on": "CPU",
        "min": 1,
        "max": 1,
        "cpu_threshold": "50"
      },
      "ports": {
        "ports1": {
          "port": "8080",
          "service_port": "8080",
          "protocol": "tcp"
        }
      },
      "size": {
        "cpu": "300m",
        "memory": "1Gi",
        "cpu_limit": "1000m",
        "memory_limit": "5Gi"
      },
      "health_checks": {
        "readiness_check": {
          "check_type": "http",
          "http_check": {
            "path": "/actuator/health",
            "port": 8080,
            "initial_delay_seconds": 30,
            "period_seconds": 10
          }
        },
        "liveness_check": {
          "check_type": "http",
          "http_check": {
            "path": "/actuator/health",
            "port": 8080,
            "initial_delay_seconds": 60,
            "period_seconds": 30
          }
        }
      },
      "volumes": {
        "config_maps": {
          "config-maps1": {
            "name": "${config_map.additional-vets.out.attributes.name}",
            "mount_path": "/app/additional-vets.json",
            "sub_path": "additional-vets.json"
          }
        }
      }
    },
    "env": {
      "LOG_LEVEL": "INFO",
      "SPRING_PROFILES_ACTIVE": "production",
      "PETCLINIC_ADDITIONAL_VETS_FILE": "/app/additional-vets.json",
      "PETCLINIC_EXPORT_DIRECTORY": "/app/exports",
      "PETCLINIC_ADMIN_USERNAME": "admin",
      "PETCLINIC_ADMIN_PASSWORD": "${blueprint.self.secrets.PETCLINIC_ADMIN_PASSWORD}",
      "AWS_S3_BUCKET": "${s3.petclinic-exports.out.attributes.bucket_name}",
      "AWS_REGION": "${s3.petclinic-exports.out.attributes.region}",
      "JAVA_OPTS": "-Xmx768m -Xms512m"
    },
    "release": {
      "image": "${blueprint.self.artifacts.k8sdemoproject-petclinic-be}"
    },
    "persistent_volume_claims": {
      "persistent-volume-claim1": {
        "access_mode": "ReadWriteOnce",
        "storage_size": "5Gi",
        "path": "/app/exports"
      }
    }
  },
  "inputs": {
    "kubernetes_details": {
      "resource_name": "demo-eks",
      "resource_type": "kubernetes_cluster"
    },
    "artifactories": {
      "resource_name": "demo-artifactory",
      "resource_type": "artifactories"
    },
    "vpa_details": {
      "resource_name": "demo-vpa",
      "resource_type": "vpa"
    },
    "kubernetes_node_pool_details": {
      "resource_name": "default",
      "resource_type": "kubernetes_node_pool"
    },
    "cloud_account": {
      "resource_name": "demo-cloud-acc",
      "resource_type": "cloud_account"
    }
  }
}
```

## Frontend Service Configuration

```json
{
  "flavor": "k8s_demo",
  "metadata": {
    "labels": {
      "deliveryType": "MANUAL"
    },
    "namespace": "default"
  },
  "kind": "service",
  "disabled": false,
  "version": "0.2-local-pramodhayyappan",
  "spec": {
    "type": "application",
    "enable_host_anti_affinity": false,
    "restart_policy": "Always",
    "pod_distribution_enabled": false,
    "cloud_permissions": {
      "aws": {
        "enable_irsa": false
      }
    },
    "runtime": {
      "args": [],
      "command": [],
      "autoscaling": {
        "scaling_on": "CPU",
        "min": 1,
        "max": 1,
        "cpu_threshold": "50"
      },
      "size": {
        "cpu": "300m",
        "memory": "1Gi",
        "cpu_limit": "1000m",
        "memory_limit": "5Gi"
      },
      "health_checks": {
        "readiness_check": {
          "check_type": "http",
          "http_check": {
            "path": "/api/health",
            "port": 3000,
            "initial_delay_seconds": 30,
            "period_seconds": 10
          }
        },
        "liveness_check": {
          "check_type": "http",
          "http_check": {
            "path": "/api/health",
            "port": 3000,
            "initial_delay_seconds": 60,
            "period_seconds": 30
          }
        }
      },
      "ports": {
        "ports1": {
          "port": "3000",
          "service_port": "3000",
          "protocol": "tcp"
        }
      }
    },
    "env": {
      "LOG_LEVEL": "INFO",
      "NEXT_PUBLIC_API_URL": "http://${service.petclinic-be.out.interfaces.ports1.host}:${service.petclinic-be.out.interfaces.ports1.port}",
      "NODE_ENV": "production",
      "PORT": "3000",
      "HOSTNAME": "0.0.0.0",
      "NEXT_PUBLIC_USE_MOCK_API": "false"
    },
    "release": {
      "image": "${blueprint.self.artifacts.k8sdemoproject-petclinic-fe}"
    }
  },
  "inputs": {
    "kubernetes_details": {
      "resource_name": "demo-eks",
      "resource_type": "kubernetes_cluster"
    },
    "artifactories": {
      "resource_name": "demo-artifactory",
      "resource_type": "artifactories"
    },
    "vpa_details": {
      "resource_name": "demo-vpa",
      "resource_type": "vpa"
    },
    "kubernetes_node_pool_details": {
      "resource_name": "demo-nodeppol",
      "resource_type": "kubernetes_node_pool"
    }
  }
}
```

## Key Changes Made

### Backend Changes:
1. **Environment Variables**: 
   - `PETCLINIC_ADDITIONAL_VETS_FILE` → matches application.properties
   - `PETCLINIC_EXPORT_DIRECTORY` → matches application.properties  
   - `PETCLINIC_ADMIN_USERNAME/PASSWORD` → matches application.properties
   - Added `AWS_REGION` from S3 resource
   - Added `JAVA_OPTS` for proper memory management

2. **Health Checks**: 
   - Added proper readiness and liveness checks
   - Uses Spring Boot Actuator endpoints

3. **Persistent Volume**: 
   - Correctly mounted at `/app/exports`
   - Matches `PETCLINIC_EXPORT_DIRECTORY`

### Frontend Changes:
1. **Environment Variables**:
   - Added `NEXT_PUBLIC_USE_MOCK_API=false` to ensure real API usage
   - Proper backend URL reference

2. **Health Checks**:
   - Added health check endpoints

## Troubleshooting Commands

### Check Backend Logs:
```bash
kubectl logs -f deployment/petclinic-be
```

### Check Environment Variables:
```bash
kubectl exec -it deployment/petclinic-be -- env | grep -E "(PETCLINIC|AWS)"
```

### Check Volume Mounts:
```bash
kubectl exec -it deployment/petclinic-be -- ls -la /app/
kubectl exec -it deployment/petclinic-be -- ls -la /app/exports/
```

### Test Export Directory Permissions:
```bash
kubectl exec -it deployment/petclinic-be -- touch /app/exports/test.txt
kubectl exec -it deployment/petclinic-be -- ls -la /app/exports/
```

### Test S3 Configuration:
```bash
kubectl exec -it deployment/petclinic-be -- curl -s http://localhost:8080/api/s3/files
```

### Test Admin Authentication:
```bash
kubectl exec -it deployment/petclinic-be -- curl -s -u admin:your-password http://localhost:8080/api/s3/admin/info
``` 
