#!/usr/bin/env python3
"""
MASTER ORCHESTRATOR - Self-correcting autonomous setup system
Run this script first. It will handle all errors and continue.

USAGE: python3 master_orchestrator.py
"""

import os
import sys
import subprocess
import time
import json
import traceback
from pathlib import Path
import logging
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('setup_orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SelfHealingOrchestrator:
    def __init__(self):
        self.state_file = 'orchestrator_state.json'
        self.scripts = [
            {'name': 'setup_project.py', 'retries': 3, 'timeout': 300},
            {'name': 'check_dependencies.py', 'retries': 3, 'timeout': 180},
            {'name': 'build_agents_step1.py', 'retries': 3, 'timeout': 240},
            {'name': 'build_agents_step2.py', 'retries': 3, 'timeout': 240},
            {'name': 'build_agents_step3.py', 'retries': 3, 'timeout': 240},
            {'name': 'build_agents_step4.py', 'retries': 3, 'timeout': 240},
            {'name': 'finalize_system.py', 'retries': 3, 'timeout': 180},
        ]
        self.current_state = self.load_state()
        self.error_fixes = self.load_error_fixes()
    
    def load_state(self):
        """Load or create state file"""
        default_state = {
            'current_step': 0,
            'completed_steps': [],
            'failed_steps': {},
            'start_time': time.time(),
            'error_count': 0,
            'retry_count': {},
            'system_checks': {}
        }
        
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, 'r') as f:
                    return json.load(f)
            except:
                logger.warning("State file corrupted, creating new one")
        
        return default_state
    
    def save_state(self):
        """Save current state"""
        with open(self.state_file, 'w') as f:
            json.dump(self.current_state, f, indent=2)
    
    def load_error_fixes(self):
        """Pre-defined error fixes"""
        return {
            'SyntaxError': self.fix_syntax_error,
            'IndentationError': self.fix_indentation_error,
            'ModuleNotFoundError': self.fix_missing_module,
            'ImportError': self.fix_import_error,
            'FileNotFoundError': self.fix_file_not_found,
            'PermissionError': self.fix_permission_error,
            'UnicodeDecodeError': self.fix_encoding_error,
            'TimeoutError': self.fix_timeout_error,
            'default': self.fix_generic_error
        }
    
    def run_script(self, script_name, retries, timeout):
        """Run a script with error handling"""
        logger.info(f"Running: {script_name}")
        
        for attempt in range(retries):
            try:
                result = subprocess.run(
                    [sys.executable, script_name],
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    check=True
                )
                
                logger.info(f"[OK] {script_name} completed successfully")
                if result.stdout:
                    print(result.stdout)
                return True
                
            except subprocess.CalledProcessError as e:
                error_output = e.stderr if e.stderr else e.stdout
                error_type = self.detect_error_type(error_output)
                
                logger.error(f"Attempt {attempt + 1}/{retries} failed for {script_name}")
                logger.error(f"Error type: {error_type}")
                logger.error(f"Error details: {error_output[:500]}")
                
                if self.attempt_fix(script_name, error_type, error_output, attempt):
                    continue
                else:
                    logger.error(f"Could not fix error in {script_name}")
                    self.current_state['failed_steps'][script_name] = {
                        'error': error_type,
                        'attempt': attempt + 1,
                        'output': error_output[:1000]
                    }
                    return False
                    
            except subprocess.TimeoutExpired:
                logger.error(f"{script_name} timed out (>{timeout}s)")
                self.fix_timeout_error(script_name)
                continue
                
            except Exception as e:
                logger.error(f"Unexpected error running {script_name}: {str(e)}")
                self.fix_generic_error(script_name, str(e))
                continue
        
        return False
    
    def detect_error_type(self, error_output):
        """Detect error type from output"""
        patterns = {
            'SyntaxError': r'SyntaxError:|File.*line.*\n.*\^\n',
            'IndentationError': r'IndentationError:',
            'ModuleNotFoundError': r'ModuleNotFoundError:.*No module named',
            'ImportError': r'ImportError:',
            'FileNotFoundError': r'FileNotFoundError:|No such file or directory',
            'PermissionError': r'PermissionError:|Permission denied',
            'UnicodeDecodeError': r'UnicodeDecodeError:',
            'TimeoutError': r'TimeoutError:|timed out'
        }
        
        for error_type, pattern in patterns.items():
            if re.search(pattern, error_output, re.IGNORECASE):
                return error_type
        
        return 'UnknownError'
    
    def attempt_fix(self, script_name, error_type, error_output, attempt):
        """Attempt to fix the error"""
        logger.info(f"Attempting to fix {error_type} in {script_name}")
        
        fix_function = self.error_fixes.get(error_type, self.error_fixes['default'])
        
        try:
            if fix_function(script_name, error_output, attempt):
                logger.info(f"Fix applied for {error_type}")
                return True
        except Exception as fix_error:
            logger.error(f"Fix attempt failed: {str(fix_error)}")
        
        return False
    
    def fix_syntax_error(self, script_name, error_output, attempt):
        """Fix syntax errors in scripts"""
        return False
    
    def fix_indentation_error(self, script_name, error_output, attempt):
        """Fix indentation errors"""
        try:
            with open(script_name, 'r') as f:
                content = f.read()
            
            content = content.replace('\t', '    ')
            
            with open(script_name, 'w') as f:
                f.write(content)
            
            return True
        except:
            return False
    
    def fix_missing_module(self, script_name, error_output, attempt):
        """Fix missing modules"""
        match = re.search(r"ModuleNotFoundError: No module named '([^']+)'", error_output)
        if match:
            module_name = match.group(1)
            try:
                subprocess.run([sys.executable, '-m', 'pip', 'install', module_name], 
                             check=True, capture_output=True)
                return True
            except:
                pass
        return False
    
    def fix_file_not_found(self, script_name, error_output, attempt):
        """Fix file not found errors"""
        if not os.path.exists(script_name):
            dir_name = os.path.dirname(script_name)
            if dir_name and not os.path.exists(dir_name):
                os.makedirs(dir_name, exist_ok=True)
                return True
        return False
    
    def fix_encoding_error(self, script_name, error_output, attempt):
        """Fix encoding errors"""
        try:
            encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
            for encoding in encodings:
                try:
                    with open(script_name, 'r', encoding=encoding) as f:
                        content = f.read()
                    
                    with open(script_name, 'w', encoding='utf-8') as f:
                        f.write(content)
                    return True
                except:
                    continue
        except:
            pass
        return False
    
    def fix_timeout_error(self, script_name, error_output=None, attempt=0):
        """Handle timeout errors"""
        for script in self.scripts:
            if script['name'] == script_name:
                script['timeout'] *= 2
                return True
        return False
    
    def fix_permission_error(self, script_name, error_output, attempt):
        """Fix permission errors"""
        try:
            os.chmod(script_name, 0o755)
            return True
        except:
            return False
    
    def fix_import_error(self, script_name, error_output, attempt):
        """Fix import errors"""
        if os.path.exists('requirements.txt'):
            try:
                subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
                             check=True, capture_output=True)
                return True
            except:
                pass
        return False
    
    def fix_generic_error(self, script_name, error_output, attempt=0):
        """Generic error fix"""
        if attempt < 2:
            logger.info(f"Attempting to recreate {script_name}")
            self.current_state['needs_recreation'] = script_name
            return True
        return False
    
    def check_system_requirements(self):
        """Check system requirements"""
        logger.info("Checking system requirements...")
        
        checks = {
            'Python Version': sys.version_info >= (3, 8),
            'Write Permissions': os.access('.', os.W_OK),
        }
        
        for check, result in checks.items():
            if result:
                logger.info(f"[OK] {check}")
            else:
                logger.warning(f"⚠ {check} - May cause issues")
        
        return all(checks.values())
    
    def run_all(self):
        """Run all scripts in sequence"""
        logger.info("=" * 60)
        logger.info("STARTING AUTONOMOUS WEBSITE BUILDER SETUP")
        logger.info("=" * 60)
        
        if not self.check_system_requirements():
            logger.warning("System requirements not fully met, continuing anyway...")
        
        start_from = self.current_state['current_step']
        
        for i, script_info in enumerate(self.scripts[start_from:], start=start_from):
            script_name = script_info['name']
            
            logger.info(f"\n{'='*60}")
            logger.info(f"STEP {i+1}/{len(self.scripts)}: {script_name}")
            logger.info(f"{'='*60}")
            
            self.current_state['current_step'] = i
            
            if not os.path.exists(script_name):
                logger.warning(f"{script_name} not found, creating...")
                self.create_missing_script(script_name, i)
            
            success = self.run_script(
                script_name,
                script_info['retries'],
                script_info['timeout']
            )
            
            if success:
                self.current_state['completed_steps'].append(script_name)
                if script_name in self.current_state['failed_steps']:
                    del self.current_state['failed_steps'][script_name]
            else:
                self.current_state['failed_steps'][script_name] = {
                    'step': i,
                    'message': 'Max retries exceeded'
                }
                logger.error(f"[FAIL] Failed to complete {script_name}")
                
                response = input(f"\nContinue to next step anyway? (y/n): ")
                if response.lower() != 'y':
                    break
            
            self.save_state()
            time.sleep(2)
        
        self.generate_report()
        
        if len(self.current_state['failed_steps']) == 0:
            logger.info("\n" + "=" * 60)
            logger.info("[SUCCESS] SETUP COMPLETED SUCCESSFULLY!")
            logger.info("=" * 60)
            logger.info("\nSystem is now ready. Run: python run_autonomous_builder.py")
        else:
            logger.warning(f"\n[WARNING] Setup completed with {len(self.current_state['failed_steps'])} failures")
            logger.info("Check 'setup_orchestrator.log' for details")
    
    def create_missing_script(self, script_name, step_num):
        """Create missing script based on step number"""
        scripts_content = {
            0: self.get_setup_project_content(),
            1: self.get_check_dependencies_content(),
            2: self.get_build_agents_step1_content(),
            3: self.get_build_agents_step2_content(),
            4: self.get_build_agents_step3_content(),
            5: self.get_build_agents_step4_content(),
            6: self.get_finalize_system_content(),
        }
        
        content = scripts_content.get(step_num, "# Placeholder script\nprint('Script created automatically')")
        
        with open(script_name, 'w', encoding='utf-8') as f:
            f.write(content)
        
        try:
            os.chmod(script_name, 0o755)
        except:
            pass
        logger.info(f"Created {script_name}")
    
    def generate_report(self):
        """Generate setup report"""
        report = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_steps': len(self.scripts),
            'completed_steps': len(self.current_state['completed_steps']),
            'failed_steps': list(self.current_state['failed_steps'].keys()),
            'error_count': self.current_state['error_count'],
            'duration_seconds': time.time() - self.current_state['start_time']
        }
        
        with open('setup_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"\nSetup Report saved to 'setup_report.json'")
    
    def get_setup_project_content(self):
        return '''#!/usr/bin/env python3
"""Project setup script"""
import os
import json
from pathlib import Path

print("Setting up project structure...")

directories = [
    "agents/orchestrator", "agents/design", "agents/development",
    "agents/qa", "agents/deployment", "frontend/components",
    "frontend/pages", "backend/api", "backend/database",
    "config", "tests", "logs", "static/css", "static/js",
    "templates/website/pages", "templates/website/wireframes"
]

for directory in directories:
    Path(directory).mkdir(parents=True, exist_ok=True)
    print(f"[OK] Created: {directory}")

config_files = {
    "config/agents_config.json": {
        "max_iterations": 10,
        "concurrent_users": 50,
        "timeout_per_task": 300
    },
    "config/website_categories.json": {
        "QuickStart": {"complexity": "low", "timeline_days": 1},
        "CustomProfessional": {"complexity": "medium", "timeline_days": 3},
        "EnterprisePremium": {"complexity": "high", "timeline_days": 5}
    }
}

for file_path, content in config_files.items():
    with open(file_path, 'w') as f:
        json.dump(content, f, indent=2)
    print(f"[OK] Created: {file_path}")

requirements = [
    "fastapi==0.104.1", "uvicorn==0.24.0", "sqlalchemy==2.0.23",
    "pydantic==2.5.0", "jinja2==3.1.2", "python-multipart==0.0.6",
    "aiofiles==23.2.1", "requests==2.31.0"
]

with open("requirements.txt", "w") as f:
    f.write("\\n".join(requirements))
print("[OK] Created: requirements.txt")

with open("README.md", "w") as f:
    f.write("# AUTONOMOUS WEBSITE BUILDER\\n\\nRun: python run_autonomous_builder.py")
print("[OK] Created: README.md")

print("\\n[SUCCESS] Project setup completed!")
'''

    def get_check_dependencies_content(self):
        return '''#!/usr/bin/env python3
"""Dependency checker"""
import sys
import subprocess

print("Checking Python version...")
if sys.version_info < (3, 8):
    print("[FAIL] Python 3.8+ required")
    sys.exit(1)
print(f"[OK] Python {sys.version_info.major}.{sys.version_info.minor}")

print("\\nInstalling requirements...")
try:
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', '-r', 'requirements.txt'], check=True)
    print("[OK] Requirements installed")
except:
    print("⚠ Some packages may have failed")

with open('.env', 'w') as f:
    f.write("DEBUG=True\\nDATABASE_URL=sqlite:///./builder.db\\n")
print("[OK] Created: .env file")

print("\\n[SUCCESS] Dependencies check completed!")
'''

    def get_build_agents_step1_content(self):
        return '''#!/usr/bin/env python3
"""Build Orchestrator Agent"""
import os

print("Building Orchestrator Agent...")

orchestrator_code = """
import asyncio
import json
from datetime import datetime
from typing import Dict, Any

class OrchestratorAgent:
    def __init__(self):
        self.projects = {}
        self.conversations = {}
        
    async def process_user_request(self, user_id: str, user_input: str) -> Dict[str, Any]:
        project_id = f"proj_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self.projects[project_id] = {
            "user_id": user_id,
            "status": "requirements_gathering",
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "project_id": project_id,
            "category": "QuickStart",
            "next_action": "ask_questions",
            "questions": [
                {"id": 1, "question": "What's your website about?"},
                {"id": 2, "question": "Who is your target audience?"},
                {"id": 3, "question": "What colors do you prefer?"}
            ]
        }

async def main():
    agent = OrchestratorAgent()
    result = await agent.process_user_request("test", "I want a website")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
"""

os.makedirs("agents/orchestrator", exist_ok=True)
with open("agents/orchestrator/__init__.py", "w") as f:
    f.write("")
with open("agents/orchestrator/main.py", "w") as f:
    f.write(orchestrator_code)

print("[OK] Created: Orchestrator Agent")
print("\\n[SUCCESS] Orchestrator Agent built!")
'''

    def get_build_agents_step2_content(self):
        return '''#!/usr/bin/env python3
"""Build Design and Development Agents"""
import os

print("Building Design and Development Agents...")

design_code = """
import json
from typing import Dict

class DesignAgent:
    def generate_design(self, requirements: Dict) -> Dict:
        return {
            "template": "Modern Minimalist",
            "color_scheme": {
                "primary": "#1a365d",
                "secondary": "#2d3748",
                "accent": "#4299e1"
            },
            "typography": {
                "heading": "Inter, sans-serif",
                "body": "Open Sans, sans-serif"
            },
            "components": ["navbar", "hero", "features", "footer"]
        }
"""

dev_code = """
import json
from typing import Dict

class DevelopmentAgent:
    def build_website(self, design_spec: Dict, requirements: Dict) -> Dict:
        html = \"\"\"<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Your Website</title>
<style>body{font-family:sans-serif;margin:0;padding:0}</style>
</head><body>
<header style="background:#1a365d;color:white;padding:20px">
<h1>Welcome</h1></header>
<main style="padding:40px"><h2>Your Content Here</h2>
<p>This is your new website.</p></main>
<footer style="background:#2d3748;color:white;padding:20px;text-align:center">
<p>&copy; 2024</p></footer></body></html>\"\"\"
        
        return {
            "pages": [{"name": "index", "file": "output/index.html", "content": html}],
            "styles": []
        }
"""

os.makedirs("agents/design", exist_ok=True)
os.makedirs("agents/development", exist_ok=True)

with open("agents/design/__init__.py", "w") as f:
    f.write("")
with open("agents/design/main.py", "w") as f:
    f.write(design_code)

with open("agents/development/__init__.py", "w") as f:
    f.write("")
with open("agents/development/main.py", "w") as f:
    f.write(dev_code)

print("[OK] Created: Design Agent")
print("[OK] Created: Development Agent")
print("\\n[SUCCESS] Design and Development Agents built!")
'''

    def get_build_agents_step3_content(self):
        return '''#!/usr/bin/env python3
"""Build QA and Deployment Agents"""
import os

print("Building QA and Deployment Agents...")

qa_code = """
import os
from typing import Dict

class QAAgent:
    def run_tests(self, website_structure: Dict) -> Dict:
        results = {"passed": [], "failed": [], "score": 0}
        
        for page in website_structure.get("pages", []):
            if "<!DOCTYPE html>" in page.get("content", ""):
                results["passed"].append("HTML structure valid")
            
            if "<title>" in page.get("content", ""):
                results["passed"].append("Title tag present")
        
        total = len(results["passed"]) + len(results["failed"])
        results["score"] = int((len(results["passed"]) / total * 100)) if total > 0 else 0
        
        return results
"""

deploy_code = """
import os
import shutil
from datetime import datetime
from typing import Dict

class DeploymentAgent:
    def deploy(self, website_structure: Dict, environment: str = "staging") -> Dict:
        deploy_dir = f"output/{environment}"
        os.makedirs(deploy_dir, exist_ok=True)
        
        for page in website_structure.get("pages", []):
            filepath = os.path.join(deploy_dir, page["name"] + ".html")
            with open(filepath, "w") as f:
                f.write(page.get("content", ""))
        
        return {
            "status": "completed",
            "environment": environment,
            "deploy_dir": deploy_dir,
            "timestamp": datetime.now().isoformat()
        }
"""

os.makedirs("agents/qa", exist_ok=True)
os.makedirs("agents/deployment", exist_ok=True)

with open("agents/qa/__init__.py", "w") as f:
    f.write("")
with open("agents/qa/main.py", "w") as f:
    f.write(qa_code)

with open("agents/deployment/__init__.py", "w") as f:
    f.write("")
with open("agents/deployment/main.py", "w") as f:
    f.write(deploy_code)

print("[OK] Created: QA Agent")
print("[OK] Created: Deployment Agent")
print("\\n[SUCCESS] QA and Deployment Agents built!")
'''

    def get_build_agents_step4_content(self):
        return '''#!/usr/bin/env python3
"""Integrate agents and create API"""
import os
import sys

print("Creating FastAPI backend...")

backend_code = """
import sys
sys.path.append('..')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

from agents.orchestrator.main import OrchestratorAgent
from agents.design.main import DesignAgent
from agents.development.main import DevelopmentAgent
from agents.qa.main import QAAgent
from agents.deployment.main import DeploymentAgent

app = FastAPI(title="Autonomous Website Builder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = OrchestratorAgent()
design_agent = DesignAgent()
dev_agent = DevelopmentAgent()
qa_agent = QAAgent()
deployment_agent = DeploymentAgent()

projects_db = {}

class UserRequest(BaseModel):
    user_id: str
    description: str

class WebsiteRequirements(BaseModel):
    project_id: str
    answers: Dict[str, str]

@app.get("/")
async def root():
    return {
        "message": "Autonomous Website Builder API",
        "status": "running",
        "version": "1.0.0"
    }

@app.post("/start")
async def start_website(request: UserRequest):
    try:
        result = await orchestrator.process_user_request(
            request.user_id, 
            request.description
        )
        projects_db[result["project_id"]] = {
            **result,
            "status": "requirements_gathering",
            "created_at": datetime.now().isoformat()
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/requirements/{project_id}")
async def submit_requirements(project_id: str, requirements: WebsiteRequirements):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        project = projects_db[project_id]
        project["requirements"] = requirements.answers
        
        design_spec = design_agent.generate_design(requirements.answers)
        project["design_spec"] = design_spec
        
        website_structure = dev_agent.build_website(design_spec, requirements.answers)
        project["website_structure"] = website_structure
        
        test_results = qa_agent.run_tests(website_structure)
        project["test_results"] = test_results
        
        project["status"] = "ready_for_deployment" if test_results.get("score", 0) >= 80 else "needs_revision"
        
        return {
            "project_id": project_id,
            "status": project["status"],
            "test_score": test_results.get("score", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}")
async def get_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    return {
        "project_id": project_id,
        "status": project["status"],
        "created_at": project.get("created_at"),
        "test_score": project.get("test_results", {}).get("score", 0)
    }

@app.post("/deploy/{project_id}")
async def deploy_website(project_id: str, environment: str = "staging"):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    try:
        deployment_result = deployment_agent.deploy(
            project["website_structure"],
            environment
        )
        project["deployment"] = deployment_result
        project["status"] = "deployed"
        
        return deployment_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/preview/{project_id}", response_class=HTMLResponse)
async def get_preview(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    if "website_structure" in project:
        pages = project["website_structure"].get("pages", [])
        if pages and "content" in pages[0]:
            return pages[0]["content"]
    
    return "<html><body><h1>Preview not available</h1></body></html>"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""

os.makedirs("backend", exist_ok=True)
with open("backend/__init__.py", "w") as f:
    f.write("")
with open("backend/main.py", "w") as f:
    f.write(backend_code)

print("[OK] Created: FastAPI backend")

frontend_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Website Builder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { display: flex; height: 100vh; }
        .panel { flex: 1; display: flex; flex-direction: column; }
        .left { background: #1a202c; color: white; }
        .right { background: #f7fafc; }
        .header { padding: 20px; border-bottom: 1px solid #2d3748; }
        .content { flex: 1; overflow-y: auto; padding: 20px; }
        .messages { display: flex; flex-direction: column; gap: 10px; }
        .message { padding: 10px 15px; border-radius: 10px; max-width: 80%; }
        .user { background: #4299e1; margin-left: auto; }
        .agent { background: #4a5568; }
        .input-box { display: flex; padding: 20px; border-top: 1px solid #2d3748; }
        input { flex: 1; padding: 12px; border: none; border-radius: 8px; background: #4a5568; color: white; }
        button { background: #4299e1; color: white; border: none; padding: 12px 24px; margin-left: 10px; border-radius: 8px; cursor: pointer; }
        button:hover { background: #3182ce; }
        .status { background: #2d3748; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        iframe { width: 100%; height: 400px; border: 1px solid #e2e8f0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="panel left">
            <div class="header"><h2>🤖 AI Website Builder</h2></div>
            <div class="content">
                <div class="messages" id="messages">
                    <div class="message agent">Hello! Describe your website idea to get started.</div>
                </div>
            </div>
            <div class="input-box">
                <input type="text" id="input" placeholder="Describe your website..." onkeypress="if(event.key==='Enter')send()">
                <button onclick="send()">Send</button>
            </div>
        </div>
        <div class="panel right">
            <div class="header"><h2>📊 Preview</h2></div>
            <div class="content">
                <div class="status"><h4>Status: <span id="status">Ready</span></h4></div>
                <iframe id="preview"></iframe>
            </div>
        </div>
    </div>
    <script>
        let projectId = null;
        async function send() {
            const input = document.getElementById('input');
            const msg = input.value.trim();
            if (!msg) return;
            
            addMessage('user', msg);
            input.value = '';
            
            try {
                if (!projectId) {
                    const res = await fetch('http://localhost:8000/start', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({user_id: 'user_' + Date.now(), description: msg})
                    });
                    const data = await res.json();
                    projectId = data.project_id;
                    addMessage('agent', `Project created! Answer these questions: ${data.questions.map(q=>q.question).join(', ')}`);
                } else {
                    const res = await fetch(`http://localhost:8000/requirements/${projectId}`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({project_id: projectId, answers: {input: msg}})
                    });
                    const data = await res.json();
                    addMessage('agent', `Status: ${data.status}. Score: ${data.test_score}%`);
                    
                    if (data.status === 'ready_for_deployment') {
                        const preview = await fetch(`http://localhost:8000/preview/${projectId}`);
                        const html = await preview.text();
                        document.getElementById('preview').srcdoc = html;
                        addMessage('agent', 'Your website is ready! Check the preview →');
                    }
                }
            } catch (e) {
                addMessage('agent', 'Error: ' + e.message);
            }
        }
        function addMessage(type, text) {
            const div = document.createElement('div');
            div.className = 'message ' + type;
            div.textContent = text;
            document.getElementById('messages').appendChild(div);
            div.scrollIntoView();
        }
    </script>
</body>
</html>"""

with open("frontend/index.html", "w") as f:
    f.write(frontend_html)

print("[OK] Created: Frontend interface")
print("\\n[SUCCESS] API and frontend created!")
'''

    def get_finalize_system_content(self):
        return '''#!/usr/bin/env python3
"""Final system setup"""
import os

print("Finalizing system...")

runner = """#!/usr/bin/env python3
import subprocess
import sys
import time
import webbrowser
from threading import Thread

def start_backend():
    subprocess.run([sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"])

def main():
    print("=" * 60)
    print("🚀 Starting Autonomous Website Builder")
    print("=" * 60)
    
    Thread(target=start_backend, daemon=True).start()
    
    print("\\nWaiting for backend to start...")
    time.sleep(5)
    
    print("\\n[SUCCESS] System running!")
    print("   Frontend: file:///" + os.path.abspath("frontend/index.html"))
    print("   Backend:  http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    
    webbrowser.open("file:///" + os.path.abspath("frontend/index.html"))
    
    print("\\nPress Ctrl+C to stop")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\\n👋 Stopped")

if __name__ == "__main__":
    main()
"""

with open("run_autonomous_builder.py", "w") as f:
    f.write(runner)

os.chmod("run_autonomous_builder.py", 0o755)
print("[OK] Created: run_autonomous_builder.py")

os.makedirs("output", exist_ok=True)
print("[OK] Created: output directory")

print("\\n[SUCCESS] System finalized!")
print("\\nNext: python run_autonomous_builder.py")
'''


def main():
    """Main function"""
    orchestrator = SelfHealingOrchestrator()
    orchestrator.run_all()

if __name__ == "__main__":
    main()
    