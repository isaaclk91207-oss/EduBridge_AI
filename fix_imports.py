#!/usr/bin/env python3
"""
Script to fix 'from app.' imports in Python files.
This script finds and replaces 'from app.' with 'from ' in all .py files.
"""
import os
import re

def fix_imports_in_file(filepath):
    """Fix imports in a single Python file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace 'from app.' with 'from '
    # This handles cases like: from app.core import ... -> from core import ...
    new_content = re.sub(r'\bfrom app\.', 'from ', content)
    
    # Also handle 'import app.' patterns if any
    new_content = re.sub(r'\bimport app\.', 'import ', new_content)
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    # Walk through all .py files in the app directory
    app_dir = os.path.join(os.path.dirname(__file__), 'app')
    
    if not os.path.exists(app_dir):
        print(f"Error: {app_dir} does not exist")
        return
    
    modified_files = []
    
    for root, dirs, files in os.walk(app_dir):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                if fix_imports_in_file(filepath):
                    modified_files.append(filepath)
    
    if modified_files:
        print(f"Fixed imports in {len(modified_files)} files:")
        for f in modified_files:
            print(f"  - {f}")
    else:
        print("No files needed to be modified.")

if __name__ == "__main__":
    main()

