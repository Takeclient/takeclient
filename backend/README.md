# CRM Backend with AI Agents

A powerful CRM backend built with FastAPI and integrated AI agents for automated customer interactions, lead management, and intelligent business insights.

## 🚀 Features

- **FastAPI Framework**: High-performance, easy-to-use, fast to code
- **AI Agent Integration**: OpenAI, Anthropic Claude, and other LLM providers
- **Authentication & Authorization**: JWT-based security
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **Background Tasks**: Celery with Redis
- **Vector Database**: Pinecone and ChromaDB support
- **Real-time Features**: WebSocket support
- **API Documentation**: Auto-generated with Swagger/OpenAPI
- **Testing**: Comprehensive test suite with pytest
- **Code Quality**: Black, isort, flake8, and mypy

## 🛠️ Tech Stack

- **Python 3.11+**
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching and message broker
- **Celery** - Background tasks
- **OpenAI/Anthropic** - AI models
- **LangChain** - AI framework
- **Pinecone/ChromaDB** - Vector databases
- **Uvicorn** - ASGI server

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+**
- **uv** (Python package manager)
- **PostgreSQL**
- **Redis**

### Installing uv (Python Package Manager)

```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Via pip
pip install uv
```

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
# Install dependencies using uv
uv sync

# Or install with development dependencies
uv sync --dev
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configurations
nano .env
```

### 4. Database Setup

```bash
# Start PostgreSQL and Redis services
# macOS with Homebrew:
brew services start postgresql
brew services start redis

# Ubuntu/Debian:
sudo systemctl start postgresql
sudo systemctl start redis

# Create database
createdb crm_db
createdb crm_test_db
```

### 5. Run the Application

```bash
# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Run with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or run directly
python app/main.py
```

### 6. Access the API

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Configuration settings
│   │   ├── security.py        # Security utilities
│   │   └── database.py        # Database configuration
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py         # Main API router
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py    # Authentication endpoints
│   │           ├── users.py   # User management
│   │           └── agents.py  # AI agents endpoints
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   ├── agents/                # AI agent implementations
│   └── utils/                 # Utility functions
├── tests/                     # Test files
├── alembic/                   # Database migrations
├── .env.example              # Environment template
├── pyproject.toml            # Project configuration
└── README.md                 # This file
```

## 🤖 AI Agents

The backend includes several pre-configured AI agents:

### Available Agents

1. **Customer Support Agent**
   - Handles customer inquiries
   - Automated ticket resolution
   - 24/7 support capabilities

2. **Sales Agent**
   - Lead qualification
   - Product recommendations
   - Sales process automation

3. **Data Analysis Agent**
   - Business insights
   - Report generation
   - Trend analysis

### Agent Configuration

```python
# Example agent configuration
{
    "name": "Customer Support Agent",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 500,
    "system_prompt": "You are a helpful customer support agent..."
}
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/crm_db

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Security
SECRET_KEY=your_secret_key_here

# Redis
REDIS_URL=redis://localhost:6379/0
```

### Development vs Production

The application automatically detects the environment based on the `ENVIRONMENT` variable:

- `development`: Debug mode, auto-reload
- `production`: Optimized settings, logging

## 🧪 Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test file
uv run pytest tests/test_agents.py

# Run with verbose output
uv run pytest -v
```

## 🔍 Code Quality

```bash
# Format code
uv run black app/
uv run isort app/

# Lint code
uv run flake8 app/
uv run mypy app/

# Pre-commit hooks
uv run pre-commit install
uv run pre-commit run --all-files
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/` - List all users
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users/` - Create user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### AI Agents
- `GET /api/v1/agents/` - List all agents
- `GET /api/v1/agents/{id}` - Get agent by ID
- `POST /api/v1/agents/` - Create agent
- `POST /api/v1/agents/{id}/chat` - Chat with agent
- `PUT /api/v1/agents/{id}` - Update agent
- `DELETE /api/v1/agents/{id}` - Delete agent

## 🚀 Deployment

### Using Docker

```bash
# Build image
docker build -t crm-backend .

# Run container
docker run -p 8000:8000 crm-backend
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔄 Background Tasks

The application uses Celery for background tasks:

```bash
# Start Celery worker
celery -A app.worker worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.worker beat --loglevel=info

# Monitor tasks
celery -A app.worker flower
```

## 📝 Database Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Downgrade
alembic downgrade -1
```

## 🎯 Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/new-agent
   ```

2. **Install dependencies**
   ```bash
   uv sync --dev
   ```

3. **Activate virtual environment**
   ```bash
   source .venv/bin/activate
   ```

4. **Make changes and test**
   ```bash
   uv run pytest
   uv run black app/
   uv run mypy app/
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add new agent feature"
   git push origin feature/new-agent
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation at `/docs`
- Review the test examples in `tests/`

## 🔮 Roadmap

- [ ] Advanced AI agent orchestration
- [ ] Multi-tenant support
- [ ] Real-time analytics dashboard
- [ ] Voice assistant integration
- [ ] Advanced vector search capabilities
- [ ] Custom model fine-tuning
- [ ] Automated testing with AI agents

---

**Happy coding! 🚀** 