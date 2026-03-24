import sys
try:
    from backend.main import app
    print("Backend loaded successfully")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
