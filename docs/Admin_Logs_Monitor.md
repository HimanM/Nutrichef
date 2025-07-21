# Admin Logs Monitor

## Overview

The Admin Logs Monitor is a comprehensive real-time monitoring dashboard for the NutriChef backend. It provides administrators with real-time visibility into system performance, Flask application logs, and server health metrics.

## Features

### 📊 Real-time System Metrics
- **CPU Usage**: Live monitoring of processor utilization with visual progress bars
- **Memory Usage**: RAM consumption tracking with detailed usage statistics
- **Disk Usage**: Storage space monitoring with used/total space information
- **Active Processes**: Count of running system processes

### 📋 Real-time Log Streaming
- **Server-Sent Events (SSE)**: Real-time log streaming without page refresh
- **Color-coded Logs**: Different colors for log levels (success, info, warning, error)
- **Request Monitoring**: Special handling for HTTP request logs with status codes
- **Log Filtering**: Filter by log level and type for focused monitoring
- **Auto-scroll**: Optional automatic scrolling to follow new logs

### 📈 Performance Charts
- **CPU/Memory Timeline**: Historical performance data visualization
- **Network Activity**: Bytes sent/received monitoring
- **Interactive Charts**: Powered by Chart.js for smooth animations

### 🎛️ Advanced Controls
- **Log Statistics**: Real-time counters for different log types
- **Clear Logs**: Administrative function to clear log history
- **Connection Status**: Visual indicator of real-time connection health
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Architecture

### Backend Components

#### 1. Log Monitor (`backend/utils/log_monitor.py`)
- **LogMonitor Class**: Core monitoring engine
- **FlaskLogHandler**: Custom log handler for Flask applications
- **System Metrics Collection**: Uses `psutil` for system monitoring
- **Queue Management**: Thread-safe log queuing system

#### 2. Admin Routes (`backend/routes/admin_routes.py`)
- **SSE Endpoint**: `/api/admin/logs/stream` for real-time log streaming
- **REST APIs**: Standard endpoints for log retrieval and system metrics
- **Authentication**: Admin-only access with JWT token verification

#### 3. Template (`backend/templates/admin/logs_monitor.html`)
- **Standalone HTML**: Self-contained monitoring page
- **Real-time Updates**: JavaScript EventSource for SSE connection
- **Responsive Design**: Mobile-friendly interface

### Frontend Components

#### React Component (`frontend/src/pages/admin/AdminLogsMonitor.jsx`)
- **React Hook Integration**: Uses useEffect and useState for state management
- **Real-time Connectivity**: EventSource integration for live updates
- **Responsive Design**: Tailwind CSS for consistent admin theme
- **Filter Management**: Client-side log filtering capabilities

## Usage

### Accessing the Monitor

#### Option 1: React Frontend
1. Navigate to Admin Dashboard
2. Click "System Logs Monitor" card
3. Redirects to `/admin/logs-monitor`

#### Option 2: Direct Template Access
1. Visit `/api/admin/logs/monitor` (requires admin authentication)
2. Self-contained HTML page with full functionality

### API Endpoints

```
GET /api/admin/logs/recent?limit=50    # Get recent logs
GET /api/admin/logs/stream             # SSE stream for real-time logs
GET /api/admin/system/metrics          # Current system metrics
POST /api/admin/logs/clear             # Clear all logs
GET /api/admin/system/info             # Detailed system information
```

### Log Types and Colors

- **🟢 Success**: Successful operations (green)
- **🔵 Info**: General information (blue)  
- **🟡 Warning**: Warning messages (yellow)
- **🔴 Error**: Error conditions (red)
- **🌐 Request**: HTTP requests (varies by status code)

## Configuration

### Environment Variables
```bash
# No specific environment variables required
# Uses existing Flask and database configurations
```

### Dependencies
```python
# Backend Requirements
psutil>=5.9.0          # System monitoring
flask                  # Web framework
flask-jwt-extended     # Authentication
```

### Frontend Dependencies
```javascript
// React Dependencies
react
axios                  # HTTP client
react-icons           # Icon library
```

## Security Features

- **Admin-Only Access**: Requires admin role for all monitoring functions
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Built-in protection against abuse
- **Cross-Origin Safety**: Properly configured CORS headers

## Performance Considerations

- **Log Rotation**: Automatic cleanup of old logs (max 500 entries)
- **Efficient Queuing**: Thread-safe queue system for log handling
- **Minimal Resource Usage**: Optimized system metric collection
- **Graceful Degradation**: Handles connection failures gracefully

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check admin authentication
   - Verify JWT token validity
   - Ensure backend server is running

2. **No Logs Appearing**
   - Verify Flask application is generating logs
   - Check log level filters
   - Ensure WebSocket/SSE connection is established

3. **System Metrics Not Updating**
   - Verify `psutil` package installation
   - Check system permissions
   - Review backend error logs

### Debug Mode
```python
# Enable detailed logging
import logging
logging.getLogger('NutriChefLogger').setLevel(logging.DEBUG)
```

## Future Enhancements

- **Log Export**: Download logs as CSV/JSON
- **Alert System**: Email notifications for critical errors
- **Historical Analytics**: Long-term performance trend analysis
- **Custom Dashboards**: User-configurable monitoring views
- **Integration Hooks**: Webhook support for external monitoring tools

## Integration with Existing Logging

The monitor seamlessly integrates with the existing `logging_utils.py` system:
- Service startup logs (colored console output)
- Flask request/response logs
- Application error logs
- Custom business logic logs

Both logging systems work together to provide comprehensive monitoring capabilities without disrupting existing functionality.
