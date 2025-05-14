#!/usr/bin/env python3
"""
Utility script to analyze the Multilingua project structure and generate documentation.
"""
import os
import sys
import json
from collections import defaultdict
import re

def count_files_by_extension(directory):
    """Count files by extension in the given directory."""
    extensions = defaultdict(int)
    
    for root, _, files in os.walk(directory):
        for file in files:
            # Skip hidden files
            if file.startswith('.'):
                continue
                
            # Get file extension
            _, ext = os.path.splitext(file)
            if ext:
                # Remove the dot from the extension
                ext = ext[1:].lower()
                extensions[ext] += 1
    
    return extensions

def detect_frameworks(directory):
    """Detect frameworks used in the project."""
    frameworks = set()
    
    # Check for package.json for Node.js projects
    package_json_path = os.path.join(directory, "package.json")
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r') as f:
                data = json.load(f)
                
                # Check dependencies and devDependencies
                dependencies = data.get("dependencies", {})
                dev_dependencies = data.get("devDependencies", {})
                all_deps = {**dependencies, **dev_dependencies}
                
                # Common frontend frameworks
                if "react" in all_deps:
                    frameworks.add("React")
                if "vue" in all_deps:
                    frameworks.add("Vue.js")
                if "angular" in all_deps or "@angular/core" in all_deps:
                    frameworks.add("Angular")
                if "svelte" in all_deps:
                    frameworks.add("Svelte")
                
                # Common backend frameworks
                if "express" in all_deps:
                    frameworks.add("Express.js")
                if "koa" in all_deps:
                    frameworks.add("Koa.js")
                if "next" in all_deps:
                    frameworks.add("Next.js")
                if "nuxt" in all_deps:
                    frameworks.add("Nuxt.js")
                
                # UI frameworks
                if "bootstrap" in all_deps:
                    frameworks.add("Bootstrap")
                if "tailwindcss" in all_deps:
                    frameworks.add("Tailwind CSS")
                if "@mui/material" in all_deps or "@material-ui/core" in all_deps:
                    frameworks.add("Material UI")
        except:
            pass
    
    # Check for requirements.txt for Python projects
    requirements_txt_path = os.path.join(directory, "requirements.txt")
    if os.path.exists(requirements_txt_path):
        try:
            with open(requirements_txt_path, 'r') as f:
                content = f.read().lower()
                
                # Common Python frameworks
                if "flask" in content:
                    frameworks.add("Flask")
                if "django" in content:
                    frameworks.add("Django")
                if "fastapi" in content:
                    frameworks.add("FastAPI")
                if "bottle" in content:
                    frameworks.add("Bottle")
                if "pyramid" in content:
                    frameworks.add("Pyramid")
        except:
            pass
    
    # Check for Django project
    if os.path.exists(os.path.join(directory, "manage.py")):
        frameworks.add("Django")
    
    # Check for Flask project
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".py"):
                try:
                    with open(os.path.join(root, file), 'r') as f:
                        content = f.read().lower()
                        if "from flask import" in content or "import flask" in content:
                            frameworks.add("Flask")
                            break
                except:
                    continue
    
    return frameworks

def identify_languages(directory):
    """Identify programming languages used in the project."""
    languages = set()
    extensions = count_files_by_extension(directory)
    
    # Map extensions to languages
    language_mapping = {
        "js": "JavaScript",
        "ts": "TypeScript",
        "jsx": "React JSX",
        "tsx": "React TSX",
        "py": "Python",
        "rb": "Ruby",
        "php": "PHP",
        "java": "Java",
        "go": "Go",
        "cs": "C#",
        "cpp": "C++",
        "c": "C",
        "swift": "Swift",
        "kt": "Kotlin",
        "rs": "Rust",
        "dart": "Dart",
        "html": "HTML",
        "css": "CSS",
        "scss": "SCSS",
        "sass": "Sass",
        "less": "Less",
        "sql": "SQL",
        "md": "Markdown",
        "json": "JSON",
        "xml": "XML",
        "yaml": "YAML",
        "yml": "YAML",
    }
    
    for ext, count in extensions.items():
        if ext in language_mapping:
            languages.add(f"{language_mapping[ext]} ({count} files)")
    
    return languages

def find_entry_points(directory):
    """Find potential entry points of the application."""
    entry_points = []
    
    # Node.js entry points
    nodejs_entry_points = ["index.js", "app.js", "server.js", "main.js"]
    for entry_point in nodejs_entry_points:
        path = os.path.join(directory, entry_point)
        if os.path.exists(path):
            entry_points.append(entry_point)
    
    # Package.json start script
    package_json_path = os.path.join(directory, "package.json")
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r') as f:
                data = json.load(f)
                if "scripts" in data and "start" in data["scripts"]:
                    entry_points.append(f"npm start ({data['scripts']['start']})")
        except:
            pass
    
    # Python entry points
    python_entry_points = ["app.py", "main.py", "run.py", "wsgi.py", "application.py", "server.py"]
    for entry_point in python_entry_points:
        path = os.path.join(directory, entry_point)
        if os.path.exists(path):
            entry_points.append(entry_point)
    
    # Django entry point
    if os.path.exists(os.path.join(directory, "manage.py")):
        entry_points.append("manage.py (Django)")
    
    return entry_points

