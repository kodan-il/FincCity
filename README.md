# FincCity
FincCity is an abbreviation of Financial City. This project idea was formed to fulfill a Master Degree projects theme called "Social Simulacra". This project main goal is to create a series of LLM Agents that able to simulate the behavior of human in a stock market.

For early installation on this project, we will divide into 2 installation:

## Backend Installation

The backend uses Python with FastAPI, Pydantic, and OpenAI integration.

### Prerequisites
- Python 3.8 or higher installed

### Installation Steps

1. **Navigate to the backend directory:**
   ```bash
   cd src/main/backend
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv myenv
   ```

3. **Activate the virtual environment:**
   ```bash
   # On macOS/Linux
   source myenv/bin/activate
   
   # On Windows
   myenv\Scripts\activate
   ```

4. **Upgrade pip:**
   ```bash
   pip install --upgrade pip
   ```

5. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Backend Dependencies
The following packages will be installed:
- **Pydantic** - Data validation using Python type hints
- **FastAPI** - Modern web framework for building APIs
- **OpenAI** - Integration with OpenAI LLM services
- **python-dotenv** - Load environment variables from .env files

### Verify Installation
```bash
pip list
```

### Run Development Server
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc`

The `--reload` flag enables auto-restart on code changes during development.

---

## Frontend Installation

The frontend is built with React, TypeScript, Vite, and Tailwind CSS.

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd src/main/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm list
   ```

### Frontend Dependencies
The following packages will be installed:
- **React 19** - UI library
- **React-DOM** - DOM rendering for React
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **D3.js** - Data visualization library
- **ESLint** - Code quality and linting

### Data Visualization with D3.js

D3.js is used for creating interactive charts and visualizations for market data:
- **Market Charts** (`components/charts/MarketCharts.tsx`) - Display stock prices, trends, and market movements
- Real-time data visualization
- Interactive elements for user exploration

### Run Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default port)

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

---

## Quick Start

After completing both installations, you can start development:

### Terminal 1 - Backend
```bash
cd src/main/backend
source myenv/bin/activate
uvicorn main:app --reload --port 8000
```

Backend API: `http://localhost:8000`

### Terminal 2 - Frontend
```bash
cd src/main/frontend
npm run dev
```

Frontend: `http://localhost:5173`