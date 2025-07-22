import logging
import time
import queue
import threading
import json
import psutil
import os
from datetime import datetime
from flask import Flask
from typing import Dict, List, Any

class LogMonitor:
    """Real-time log monitoring with system metrics."""
    
    def __init__(self):
        self.log_queue = queue.Queue(maxsize=1000)
        self.clients = set()
        self.system_metrics = {}
        self.flask_logs = []
        self.max_logs = 500  # Keep last 500 logs
        self._setup_logging()
        self._start_system_monitor()
    
    def _setup_logging(self):
        """Setup Flask request logging handler."""
        self.flask_handler = FlaskLogHandler(self.log_queue)
        self.flask_handler.setLevel(logging.INFO)
        
        # Create formatter for Flask logs
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.flask_handler.setFormatter(formatter)
    
    def setup_flask_logging(self, app: Flask):
        """Setup logging for Flask application."""
        # Add our custom handler to Flask's logger
        app.logger.addHandler(self.flask_handler)
        
        # Also add to Werkzeug logger for request logs
        werkzeug_logger = logging.getLogger('werkzeug')
        werkzeug_logger.addHandler(self.flask_handler)
        werkzeug_logger.setLevel(logging.INFO)
    
    def _start_system_monitor(self):
        """Start background thread for system monitoring."""
        def monitor_system():
            while True:
                try:
                    self.system_metrics = {
                        'timestamp': datetime.now().isoformat(),
                        'cpu_percent': psutil.cpu_percent(interval=1),
                        'memory': {
                            'total': psutil.virtual_memory().total,
                            'available': psutil.virtual_memory().available,
                            'percent': psutil.virtual_memory().percent,
                            'used': psutil.virtual_memory().used
                        },
                        'disk': {
                            'total': psutil.disk_usage('/').total if os.name != 'nt' else psutil.disk_usage('C:\\').total,
                            'used': psutil.disk_usage('/').used if os.name != 'nt' else psutil.disk_usage('C:\\').used,
                            'free': psutil.disk_usage('/').free if os.name != 'nt' else psutil.disk_usage('C:\\').free,
                            'percent': psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:\\').percent
                        },
                        'network': psutil.net_io_counters()._asdict(),
                        'process_count': len(psutil.pids()),
                        'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
                    }
                except Exception as e:
                    print(f"Error collecting system metrics: {e}")
                
                time.sleep(5)  # Update every 5 seconds
        
        monitor_thread = threading.Thread(target=monitor_system, daemon=True)
        monitor_thread.start()
    
    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent logs."""
        return self.flask_logs[-limit:] if self.flask_logs else []
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics."""
        return self.system_metrics
    
    def add_client(self, client_id: str):
        """Add SSE client."""
        self.clients.add(client_id)
    
    def remove_client(self, client_id: str):
        """Remove SSE client."""
        self.clients.discard(client_id)
    
    def get_new_logs(self) -> List[Dict[str, Any]]:
        """Get new logs from queue."""
        logs = []
        try:
            while not self.log_queue.empty():
                log_entry = self.log_queue.get_nowait()
                logs.append(log_entry)
                
                # Add to flask_logs and maintain size limit
                self.flask_logs.append(log_entry)
                if len(self.flask_logs) > self.max_logs:
                    self.flask_logs = self.flask_logs[-self.max_logs:]
                    
        except queue.Empty:
            pass
        return logs


class FlaskLogHandler(logging.Handler):
    """Custom log handler for Flask logs."""
    
    def __init__(self, log_queue: queue.Queue):
        super().__init__()
        self.log_queue = log_queue
    
    def emit(self, record):
        """Emit a log record."""
        try:
            # Format the log entry
            log_entry = {
                'timestamp': datetime.fromtimestamp(record.created).isoformat(),
                'level': record.levelname,
                'logger': record.name,
                'message': self.format(record),
                'module': getattr(record, 'module', ''),
                'function': getattr(record, 'funcName', ''),
                'line': getattr(record, 'lineno', ''),
                'pathname': getattr(record, 'pathname', '')
            }
            
            # Determine log type and color
            if 'GET' in record.getMessage() or 'POST' in record.getMessage() or 'PUT' in record.getMessage() or 'DELETE' in record.getMessage():
                log_entry['type'] = 'request'
                if '200' in record.getMessage():
                    log_entry['color'] = 'success'
                elif '404' in record.getMessage():
                    log_entry['color'] = 'warning'
                elif '500' in record.getMessage() or '400' in record.getMessage():
                    log_entry['color'] = 'error'
                else:
                    log_entry['color'] = 'info'
            elif record.levelname == 'ERROR':
                log_entry['type'] = 'error'
                log_entry['color'] = 'error'
            elif record.levelname == 'WARNING':
                log_entry['type'] = 'warning'
                log_entry['color'] = 'warning'
            else:
                log_entry['type'] = 'info'
                log_entry['color'] = 'info'
            
            # Add to queue if not full
            if not self.log_queue.full():
                self.log_queue.put(log_entry)
                
        except Exception as e:
            print(f"Error in FlaskLogHandler: {e}")


# Global log monitor instance
log_monitor = LogMonitor()
