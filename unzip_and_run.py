#!/usr/bin/env python3
"""
Utility script to unzip and run the Multilingua web application.
"""
import os
import sys
import zipfile
import shutil
import subprocess
import json
from pathlib import Path

# Constants
ZIP_FILE_NAME = "Multilingua-lartikonj-patch-1.zip"
EXTRACT_DIR = "multilingua_app"

def find_zip_file():
    """Find the zip file in the current directory or subdirectories."""
    print("Searching for the zip file...")
    
    # List of places to search
    search_locations = [
        ".",
        "./attached_assets",
        "./uploads",
        "./downloads",
        "./assets",
        os.path.expanduser("~")
    ]
    
    for location in search_locations:
        if os.path.exists(location):
            for root, _, files in os.walk(location):
                for file in files:
                    if file.lower() == ZIP_FILE_NAME.lower() or "multilingua" in file.lower() and file.endswith(".zip"):
                        zip_path = os.path.join(root, file)
                        print(f"Found zip file at: {zip_path}")
                        return zip_path
    
    return None

def extract_zip(zip_path):
    """Extract the zip file to the specified directory."""
    print(f"Extracting {zip_path} to {EXTRACT_DIR}...")
    
    # Remove the extraction directory if it exists
    if os.path.exists(EXTRACT_DIR):
        print(f"Removing existing directory: {EXTRACT_DIR}")
        shutil.rmtree(EXTRACT_DIR)
    
    # Create the extraction directory
    os.makedirs(EXTRACT_DIR, exist_ok=True)
    
    # Extract the zip file
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(EXTRACT_DIR)
    
    print(f"Successfully extracted to {EXTRACT_DIR}")
    return EXTRACT_DIR

def detect_project_type(extract_dir):
    """Detect whether the project is Node.js or Python based."""
    print("Detecting project type...")
    
    # Check for Node.js project indicators
    has_package_json = os.path.exists(os.path.join(extract_dir, "package.json"))
    has_node_modules = os.path.exists(os.path.join(extract_dir, "node_modules"))
    
    # Check for Python project indicators
    has_requirements_txt = os.path.exists(os.path.join(extract_dir, "requirements.txt"))
    has_setup_py = os.path.exists(os.path.join(extract_dir, "setup.py"))
    has_py_files = any(f.endswith('.py') for f in os.listdir(extract_dir) if os.path.isfile(os.path.join(extract_dir, f)))
    
    if has_package_json or has_node_modules:
        print("Detected Node.js project")
        return "nodejs"
    elif has_requirements_txt or has_setup_py or has_py_files:
        print("Detected Python project")
        return "python"
    else:
        # Look for common web files
        has_html = any(f.endswith('.html') for f in os.listdir(extract_dir) if os.path.isfile(os.path.join(extract_dir, f)))
        has_js = any(f.endswith('.js') for f in os.listdir(extract_dir) if os.path.isfile(os.path.join(extract_dir, f)))
        
        if has_html and has_js:
            print("Detected static web project")
            return "static"
        
        print("Could not determine project type. Assuming it's a static web project.")
        return "unknown"

