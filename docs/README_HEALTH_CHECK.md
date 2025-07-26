# Database Health Check System

This system provides database connectivity checking for the Flask application to prevent startup when the database is not accessible.

## Features

- **Startup Health Check**: Automatically checks database connectivity when Flask starts
- **Retry Logic**: Configurable retry attempts with delays
- **Environment Agnostic**: Works with both local development and Docker deployments
- **Health Endpoints**: API endpoints to monitor system health
- **Standalone Testing**: Independent scripts to test connectivity

## Components

### 1. Database Health Check (`db_health_check.py`)
- Core utility for testing database connectivity
- Configurable retry logic and timeouts
- Uses environment variables for database configuration
- Graceful error handling and logging

### 2. Health Check Routes (`health_routes.py`)
- `/api/health/ping` - Simple Flask availability check
- `/api/health/database` - Database connectivity check
- `/api/health/full` - Complete system health check

### 3. Standalone Test Script (`test_db_connection.py`)
- Independent database connectivity test
- Can be run without starting Flask
- Useful for troubleshooting

### 4. Comprehensive Test Script (`scripts/test_connectivity.py`)
- Tests both database and Flask connectivity
- Provides detailed troubleshooting information
- Can be run from project root

## Usage

### Automatic Startup Check
The health check runs automatically when Flask starts. If the database is not accessible, the application will exit with an error message.

### Manual Testing
```bash
# Test database connectivity only
python backend/utils/test_db_connection.py

# Test both database and Flask (from project root)
python scripts/test_connectivity.py
```

### Health Endpoints
Once Flask is running, you can check system health:

```bash
# Check if Flask is running
curl http://localhost:5000/api/health/ping

# Check database connectivity
curl http://localhost:5000/api/health/database

# Full system health check
curl http://localhost:5000/api/health/full
```

## Configuration

The system uses the same environment variables as your Flask application:

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database username (default: root)
- `DB_PASS` - Database password (default: empty)
- `DB_NAME` - Database name (default: nutrichef_db)

## Error Handling

When database connectivity fails:

1. **During Startup**: Application exits with error code 1
2. **Via Health Endpoints**: Returns HTTP 503 with error details
3. **Standalone Tests**: Provides troubleshooting suggestions

## Troubleshooting

Common issues and solutions:

1. **WAMP Service Stopped**
   - Start WAMP/MySQL service
   - Verify service is running on correct port

2. **Docker Environment**
   - Check container networking
   - Verify environment variables are set correctly
   - Ensure database container is running

3. **Connection Timeout**
   - Check network connectivity
   - Verify firewall settings
   - Increase timeout values if needed

## Customization

You can customize the health check behavior:

```python
# In app.py, modify the health check call:
check_database_health(
    max_retries=5,      # Number of retry attempts
    retry_delay=3,      # Seconds between retries
    exit_on_failure=True # Whether to exit on failure
)
```