def find_important_files(directory):
    """Find important configuration files."""
    important_files = []
    
    files_to_check = [
        "package.json",
        "requirements.txt",
        "setup.py",
        ".env",
        ".env.example",
        ".gitignore",
        "README.md",
        "docker-compose.yml",
        "Dockerfile",
        "webpack.config.js",
        "babel.config.js",
        "tsconfig.json",
        ".eslintrc.js",
        ".eslintrc.json",
        "jest.config.js",
        "pytest.ini",
        "tox.ini",
        "setup.cfg",
        "pyproject.toml"
    ]
    
    for file in files_to_check:
        path = os.path.join(directory, file)
        if os.path.exists(path):
            important_files.append(file)
    
    return important_files

def find_api_routes(directory):
    """Find API routes in the codebase."""
    api_routes = []
    
    # Express.js routes
    express_route_regex = r'(app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]'
    
    # Flask routes
    flask_route_regex = r'@app.route\s*\(\s*[\'"]([^\'"]+)[\'"]'
    
    # Django URL patterns
    django_url_regex = r'path\s*\(\s*[\'"]([^\'"]+)[\'"]'
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.py')):
                try:
                    with open(os.path.join(root, file), 'r') as f:
                        content = f.read()
                        
                        # Check for Express.js routes
                        express_matches = re.findall(express_route_regex, content)
                        for match in express_matches:
                            api_routes.append(f"{match[2]} ({match[1].upper()}) - {file}")
                        
                        # Check for Flask routes
                        flask_matches = re.findall(flask_route_regex, content)
                        for match in flask_matches:
                            api_routes.append(f"{match} - {file}")
                        
                        # Check for Django URL patterns
                        django_matches = re.findall(django_url_regex, content)
                        for match in django_matches:
                            api_routes.append(f"{match} - {file}")
                except:
                    continue
    
    return api_routes

def find_database_config(directory):
    """Find database configuration in the codebase."""
    database_info = []
    
    # Check for common database imports and configurations
    database_patterns = [
        (r'mongoose\.connect', 'MongoDB (Mongoose)'),
        (r'createConnection.*mysql', 'MySQL'),
        (r'new\s+Sequelize', 'PostgreSQL/MySQL (Sequelize)'),
        (r'psycopg2', 'PostgreSQL (psycopg2)'),
        (r'sqlite3', 'SQLite'),
        (r'MongoClient', 'MongoDB'),
        (r'db = SQLAlchemy', 'SQL (SQLAlchemy)'),
        (r'DATABASES\s*=\s*{', 'Django Database Configuration')
    ]
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.py')):
                try:
                    with open(os.path.join(root, file), 'r') as f:
                        content = f.read()
                        
                        for pattern, db_type in database_patterns:
                            if re.search(pattern, content):
                                database_info.append(f"{db_type} - {file}")
                except:
                    continue
    
    return database_info

def analyze_multilingual_features(directory):
    """Analyze multilingual features of the application."""
    features = []
    
    # Look for internationalization libraries
    i18n_patterns = [
        (r'i18n', 'i18n library'),
        (r'i18next', 'i18next library'),
        (r'react-intl', 'react-intl library'),
        (r'vue-i18n', 'vue-i18n library'),
        (r'gettext', 'gettext library'),
        (r'_\(\s*[\'"]', 'gettext translation function'),
        (r'babel.localeselector', 'Flask-Babel'),
        (r'django\.utils\.translation', 'Django Translation'),
        (r'makemessages', 'Django Internationalization'),
        (r'gettext_lazy', 'Django Lazy Translation')
    ]
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.py', '.json')):
                try:
                    with open(os.path.join(root, file), 'r') as f:
                        content = f.read()
                        
                        for pattern, feature_desc in i18n_patterns:
                            if re.search(pattern, content):
                                features.append(f"{feature_desc} - {file}")
                                
                        # Look for translation files
                        if 'translations' in root.lower() or 'locales' in root.lower() or 'i18n' in root.lower():
                            if file.endswith(('.json', '.po', '.mo')):
                                features.append(f"Translation file - {os.path.join(root, file)}")
                except:
                    continue
    
    return features

