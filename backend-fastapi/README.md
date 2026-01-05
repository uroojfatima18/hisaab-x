# HissabX FastAPI Backend

This is a FastAPI backend implementation for the HissabX finance tracking application. It replaces the original Next.js API routes with a standalone Python backend.

## Features

- User authentication (signup, login, logout, get current user)
- User profile management
- Settings management
- Transaction management (create, read, update, delete)
- Budget management (create, read, update, delete)
- PostgreSQL database with SQLAlchemy ORM

## Prerequisites

- Python 3.8+
- PostgreSQL database
- Node.js (for the frontend)

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` to include your database URL and JWT secret.

4. Set up the database:
```bash
# Make sure your PostgreSQL database is running
# The application will create tables automatically on startup
```

## Running the Backend

1. Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET/PUT /api/user` - User profile management
- `GET/PUT /api/settings` - User settings
- `GET/POST/DELETE /api/transactions` - Transaction management
- `GET/POST/DELETE /api/transactions/{id}` - Individual transaction
- `GET/POST/DELETE /api/budgets` - Budget management
- `DELETE /api/budgets/{category}` - Delete budget by category

## Frontend Integration

The frontend (Next.js application) should be configured to make requests to the FastAPI backend. By default, the frontend looks for the backend at `http://localhost:8000/api`.

## Environment Variables

- `DATABASE_URL` - PostgreSQL database connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_ALGORITHM` - Algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time (default: 10080 minutes = 7 days)

## Database Models

The backend uses SQLAlchemy ORM with the following models:
- User: Stores user account information
- UserSettings: Stores user preferences
- Transaction: Stores financial transactions
- Budget: Stores budget information

## Running Tests

To run the basic functionality test:
```bash
python test_backend.py
```

Note: Make sure the FastAPI server is running before executing the test.