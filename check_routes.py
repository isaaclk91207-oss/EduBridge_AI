#!/usr/bin/env python3
"""
Script to list all available API routes in the FastAPI backend.
Run this locally to see all available endpoints.

Usage:
    python check_routes.py
    
Or start the server and visit:
    http://localhost:8000/docs
    http://localhost:8000/openapi.json
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from main import app

def list_routes():
    print("=" * 60)
    print("AVAILABLE API ROUTES IN BACKEND")
    print("=" * 60)
    
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ','.join(route.methods) if route.methods else 'GET'
            routes.append(f"{methods:10} {route.path}")
    
    # Sort and print routes
    for route in sorted(routes):
        print(route)
    
    print("=" * 60)
    print(f"Total routes: {len(routes)}")
    print("=" * 60)
    
    # Print specific endpoints of interest
    print("\n📌 KEY ENDPOINTS FOR AI FEATURES:")
    print("-" * 40)
    
    chat_routes = [r for r in routes if '/chat' in r.lower() or 'cofounder' in r.lower()]
    if chat_routes:
        print("Chat endpoints:")
        for r in chat_routes:
            print(f"  {r}")
    else:
        print("❌ NO /chat routes found!")
        print("   The agent_router might not be included in main.py")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    list_routes()

