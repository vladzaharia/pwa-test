#!/bin/bash

# PWA Docker Deployment Script

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_success ".env file created. Please review and modify if needed."
    else
        print_status ".env file found."
    fi
}

# Build and deploy
deploy() {
    local mode=${1:-"development"}
    
    print_status "Starting PWA deployment in $mode mode..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Build and start containers
    print_status "Building and starting containers..."
    if [ "$mode" = "production" ]; then
        docker-compose up --build -d
    else
        docker-compose up --build
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Deployment completed successfully!"
        print_status "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
        print_status "Backend API: http://localhost:${BACKEND_PORT:-3001}/api"
        
        if [ "$mode" = "production" ]; then
            print_status "Containers are running in the background."
            print_status "Use 'docker-compose logs -f' to view logs."
            print_status "Use 'docker-compose down' to stop containers."
        fi
    else
        print_error "Deployment failed!"
        exit 1
    fi
}

# Show help
show_help() {
    echo "PWA Docker Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Deploy in development mode (foreground)"
    echo "  prod        Deploy in production mode (background)"
    echo "  stop        Stop all containers"
    echo "  logs        Show container logs"
    echo "  clean       Stop containers and remove images"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Start in development mode"
    echo "  $0 prod     # Start in production mode"
    echo "  $0 stop     # Stop all containers"
}

# Main script logic
main() {
    local command=${1:-"dev"}
    
    case $command in
        "dev")
            check_docker
            setup_env
            deploy "development"
            ;;
        "prod")
            check_docker
            setup_env
            deploy "production"
            ;;
        "stop")
            print_status "Stopping containers..."
            docker-compose down
            print_success "Containers stopped."
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "clean")
            print_status "Stopping containers and removing images..."
            docker-compose down --rmi all --volumes --remove-orphans
            print_success "Cleanup completed."
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
