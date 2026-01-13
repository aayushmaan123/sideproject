# 🚀 AI Website Builder

A production-ready SaaS platform for building professional websites through conversational AI. This repository contains a clean, secure, and scalable FastAPI backend foundation.

## 📍 Current Status: Stage 1 Complete

This project is being built in stages, following a disciplined approach to ensure production quality at every step.

### ✅ Completed Stages

**Stage 0: Product & Architecture Guardrails** ✓
- Removed all unsafe behaviors (self-modifying code, auto-installation, etc.)
- Established clear architectural principles
- Created comprehensive documentation

**Stage 1: Stable Backend Foundation** ✓
- Production-ready FastAPI application
- Environment-based configuration
- Centralized logging system
- Exception handling framework
- Health check endpoints
- Clean project structure

### 🔜 Upcoming Stages

**Stage 2**: Conversational AI Integration  
**Stage 3**: Design Engine  
**Stage 4**: Code Generation  
**Stage 5**: Database & Persistence  
**Stage 6**: Authentication & Authorization  
**Stage 7**: Deployment & DevOps  

See `ARCHITECTURE.md` for detailed roadmap.

## 🎯 Project Vision

Enable anyone to create professional websites through natural conversation with AI. The system uses specialized AI agents to:
- Gather requirements through conversation
- Design beautiful, modern websites
- Generate production-ready code
- Test and validate the output
- Deploy to hosting platforms

**Current Focus**: Building a solid, secure foundation before adding AI capabilities.

## 🏗 What's Included (Stage 1)

### Production-Ready Backend
- ✅ FastAPI application with proper structure
- ✅ Pydantic-based configuration management
- ✅ Structured logging with timestamps
- ✅ Custom exception handling
- ✅ CORS middleware configuration
- ✅ Health check endpoints
- ✅ Auto-generated API documentation

### Clean Architecture
- Clear separation of concerns
- Service layer for business logic
- Core modules for cross-cutting concerns
- Extensible structure for future features

### Documentation
- Architecture documentation (`ARCHITECTURE.md`)
- Development guidelines (`DEVELOPMENT_RULES.md`)
- This README
- Code docstrings throughout

### Safety & Security
- No self-modifying code
- No runtime file generation
- No auto-installation logic
- No hardcoded secrets
- Input validation ready
- Proper error handling

## 🚫 What's Intentionally Missing

These features will be added in future stages:

- ❌ **AI Integration** - Coming in Stage 2
- ❌ **Database** - Coming in Stage 5
- ❌ **Authentication** - Coming in Stage 6
- ❌ **Background Workers** - Coming in Stage 4
- ❌ **Frontend** - Coming in Stage 2
- ❌ **Deployment Config** - Coming in Stage 7

This is **by design**. We're building a solid foundation first.

## 📋 Prerequisites

- **Python 3.8+** (3.9+ recommended)
- **pip** (Python package manager)
- **Virtual environment** (venv or similar)

## 🛠 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aayushmaan123/sideproject.git
cd sideproject
```

### 2. Create Virtual Environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional for local dev)
# The defaults work fine for local development
```

## 🚀 Running the Application

### Start the Server

```bash
uvicorn app.main:app --reload
```

The `--reload` flag enables auto-reload on code changes (development only).

**Alternative:**
```bash
python -m app.main
```

### Verify It's Running

The server starts on `http://127.0.0.1:8000`

**Test the endpoints:**

1. **Root endpoint:**
   ```bash
   curl http://127.0.0.1:8000/
   ```
   
   Response:
   ```json
   {
     "message": "Welcome to AI Website Builder",
     "version": "0.1.0",
     "stage": "Stage 1: Stable Backend Foundation",
     "status": "operational",
     "docs": "/docs",
     "health": "/health"
   }
   ```

2. **Health check:**
   ```bash
   curl http://127.0.0.1:8000/health
   ```
   
   Response:
   ```json
   {
     "status": "healthy",
     "environment": "development",
     "app_name": "AI Website Builder",
     "timestamp": "2024-01-15T10:30:00.000000"
   }
   ```

