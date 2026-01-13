# Development Rules & Guidelines

## 🎯 Purpose

This document defines the rules, standards, and best practices for developing the AI Website Builder. Following these guidelines ensures code quality, security, and maintainability.

## ✅ What IS Allowed

### Code Practices
- ✅ Type hints on all functions and methods
- ✅ Comprehensive docstrings (Google or NumPy style)
- ✅ Async/await for I/O operations
- ✅ Pydantic models for data validation
- ✅ Environment-based configuration
- ✅ Structured logging with appropriate levels
- ✅ Proper exception handling with custom exceptions
- ✅ Unit tests for new functionality
- ✅ Integration tests for API endpoints
- ✅ Clear separation of concerns

### Development Workflow
- ✅ Feature branches for new work
- ✅ Pull requests for code review
- ✅ Descriptive commit messages
- ✅ Running tests before committing
- ✅ Updating documentation with code changes
- ✅ Using virtual environments
- ✅ Installing dependencies via requirements.txt

### Adding Dependencies
- ✅ Well-maintained packages with active development
- ✅ Packages with good documentation
- ✅ Checking for security vulnerabilities
- ✅ Adding to requirements.txt with version pins
- ✅ Documenting why the dependency is needed

### Configuration
- ✅ Environment variables for configuration
- ✅ .env files for local development (not committed)
- ✅ .env.example for documentation
- ✅ Pydantic Settings for validation
- ✅ Different configs for dev/staging/prod

## 🚫 What is FORBIDDEN

### Unsafe Behaviors
- ❌ **Self-modifying code** - Scripts that modify their own source
- ❌ **Auto-creating Python files at runtime** - Dynamic file generation
- ❌ **Auto `pip install` at runtime** - Installing packages during execution
- ❌ **Arbitrary `chmod` calls** - Changing file permissions programmatically
- ❌ **Interactive `input()` in backend** - No blocking user input in services
- ❌ **Executing arbitrary code** - No `eval()`, `exec()`, or similar
- ❌ **Shell injection vulnerabilities** - Careful with subprocess calls
- ❌ **SQL injection** - Always use parameterized queries
- ❌ **Hardcoded secrets** - No API keys, passwords in code
- ❌ **Committing .env files** - Keep secrets out of git

### Code Smells
- ❌ **God objects** - Classes that do too much
- ❌ **Tight coupling** - Components too dependent on each other
- ❌ **Magic numbers** - Use named constants
- ❌ **Silent failures** - Always log errors
- ❌ **Ignoring exceptions** - Handle or propagate, don't swallow
- ❌ **Mutable default arguments** - Use None and create in function
- ❌ **Global state** - Avoid module-level mutable state
- ❌ **Wildcard imports** - No `from module import *`

### Development Practices
- ❌ **Committing directly to main** - Use feature branches
- ❌ **Large PRs** - Keep changes focused and reviewable
- ❌ **Commented-out code** - Remove it, use git history
- ❌ **TODO without tickets** - Create issues for follow-ups
- ❌ **Skipping tests** - Write tests for new functionality
- ❌ **Force pushing** - Preserve git history
- ❌ **Working in production** - Test locally first

## 📝 Code Standards

### Python Style Guide
Follow **PEP 8** with these specifics:

```python
# Line length: 100 characters max
# Indentation: 4 spaces (no tabs)
# Quotes: Double quotes for strings (consistent)
# Imports: Grouped and sorted (stdlib, third-party, local)

# Example function with proper style:
from typing import List, Optional

async def process_user_request(
    user_id: str,
    request_data: dict,
    timeout: Optional[int] = 30
) -> List[str]:
    """
    Process a user request and return results.
    
    Args:
        user_id: Unique identifier for the user
        request_data: Dictionary containing request parameters
        timeout: Optional timeout in seconds (default: 30)
        
    Returns:
        List of processed result strings
        
    Raises:
        ValidationException: If request_data is invalid
        ServiceException: If processing fails
    """
    # Implementation here
    pass
```

### Naming Conventions

```python
# Variables and functions: snake_case
user_name = "John"
def calculate_total(): pass

# Classes: PascalCase
class UserService: pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRIES = 3
API_BASE_URL = "https://api.example.com"

# Private attributes/methods: _leading_underscore
def _internal_helper(): pass
self._private_data = {}

# Protected (convention): Single underscore
def _protected_method(): pass
```

### Documentation

Every module, class, and function must have a docstring:

```python
"""
Module docstring describing the purpose.

This module handles user authentication and session management.
"""

class AuthService:
    """
    Service for handling user authentication.
    
    This class provides methods for login, logout, and token validation.
    It uses JWT tokens for stateless authentication.
    """
    
    async def authenticate(self, username: str, password: str) -> str:
        """
        Authenticate a user and return a JWT token.
        
        Args:
            username: User's username
            password: User's password (will be hashed)
            
        Returns:
            JWT token string
            
        Raises:
            ValidationException: If credentials are invalid
        """
        pass
```

### Type Hints

Always use type hints:

