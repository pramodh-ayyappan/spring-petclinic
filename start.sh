#!/bin/bash

# Spring PetClinic Docker Quick Start Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to show help
show_help() {
    echo "Spring PetClinic Docker Quick Start"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start         Start all services (default)"
    echo "  start-mysql   Start with MySQL instead of PostgreSQL"
    echo "  start-nginx   Start with Nginx reverse proxy"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  logs          Show logs for all services"
    echo "  status        Show status of all services"
    echo "  clean         Stop and remove all containers and volumes"
    echo "  build         Build all Docker images"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Start with default PostgreSQL"
    echo "  $0 start-mysql        # Start with MySQL"
    echo "  $0 start-nginx        # Start with Nginx proxy"
    echo "  $0 logs               # View logs"
    echo "  $0 clean              # Clean up everything"
}

# Function to wait for service to be healthy
wait_for_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "$service_name.*healthy"; then
            print_success "$service_name is healthy!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$service_name might not be fully ready yet. Check logs if you encounter issues."
    return 1
}

# Function to start services
start_services() {
    local profile=${1:-""}
    
    print_status "Starting Spring PetClinic services..."
    
    if [ -n "$profile" ]; then
        docker-compose --profile "$profile" up -d
    else
        docker-compose up -d
    fi
    
    # Wait for database to be ready
    wait_for_service "postgres"
    
    # Wait for backend to be ready
    wait_for_service "backend"
    
    # Wait for frontend to be ready
    wait_for_service "frontend"
    
    print_success "All services started successfully!"
    echo ""
    echo "🎉 Spring PetClinic is now running!"
    echo ""
    echo "📱 Frontend:  http://localhost:3000"
    echo "🔧 Backend:   http://localhost:8080"
    echo "💾 Database:  localhost:5432 (postgres/petclinic)"
    echo ""
    echo "Run '$0 logs' to view logs"
    echo "Run '$0 stop' to stop services"
}

# Function to stop services
stop_services() {
    print_status "Stopping Spring PetClinic services..."
    docker-compose down
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting Spring PetClinic services..."
    docker-compose restart
    print_success "Services restarted successfully!"
}

# Function to show logs
show_logs() {
    print_status "Showing logs for all services (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to clean up
clean_up() {
    print_warning "This will stop and remove all containers, networks, and volumes."
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    print_success "Images built successfully!"
}

# Main script logic
main() {
    case ${1:-start} in
        start)
            check_prerequisites
            start_services
            ;;
        start-mysql)
            check_prerequisites
            start_services "mysql"
            ;;
        start-nginx)
            check_prerequisites
            start_services "nginx"
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_up
            ;;
        build)
            check_prerequisites
            build_images
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 