3. **API Documentation:**
   - Swagger UI: http://127.0.0.1:8000/docs
   - ReDoc: http://127.0.0.1:8000/redoc

## 📁 Project Structure

```
sideproject/
├── app/                          # Main application package
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entry point
│   ├── api/                      # API endpoints
│   │   ├── __init__.py
│   │   └── health.py             # Health check routes
│   ├── core/                     # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py             # Configuration management
│   │   ├── logging.py            # Logging setup
│   │   └── exceptions.py         # Custom exceptions
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   └── orchestrator.py       # Orchestrator (placeholder)
│   ├── models/                   # Database models (empty - Stage 5)
│   │   └── __init__.py
│   ├── schemas/                  # Pydantic schemas (empty - Stage 2+)
│   │   └── __init__.py
│   └── utils/                    # Utility functions
│       └── __init__.py
├── master_orchestrator.py        # Legacy prototype (kept for reference)
├── requirements.txt              # Python dependencies
├── pyproject.toml               # Project metadata
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── ARCHITECTURE.md              # Architecture documentation
└── DEVELOPMENT_RULES.md         # Development guidelines
```

## ⚙️ Configuration

Configuration is managed through environment variables. Create a `.env` file or set environment variables:

```bash
# Environment: development, staging, production
ENV=development

# Debug mode
DEBUG=true

# Application name
APP_NAME=AI Website Builder

# CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
```

See `.env.example` for all available options.

## 🧪 Testing (Future)

Testing infrastructure will be added in Stage 2. Planned:
- Unit tests with pytest
- Integration tests for API endpoints
- Test coverage reporting
- CI/CD integration

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and architectural principles
- **[DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)** - Coding standards and guidelines
- **API Docs** - Auto-generated at `/docs` when server is running

## 🔐 Security

Current security measures (Stage 1):
- ✅ Input validation via Pydantic
- ✅ CORS configuration
- ✅ Structured error handling
- ✅ No sensitive data in responses
- ✅ No unsafe code behaviors

Future security enhancements:
- 🔜 Authentication & authorization (Stage 6)
- 🔜 Rate limiting (Stage 6)
- 🔜 SQL injection prevention (Stage 5)
- 🔜 XSS protection (Stage 3)
- 🔜 Secrets management (Stage 6)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Read `DEVELOPMENT_RULES.md` for coding standards
2. Create a feature branch
3. Make your changes
4. Write tests (when testing infrastructure exists)
5. Update documentation
6. Submit a pull request

## 📄 License

[Specify your license here - e.g., MIT, Apache 2.0]

## 🐛 Known Issues

None currently. This is a clean Stage 1 implementation.

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review `ARCHITECTURE.md` for design decisions

## 🎓 Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **Pydantic**: https://docs.pydantic.dev/
- **Python Async**: https://docs.python.org/3/library/asyncio.html

## 🙏 Acknowledgments

Built with:
- **FastAPI** - Modern, fast web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📈 Roadmap Timeline (Estimated)

- ✅ **Stage 0-1**: Foundation (Complete)
- 🔜 **Stage 2**: AI Integration (4-6 weeks)
- 🔜 **Stage 3**: Design Engine (3-4 weeks)
- 🔜 **Stage 4**: Code Generation (4-6 weeks)
- 🔜 **Stage 5**: Database (2-3 weeks)
- 🔜 **Stage 6**: Auth (2-3 weeks)
- 🔜 **Stage 7**: Deployment (2-3 weeks)

## 🎯 Next Steps

After setting up:
1. ✅ Verify the application runs successfully
2. ✅ Test the `/` and `/health` endpoints
3. ✅ Explore the auto-generated docs at `/docs`
4. ✅ Read `ARCHITECTURE.md` to understand the design
5. ✅ Review `DEVELOPMENT_RULES.md` before contributing
6. 🔜 Wait for Stage 2 to add AI capabilities

---

**Note**: The `master_orchestrator.py` file is the original prototype and is kept for reference only. It demonstrates the unsafe behaviors that have been removed. The new codebase in the `app/` directory is the production-ready version.

**Welcome to the AI Website Builder!** 🎉
