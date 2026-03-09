import sys
import os
from pathlib import Path

# Repository root
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.app import app 

if __name__ == "__main__":
    import uvicorn
    # Local
    PORT = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.app:app", host="0.0.0.0", port=PORT, reload=True)