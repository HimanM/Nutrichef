import logging
import os

# Define custom color codes
class LogColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Basic configuration for logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger('NutriChefLogger')

def get_icon(level):
    if level == 'SUCCESS':
        return '✅'
    elif level == 'INFO':
        return 'ℹ️'
    elif level == 'WARNING':
        return '⚠️'
    elif level == 'ERROR':
        return '❌'
    return ''

def log_message(level, message, service_name=""):
    """
    Logs a message with standardized formatting.
    - level: 'SUCCESS', 'INFO', 'WARNING', 'ERROR'
    - message: The message string to log.
    - service_name: Optional name of the service/module logging the message.
    """
    color_map = {
        'SUCCESS': LogColors.OKGREEN,
        'INFO': LogColors.OKCYAN,
        'WARNING': LogColors.WARNING,
        'ERROR': LogColors.FAIL,
    }
    
    color = color_map.get(level, LogColors.ENDC)
    icon = get_icon(level)
    
    if service_name:
        formatted_message = f"{color}{LogColors.BOLD}[{service_name}]{LogColors.ENDC} {icon} {message}{LogColors.ENDC}"
    else:
        formatted_message = f"{color}{icon} {message}{LogColors.ENDC}"
        
    logger.info(formatted_message)

def log_success(message, service_name=""):
    log_message('SUCCESS', message, service_name)

def log_info(message, service_name=""):
    log_message('INFO', message, service_name)

def log_warning(message, service_name=""):
    log_message('WARNING', message, service_name)

def log_error(message, service_name=""):
    log_message('ERROR', message, service_name)

def log_header(message):
    logger.info(f"\n{LogColors.HEADER}{LogColors.BOLD}--- {message} ---{LogColors.ENDC}")

def suppress_external_warnings():
    """Suppresses verbose warnings from libraries like TensorFlow."""
    log_info("Suppressing verbose logs from external libraries (e.g., TensorFlow).", "System")
    
    # Suppress TensorFlow C++ level logs (1 = INFO, 2 = WARNING, 3 = ERROR)
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    
    # Turn off oneDNN custom operations messages
    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
    
    # Suppress TensorFlow Python logs
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    
    # Suppress other warnings
    import warnings
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    warnings.filterwarnings('ignore', category=FutureWarning)
    
    # Suppress Keras warnings specifically if needed
    try:
        from tf_keras.src.utils import io_utils
        io_utils.disable_interactive_logging()
    except ImportError:
        pass # Ignore if tf_keras is not used or path changes