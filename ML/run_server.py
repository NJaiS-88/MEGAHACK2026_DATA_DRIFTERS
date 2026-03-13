#!/usr/bin/env python
"""
Run the ML server on port 8010
"""
import uvicorn
import os
import sys
import signal
import asyncio

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

def handle_shutdown(signum, frame):
    """Handle graceful shutdown"""
    print("\n[Server] Shutting down gracefully...")
    sys.exit(0)

if __name__ == "__main__":
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    
    print("Starting ThinkMap ML Service on http://127.0.0.1:8010")
    print("Press CTRL+C to stop")
    
    try:
        uvicorn.run(
            "ML.app:app",
            host="127.0.0.1",
            port=8010,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n[Server] Shutdown complete.")
    except Exception as e:
        # Suppress asyncio cancellation errors during shutdown
        if isinstance(e, (asyncio.CancelledError, KeyboardInterrupt)):
            print("\n[Server] Shutdown complete.")
        else:
            raise
