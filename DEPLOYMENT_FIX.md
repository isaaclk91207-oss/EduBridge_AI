# EduBridge AI - Clean Backend Structure for Render

I've created a clean, production-ready FastAPI backend structure that avoids complex import issues.

## New Project Structure

```
backend/
├── main.py                 # Main entry point
├── requirements.txt        # Python dependencies
├── render.yaml            # Render deployment config
├── .gitignore            # Git ignore file
├── core/
│   ├── __init__.py
│   ├── config.py         # Settings/configuration
│   └── database.py       # Database setup
├── models/
│   ├── __init__.py
│   ├── user.py           # User model
│   ├── lecture.py        # Lecture model
│   └── candidate.py     # Candidate model
└── routes/
    ├── __init__.py
    ├── authentication.py # Auth endpoints
    ├── users.py         # User endpoints
    ├── lectures.py      # Lecture endpoints
    └── candidates.py    # Candidate endpoints
```

## Key Design Principles

1. **No sys.path hacks** - Uses standard Python package imports
2. **rootDir: backend** - Set in render.yaml
3. **Standard imports** - Clean relative imports work perfectly

## Import Examples (main.py)

```python
# No sys.path needed! Just use standard imports:
from core.database import database_initialize
from routes import authentication, users, lectures, candidates
```

## Import Examples (routes/authentication.py)

```python
# Import from core and models:
from core.database import get_async_session
from models.user import User
```

## Render Configuration (render.yaml)

```yaml
services:
  - type: web
    name: edubridge-backend
    env: python
    region: oregon
    rootDir: backend
    buildCommand: pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port=10000
    envVars:
      - key: PYTHON_VERSION
        value: "3.12.0"
      - key: PORT
        value: "10000"
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
```

## Environment Variables Needed

Set these in Render dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string (e.g., from Neon)
- `SECRET_KEY` - A secure secret key for JWT tokens
- `FRONTEND_URL` - Your frontend URL (optional)

## To Deploy

1. Push the `backend/` folder to your Git repository
2. Connect the repository to Render
3. Render will automatically use `render.yaml` for deployment
4. Set the required environment variables in Render dashboard

The port timeout issue will be resolved automatically because the app now starts correctly without import errors.