def setup_nodejs_project(extract_dir):
    """Set up a Node.js project."""
    print("Setting up Node.js project...")
    
    # Change to the project directory
    os.chdir(extract_dir)
    
    # Install dependencies
    print("Installing dependencies...")
    try:
        subprocess.run(["npm", "install"], check=True)
        print("Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("Warning: Failed to install dependencies. The application may not run correctly.")
    
    # Determine how to start the application
    package_json_path = os.path.join(".", "package.json")
    if os.path.exists(package_json_path):
        with open(package_json_path, 'r') as file:
            try:
                package_data = json.load(file)
                if "scripts" in package_data and "start" in package_data["scripts"]:
                    print(f"Found start script: {package_data['scripts']['start']}")
                    return ["npm", "start"]
            except json.JSONDecodeError:
                print("Warning: Could not parse package.json")
    
    # Check for common server files
    server_files = ["index.js", "app.js", "server.js", "main.js"]
    for file in server_files:
        if os.path.exists(file):
            print(f"Found server file: {file}")
            return ["node", file]
    
    print("Could not determine how to start the Node.js application")
    return None

def setup_python_project(extract_dir):
    """Set up a Python project."""
    print("Setting up Python project...")
    
    # Change to the project directory
    os.chdir(extract_dir)
    
    # Look for virtualenv
    venv_dirs = ["venv", "env", ".venv", ".env"]
    venv_exists = any(os.path.exists(d) for d in venv_dirs)
    
    # Install dependencies if requirements.txt exists
    if os.path.exists("requirements.txt"):
        print("Installing dependencies from requirements.txt...")
        try:
            if not venv_exists:
                print("Creating virtual environment...")
                subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
                
                # Activate the virtual environment
                if os.name == 'nt':  # Windows
                    pip_path = os.path.join("venv", "Scripts", "pip")
                else:  # Linux/Mac
                    pip_path = os.path.join("venv", "bin", "pip")
            else:
                pip_path = "pip"
                
            subprocess.run([pip_path, "install", "-r", "requirements.txt"], check=True)
            print("Dependencies installed successfully")
        except subprocess.CalledProcessError:
            print("Warning: Failed to install dependencies. The application may not run correctly.")
    
    # Check for common server files
    server_files = ["app.py", "main.py", "run.py", "wsgi.py", "application.py", "server.py"]
    for file in server_files:
        if os.path.exists(file):
            print(f"Found server file: {file}")
            
            # Check if the file contains a Flask application
            with open(file, 'r') as f:
                content = f.read()
                if "flask" in content.lower():
                    return [sys.executable, file]
                else:
                    return [sys.executable, file]
    
    # Look for a Django project
    if os.path.exists("manage.py"):
        print("Found Django project")
        return [sys.executable, "manage.py", "runserver", "0.0.0.0:8000"]
    
    print("Could not determine how to start the Python application")
    return None

def setup_static_project(extract_dir):
    """Set up a static web project."""
    print("Setting up static web project...")
    
    # Change to the project directory
    os.chdir(extract_dir)
    
    # Create a simple Python HTTP server
    print("Creating a simple HTTP server to serve static files...")
    return [sys.executable, "-m", "http.server", "5000"]

def run_application(start_command):
    """Run the application with the provided start command."""
    if start_command:
        print(f"Starting application with command: {' '.join(start_command)}")
        try:
            subprocess.run(start_command)
        except KeyboardInterrupt:
            print("Application stopped by user")
        except Exception as e:
            print(f"Error running application: {e}")
    else:
        print("No start command determined. Please check the README.md for manual instructions.")

def main():
    """Main function to unzip and run the application."""
    print("=== Multilingua Web Application Setup ===")
    
    # Find the zip file
    zip_path = find_zip_file()
    if not zip_path:
        print(f"Error: Could not find the zip file '{ZIP_FILE_NAME}'")
        print("Please ensure the zip file is in the current directory or a subdirectory.")
        return
    
    # Extract the zip file
    extract_dir = extract_zip(zip_path)
    
    # Detect project type
    project_type = detect_project_type(extract_dir)
    
    # Setup and run the project based on its type
    start_command = None
    if project_type == "nodejs":
        start_command = setup_nodejs_project(extract_dir)
    elif project_type == "python":
        start_command = setup_python_project(extract_dir)
    elif project_type == "static" or project_type == "unknown":
        start_command = setup_static_project(extract_dir)
    
    # Run the application
    if start_command:
        # Run the analyze project script first to generate documentation
        analyzer_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "analyze_project.py")
        if os.path.exists(analyzer_path):
            print("Analyzing project structure...")
            try:
                subprocess.run([sys.executable, analyzer_path, extract_dir])
            except Exception as e:
                print(f"Warning: Failed to analyze project: {e}")
        
        run_application(start_command)
    else:
        print("Failed to determine how to start the application.")
        print("Please check the README.md for manual instructions.")

if __name__ == "__main__":
    main()
