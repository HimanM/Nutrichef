"""
Health check routes for monitoring application and database status.
"""
from flask import Blueprint, jsonify
from backend.utils.db_health_check import DatabaseHealthCheck
from backend.utils.logging_utils import log_info, log_error
import time

health_bp = Blueprint('health', __name__, url_prefix='/api/health')

@health_bp.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint to check if Flask is running."""
    return jsonify({
        'status': 'ok',
        'message': 'Flask application is running',
        'timestamp': time.time()
    }), 200

@health_bp.route('/database', methods=['GET'])
def database_health():
    """Check database connectivity."""
    try:
        health_checker = DatabaseHealthCheck(max_retries=1, retry_delay=0)
        is_connected = health_checker.check_database_connectivity()
        
        if is_connected:
            return jsonify({
                'status': 'ok',
                'message': 'Database connection successful',
                'timestamp': time.time()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Database connection failed',
                'timestamp': time.time()
            }), 503
            
    except Exception as e:
        log_error(f"Health check error: {e}", "Health Check")
        return jsonify({
            'status': 'error',
            'message': f'Health check failed: {str(e)}',
            'timestamp': time.time()
        }), 500

@health_bp.route('/full', methods=['GET'])
def full_health():
    """Complete health check including Flask and database."""
    try:
        # Check database
        health_checker = DatabaseHealthCheck(max_retries=1, retry_delay=0)
        db_connected = health_checker.check_database_connectivity()
        
        health_status = {
            'flask': {
                'status': 'ok',
                'message': 'Flask application is running'
            },
            'database': {
                'status': 'ok' if db_connected else 'error',
                'message': 'Database connection successful' if db_connected else 'Database connection failed'
            },
            'overall': {
                'status': 'ok' if db_connected else 'degraded',
                'message': 'All systems operational' if db_connected else 'Database connectivity issues'
            },
            'timestamp': time.time()
        }
        
        status_code = 200 if db_connected else 503
        return jsonify(health_status), status_code
        
    except Exception as e:
        log_error(f"Full health check error: {e}", "Health Check")
        return jsonify({
            'flask': {'status': 'ok', 'message': 'Flask application is running'},
            'database': {'status': 'error', 'message': f'Health check failed: {str(e)}'},
            'overall': {'status': 'error', 'message': 'System health check failed'},
            'timestamp': time.time()
        }), 500