def generate_project_report(directory):
    """Generate a comprehensive report about the project."""
    if not os.path.exists(directory):
        print(f"Error: Directory '{directory}' does not exist.")
        return
    
    print(f"Analyzing project in '{directory}'...")
    
    # Collect project information
    extensions = count_files_by_extension(directory)
    frameworks = detect_frameworks(directory)
    languages = identify_languages(directory)
    entry_points = find_entry_points(directory)
    important_files = find_important_files(directory)
    api_routes = find_api_routes(directory)
    database_info = find_database_config(directory)
    multilingual_features = analyze_multilingual_features(directory)
    
    # Generate report
    report = "# Multilingua Project Analysis\n\n"
    
    report += "## Project Overview\n\n"
    
    if frameworks:
        report += "### Frameworks/Libraries Detected\n\n"
        for framework in sorted(frameworks):
            report += f"- {framework}\n"
        report += "\n"
    
    if languages:
        report += "### Programming Languages\n\n"
        for language in sorted(languages):
            report += f"- {language}\n"
        report += "\n"
    
    if entry_points:
        report += "### Application Entry Points\n\n"
        for entry_point in entry_points:
            report += f"- {entry_point}\n"
        report += "\n"
    
    if important_files:
        report += "### Important Configuration Files\n\n"
        for file in important_files:
            report += f"- {file}\n"
        report += "\n"
    
    if api_routes:
        report += "### API Routes\n\n"
        for route in api_routes[:20]:  # Limit to 20 routes to avoid overwhelming
            report += f"- {route}\n"
        if len(api_routes) > 20:
            report += f"- ... and {len(api_routes) - 20} more routes\n"
        report += "\n"
    
    if database_info:
        report += "### Database Configuration\n\n"
        for info in database_info:
            report += f"- {info}\n"
        report += "\n"
    
    if multilingual_features:
        report += "### Multilingual Features\n\n"
        for feature in multilingual_features:
            report += f"- {feature}\n"
        report += "\n"
    
    report += "## File Structure\n\n"
    report += "```\n"
    
    # Generate a simplified file structure (max 3 levels deep)
    def generate_tree(start_path, prefix="", max_depth=3, current_depth=0):
        if current_depth > max_depth:
            return ""
        
        result = ""
        items = sorted(os.listdir(start_path))
        dirs = [item for item in items if os.path.isdir(os.path.join(start_path, item)) and not item.startswith('.')]
        files = [item for item in items if os.path.isfile(os.path.join(start_path, item)) and not item.startswith('.')]
        
        # Add directories
        for i, d in enumerate(dirs):
            is_last = (i == len(dirs) - 1 and not files)
            result += f"{prefix}{'└── ' if is_last else '├── '}{d}/\n"
            result += generate_tree(
                os.path.join(start_path, d), 
                prefix + ('    ' if is_last else '│   '),
                max_depth,
                current_depth + 1
            )
        
        # Add files (limited to 5 per directory)
        if files:
            if len(files) > 5:
                for f in files[:5]:
                    is_last = (f == files[4])
                    result += f"{prefix}{'└── ' if is_last and len(files) <= 5 else '├── '}{f}\n"
                result += f"{prefix}└── ... and {len(files) - 5} more files\n"
            else:
                for i, f in enumerate(files):
                    is_last = (i == len(files) - 1)
                    result += f"{prefix}{'└── ' if is_last else '├── '}{f}\n"
        
        return result
    
    try:
        report += generate_tree(directory)
    except Exception as e:
        report += f"Error generating file tree: {e}\n"
    
    report += "```\n\n"
    
    # Add recommendations for running
    report += "## How to Run the Application\n\n"
    
    if "Node.js" in str(languages):
        report += "### For Node.js Applications\n\n"
        report += "1. Install dependencies:\n   ```\n   npm install\n   ```\n\n"
        report += "2. Start the application:\n   ```\n   npm start\n   ```\n\n"
    
    if "Python" in str(languages):
        report += "### For Python Applications\n\n"
        report += "1. Set up a virtual environment (optional but recommended):\n   ```\n   python -m venv venv\n   source venv/bin/activate  # On Windows: venv\\Scripts\\activate\n   ```\n\n"
        report += "2. Install dependencies:\n   ```\n   pip install -r requirements.txt\n   ```\n\n"
        
        if "Flask" in frameworks:
            report += "3. Run Flask application:\n   ```\n   flask run --host=0.0.0.0 --port=8000\n   ```\n\n"
        elif "Django" in frameworks:
            report += "3. Run Django application:\n   ```\n   python manage.py runserver 0.0.0.0:8000\n   ```\n\n"
        else:
            report += "3. Run the main Python file (example):\n   ```\n   python app.py\n   ```\n\n"
    
    report += "## Notes for Future Modifications\n\n"
    report += "When modifying this application, pay attention to the following:\n\n"
    
    if multilingual_features:
        report += "- The application has multilingual features, so ensure translations are maintained.\n"
    
    if "React" in frameworks:
        report += "- This is a React application - be careful with component state and props.\n"
    elif "Vue.js" in frameworks:
        report += "- This is a Vue.js application - be careful with component structure and reactivity.\n"
    elif "Angular" in frameworks:
        report += "- This is an Angular application - be careful with module structure and dependency injection.\n"
    
    if api_routes:
        report += "- The application has API routes - ensure these remain functional when making changes.\n"
    
    if database_info:
        report += "- The application uses a database - be careful with schema changes.\n"
    
    report += "- Always test thoroughly after making changes to ensure functionality is preserved.\n"
    
    # Write the report to a Markdown file
    report_path = os.path.join(os.path.dirname(directory), "PROJECT_ANALYSIS.md")
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"Analysis complete! Report saved to {report_path}")
    return report_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_project.py <directory>")
        sys.exit(1)
    
    directory = sys.argv[1]
    generate_project_report(directory)
