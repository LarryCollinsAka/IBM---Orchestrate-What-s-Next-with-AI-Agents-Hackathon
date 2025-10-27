import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration class
class Config:
    PROJECT_DIR = os.getenv('PROJECT_DIR')
    CURRENT_UTC_TIME = os.getenv('CURRENT_UTC_TIME', '2025-10-27 03:11:40')
    
    @staticmethod
    def get_current_utc():
        return datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

# Create config instance
config = Config()