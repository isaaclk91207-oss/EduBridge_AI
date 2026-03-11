#!/usr/bin/env python3
"""
Script to list all available API routes in the FastAPI backend.
Run this locally to see all available endpoints.

Usage:
    cd backend
    python -c "from main import app; [print(f'{list(m)[0]:8} {r.path}') for r in app.routes if hasattr(r, 'path')]"
    
Or start the server and visit:
    http://localhost:8000/docs
    http://localhost:8000/openapi.json
"""

if __name__ == "__main__":
    try:
        from backend.main import app
        print("=" * 60)
        print("AVAILABLE API ROUTES IN BACKEND")
        print("=" * 60)
        
        routes = []
        for route in app.routes:
            if hasattr(route, 'path'):
                methods = list(route.methods) if hasattr(route, 'methods') else ['GET']
                routes.append(f"{methods[0]:8} {route.path}")
        
        # Sort and print routes
        for route in sorted(routes):
            print(route)
        
        print("=" * 60)
        print(f"Total routes: {len(routes)}")
        
        # Print specific endpoints of interest
        print("\nKEY ENDPOINTS FOR AI FEATURES:")
        print("-" * 40)
        
        chat_routes = [r for r in routes if '/chat' in r.lower()]
        if chat_routes:
            print("Chat endpoints:")
            for r in chat_routes:
                print(f"  {r}")
        else:
            print("No /chat routes found!")
        
        print("\n" + "=" * 60)
    except ImportError as e:
        print(f"Error: Could not import app - {e}")
        print("Make sure you're running this from the backend directory")

