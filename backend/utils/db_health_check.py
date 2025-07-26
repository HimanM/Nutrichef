"""
Database health check utility for Flask application startup.
Checks database connectivity before the application starts.
"""
import mysql.connector
import os
import sys
import time
from backend.utils.logging_utils import log_info, log_error, log_success, log_warning


class DatabaseHealthCheck:
    def __init__(self, max_retries=3, retry_delay=2):
        """
        Initialize database health check.
        
        Args:
            max_retries (int): Maximum number of connection attempts
            retry_delay (int): Delay between retry attempts in seconds
        """
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
    def get_db_config(self):
        """Extract database configuration from environment variables."""
        return {
            'host': os.environ.get('DB_HOST', 'localhost'),
            'port': int(os.environ.get('DB_PORT', '3306')),
            'user': os.environ.get('DB_USER', 'root'),
            'password': os.environ.get('DB_PASS', ''),
            'database': os.environ.get('DB_NAME', 'nutrichef_db')
        }
    
    def test_connection(self, config):
        """
        Test database connection with given configuration.
        
        Args:
            config (dict): Database configuration dictionary
            
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            connection = mysql.connector.connect(
                host=config['host'],
                port=config['port'],
                user=config['user'],
                password=config['password'],
                database=config['database'],
                connection_timeout=5  # 5 second timeout
            )
            
            if connection.is_connected():
                # Test with a simple query
                cursor = connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                connection.close()
                return True
                
        except mysql.connector.Error as e:
            log_error(f"Database connection failed: {e}", "DB Health Check")
            return False
        except Exception as e:
            log_error(f"Unexpected error during database connection: {e}", "DB Health Check")
            return False
            
        return False
    
    def check_database_connectivity(self):
        """
        Check database connectivity with retry logic.
        
        Returns:
            bool: True if database is accessible, False otherwise
        """
        log_info("Starting database connectivity check...", "DB Health Check")
        
        config = self.get_db_config()
        
        # Mask password in logs
        log_config = config.copy()
        log_config['password'] = '***' if config['password'] else 'empty'
        log_info(f"Database config: {log_config}", "DB Health Check")
        
        for attempt in range(1, self.max_retries + 1):
            log_info(f"Connection attempt {attempt}/{self.max_retries}...", "DB Health Check")
            
            if self.test_connection(config):
                log_success(f"Database connection successful on attempt {attempt}!", "DB Health Check")
                return True
            
            if attempt < self.max_retries:
                log_warning(f"Connection failed, retrying in {self.retry_delay} seconds...", "DB Health Check")
                time.sleep(self.retry_delay)
        
        log_error(f"Database connection failed after {self.max_retries} attempts", "DB Health Check")
        return False
    
    def check_or_exit(self, exit_on_failure=True):
        """
        Check database connectivity and optionally exit on failure.
        
        Args:
            exit_on_failure (bool): Whether to exit the application on connection failure
            
        Returns:
            bool: True if connection successful, False otherwise
        """
        is_connected = self.check_database_connectivity()
        
        if not is_connected and exit_on_failure:
            log_error("Database is not accessible. Application cannot start.", "DB Health Check")
            log_info("Please ensure your database service is running and configuration is correct.", "DB Health Check")
            sys.exit(1)
            
        return is_connected


def check_database_health(max_retries=3, retry_delay=2, exit_on_failure=True):
    """
    Convenience function to check database health.
    
    Args:
        max_retries (int): Maximum number of connection attempts
        retry_delay (int): Delay between retry attempts in seconds
        exit_on_failure (bool): Whether to exit the application on connection failure
        
    Returns:
        bool: True if connection successful, False otherwise
    """
    health_checker = DatabaseHealthCheck(max_retries, retry_delay)
    return health_checker.check_or_exit(exit_on_failure)