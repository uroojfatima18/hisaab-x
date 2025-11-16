## 🧭 General Rules
- Follow clear, simple, and maintainable coding practices.
- Provide short explanations unless asked for detailed ones.
- Always ask before making changes that can affect multiple files.
- When unsure about user intent, ask a clarifying question.

---

## 🛠️ Coding Style (Generic)
- Prefer readability over complexity.
- Use descriptive variable, function, and file names.
- Include comments when logic isn’t obvious.
- Keep functions small and modular.
- Follow language-idiomatic conventions (Pythonic, Go-friendly, JS-idiomatic, etc.)

# Personal Finance Tracker CLI

## Project Overview
Professional CLI application for tracking expenses, income, budgets, and generating financial insights - similar to fintech applications.

## Core Features
- Transaction management (expenses & income)
- Category-based budgeting with alerts
- Financial analytics and health scoring
- Monthly reports and insights
- Data export (CSV/JSON)
- Simple streamlit dashboard

## Tech Stack
- **Language**: Python 3.11+
- **CLI** Framework: Questionary (interactive select lists)
- **UI Library**: Rich (tables, panels, progress bars)
- **Storage**: Plain text files (no database)
- **Package Manager**: UV

## Project Structure
```
finance-tracker/
├── main.py                    # Entry point with menu loop
├── database/
│   ├── transactions.txt       # All transactions
│   └── budgets.txt           # Budget allocations
└── features/
    ├── transactions/
    │   ├── GEMINI.md
    │   └── transactions.py
    ├── budgets/
    │   ├── GEMINI.md
    │   └── budgets.py
    └── analytics/
        ├── GEMINI.md
        └── analytics.py
    ...
```

## Critical Money Handling Rule
**ALWAYS store monetary values as integers (paisa/cents) to avoid floating-point errors.**

```python
# Correct approach:
amount_paisa = 1250      # Store Rs 12.50 as 1250 paisa
display = amount / 100   # Display as Rs 12.50

# Wrong approach:
amount = 12.50           # Never use float for money!
```

## Transaction Categories
**Expenses**: Food, Transport, Shopping, Bills, Entertainment, Health, Other
**Income**: Salary, Freelance, Business, Investment, Gift, Other

# CLI Interaction
This repository uses questionary for dropdown-style selections in the terminal. The UI visual pieces (tables, panels) use Rich.