#!/bin/bash

# Multi-Platform Docker Build Script for Spring PetClinic
# This script builds both backend and frontend images for multiple platforms

set -e

echo "🚀 Starting multi-platform Docker build process..."

# Enable BuildKit for better performance
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Define target platforms
PLATFORMS="linux/amd64,linux/arm64"

# Setup buildx builder if it doesn't exist
setup_buildx() {
    echo "🔧 Setting up Docker Buildx for multi-platform builds..."
    
    # Create a new builder instance if it doesn't exist
    if ! docker buildx ls | grep -q "petclinic-builder"; then
        docker buildx create --name petclinic-builder --driver docker-container --use
        docker buildx inspect --bootstrap
    else
        docker buildx use petclinic-builder
    fi
    
    echo "✅ Buildx setup completed"
}

# Function to build with multi-platform support and cache optimization
build_multiplatform() {
    local service=$1
    local context=$2
    local dockerfile=$3
    local push_flag=$4
    
    echo "📦 Building $service for platforms: $PLATFORMS"
    
    # Build command with buildx for multi-platform
    local build_cmd="docker buildx build \
        --platform $PLATFORMS \
        --file $dockerfile \
        --tag petclinic-$service:latest \
        --cache-from type=gha \
        --cache-to type=gha,mode=max \
        --build-arg BUILDKIT_INLINE_CACHE=1"
    
    # Add push flag if specified (for registry push)
    if [ "$push_flag" = "push" ]; then
        build_cmd="$build_cmd --push"
    else
        build_cmd="$build_cmd --load"
    fi
    
    # Add context at the end
    build_cmd="$build_cmd $context"
    
    echo "🔨 Executing: $build_cmd"
    eval $build_cmd
}

# Parse command line arguments
PUSH_TO_REGISTRY=""
CLEAN_BUILD=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH_TO_REGISTRY="push"
            shift
            ;;
        --clean)
            CLEAN_BUILD="true"
            shift
            ;;
        --platforms)
            PLATFORMS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--push] [--clean] [--platforms linux/amd64,linux/arm64]"
            exit 1
            ;;
    esac
done

# Setup buildx builder
setup_buildx

# Clean up previous builds (optional)
if [ "$CLEAN_BUILD" = "true" ]; then
    echo "🧹 Cleaning up previous builds..."
    docker system prune -f --filter "label=project=petclinic"
    docker builder prune -f
fi

# Build backend and frontend in parallel
echo "🔄 Building backend and frontend for platforms: $PLATFORMS"

if [ "$PUSH_TO_REGISTRY" = "push" ]; then
    echo "📤 Images will be pushed to registry"
else
    echo "💾 Images will be loaded locally (ARM64 images may not be loadable on AMD64 hosts)"
fi

(
    echo "🌱 Building Spring Boot backend..."
    build_multiplatform "backend" "./petclinic-backend" "./petclinic-backend/Dockerfile" "$PUSH_TO_REGISTRY"
    echo "✅ Backend build completed"
) &

(
    echo "⚛️ Building Next.js frontend..."
    build_multiplatform "frontend" "./petclinic-frontend" "./petclinic-frontend/Dockerfile" "$PUSH_TO_REGISTRY"
    echo "✅ Frontend build completed"
) &

# Wait for both builds to complete
wait

echo "🎉 All multi-platform builds completed successfully!"

# Show available images
if [ "$PUSH_TO_REGISTRY" != "push" ]; then
    echo "📊 Local images (note: only images for current platform may be visible):"
    docker images | grep petclinic || echo "No local images found (multi-platform images were built but may not be loadable)"
else
    echo "📤 Images have been pushed to the registry for all platforms"
fi

echo ""
echo "🏗️  Build Information:"
echo "   Platforms: $PLATFORMS"
echo "   Push to registry: ${PUSH_TO_REGISTRY:-"false"}"
echo ""
echo "💡 Usage examples:"
echo "   # Build for multiple platforms locally:"
echo "   ./build-optimized.sh"
echo ""
echo "   # Build and push to registry:"
echo "   ./build-optimized.sh --push"
echo ""
echo "   # Clean build with custom platforms:"
echo "   ./build-optimized.sh --clean --platforms linux/amd64,linux/arm64,linux/arm/v7"
echo ""
echo "   # To run locally (use docker-compose):"
echo "   docker-compose up"
echo ""
echo "💡 Note: ARM64 images built on AMD64 hosts cannot be loaded locally."
echo "   Use --push to push to a registry, then pull on the target platform." 