```python
from typing import List, Dict, Optional, Union, Any

# Simple types
def get_user_name(user_id: int) -> str:
    pass

# Optional types
def find_user(email: str) -> Optional[User]:
    pass

# Collections
def get_user_ids() -> List[int]:
    pass

def get_user_data() -> Dict[str, Any]:
    pass

# Union types
def process_input(data: Union[str, int]) -> bool:
    pass
```

### Error Handling

```python
# Good: Specific exception handling
try:
    result = await process_data(input)
except ValidationException as e:
    logger.error(f"Validation failed: {e}")
    raise
except ServiceException as e:
    logger.error(f"Service error: {e}")
    # Handle or transform the exception
    raise HTTPException(status_code=500, detail="Processing failed")

# Bad: Bare except
try:
    result = await process_data(input)
except:  # ❌ Too broad
    pass  # ❌ Silent failure
```

### Logging

```python
from app.core.logging import get_logger

logger = get_logger(__name__)

# Use appropriate log levels
logger.debug("Detailed debugging information")
logger.info("General informational messages")
logger.warning("Warning messages for potential issues")
logger.error("Error messages for failures")
logger.critical("Critical issues requiring immediate attention")

# Include context in logs
logger.info(f"Processing request for user_id={user_id}")
logger.error(f"Failed to process order {order_id}: {error}", exc_info=True)
```

## 🧪 Testing Guidelines

### Test Structure
```python
# tests/test_services/test_orchestrator.py

import pytest
from app.services.orchestrator import OrchestratorService

@pytest.fixture
def orchestrator():
    """Fixture providing an orchestrator instance."""
    return OrchestratorService()

class TestOrchestratorService:
    """Tests for OrchestratorService."""
    
    @pytest.mark.asyncio
    async def test_process_request_returns_dict(self, orchestrator):
        """Test that process_request returns a dictionary."""
        result = await orchestrator.process_request("test input")
        assert isinstance(result, dict)
        assert "status" in result
```

### Testing Principles
- ✅ One test, one assertion (when possible)
- ✅ Descriptive test names
- ✅ Use fixtures for setup
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ✅ Keep tests fast
- ✅ Tests should be independent

## 🔐 Security Guidelines

### Input Validation
```python
# Use Pydantic for validation
from pydantic import BaseModel, Field, validator

class UserInput(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    
    @validator('email')
    def email_must_be_lowercase(cls, v):
        return v.lower()
```

### Secrets Management
```python
# Good: Load from environment
from app.core.config import settings

api_key = settings.API_KEY

# Bad: Hardcoded
api_key = "sk-1234567890"  # ❌ Never do this
```

### SQL Safety (Future)
```python
# Good: Parameterized query
query = "SELECT * FROM users WHERE email = :email"
result = await database.fetch_one(query, {"email": user_email})

# Bad: String concatenation
query = f"SELECT * FROM users WHERE email = '{user_email}'"  # ❌ SQL injection risk
```

## 📦 Dependency Management

### Adding New Dependencies

1. **Research**: Check the package
   - Is it actively maintained?
   - Does it have good documentation?
   - Are there security vulnerabilities?
   - What's the license?

2. **Install**: Add to requirements.txt
   ```bash
   pip install package-name==1.2.3
   pip freeze | grep package-name >> requirements.txt
   ```

3. **Document**: Comment why it's needed
   ```txt
   # API client for external service
   httpx==0.25.1
   ```

4. **Test**: Ensure it works in your environment

### Version Pinning
- ✅ Pin exact versions in requirements.txt
- ✅ Use version ranges only when necessary
- ✅ Regularly update dependencies
- ✅ Test after updates

## 🔄 Git Workflow

### Branch Naming
```
feature/add-user-authentication
bugfix/fix-login-error
hotfix/security-patch
refactor/improve-error-handling
```

### Commit Messages
```
# Good commit messages
Add user authentication endpoint
Fix validation error in health check
Refactor logging configuration for clarity
Update documentation for API endpoints

# Bad commit messages
fix bug          # ❌ Not descriptive
WIP             # ❌ Don't commit WIP
asdf            # ❌ Meaningless
```

### Pull Request Guidelines
- Clear title describing the change
- Description explaining what and why
- Link to related issues
- Screenshots for UI changes
- Checklist of completed tasks
- Request reviews from team members

## 🚦 Pre-commit Checklist

Before committing code:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No hardcoded secrets
- [ ] Type hints added
- [ ] Docstrings written
- [ ] No commented-out code
- [ ] Imports cleaned up
- [ ] Logging added where appropriate

## 🎓 Learning Resources

- **Python**: https://docs.python.org/3/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Pydantic**: https://docs.pydantic.dev/
- **Async Python**: https://realpython.com/async-io-python/
- **Testing**: https://docs.pytest.org/
- **Type Hints**: https://mypy.readthedocs.io/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following these rules
4. Write/update tests
5. Update documentation
6. Submit a pull request
7. Address review feedback

## 📞 Getting Help

- Check documentation first
- Search existing issues
- Ask in team chat
- Create a detailed issue if needed

---

**Remember**: These rules exist to maintain code quality, security, and team productivity. When in doubt, ask for clarification rather than guessing.
