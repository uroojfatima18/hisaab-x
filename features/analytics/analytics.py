import datetime
from collections import defaultdict
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.bar import Bar

# Assuming these paths based on the project structure
TRANSACTIONS_FILE = "database/transactions.txt"
BUDGET_FILE = "database/budget.txt"

console = Console()

def load_transactions():
    transactions = []
    try:
        with open(TRANSACTIONS_FILE, "r") as f:
            for line in f:
                parts = line.strip().split(",")
                if len(parts) == 6:
                    try:
                        # Date, Type, Category, Amount (paisa), Description, ID
                        transactions.append({
                            "date": datetime.datetime.strptime(parts[0], "%Y-%m-%d").date(),
                            "type": parts[1],
                            "category": parts[2],
                            "amount": int(parts[3]),  # Storing as paisa/cents
                            "description": parts[4],
                            "id": parts[5]
                        })
                    except ValueError:
                        console.print(f"[red]Skipping malformed transaction line: {line.strip()}[/red]")
                else:
                    console.print(f"[red]Skipping malformed transaction line: {line.strip()}[/red]")
    except FileNotFoundError:
        console.print(f"[yellow]No transactions found at {TRANSACTIONS_FILE}. Starting fresh.[/yellow]")
    return transactions

def load_budgets():
    budgets = {}
    try:
        with open(BUDGET_FILE, "r") as f:
            for line in f:
                parts = line.strip().split(",")
                if len(parts) == 2:
                    try:
                        budgets[parts[0]] = int(parts[1]) # Category: Amount (paisa)
                    except ValueError:
                        console.print(f"[red]Skipping malformed budget line: {line.strip()}[/red]")
                else:
                    console.print(f"[red]Skipping malformed budget line: {line.strip()}[/red]")
    except FileNotFoundError:
        console.print(f"[yellow]No budget found at {BUDGET_FILE}.[/yellow]")
    return budgets

def get_transactions_for_month(transactions, year, month):
    return [t for t in transactions if t["date"].year == year and t["date"].month == month]

def get_current_month_and_year():
    today = datetime.date.today()
    return today.year, today.month

def get_previous_month_and_year(year, month):
    first_day_current_month = datetime.date(year, month, 1)
    last_day_previous_month = first_day_current_month - datetime.timedelta(days=1)
    return last_day_previous_month.year, last_day_previous_month.month

def display_spending_analysis(transactions, budgets):
    console.print(Panel("[bold blue]📊 Spending Analysis[/bold blue]", expand=False))

    current_year, current_month = get_current_month_and_year()
    prev_year, prev_month = get_previous_month_and_year(current_year, current_month)

    current_month_transactions = get_transactions_for_month(transactions, current_year, current_month)
    prev_month_transactions = get_transactions_for_month(transactions, prev_year, prev_month)

    current_month_expenses = [t for t in current_month_transactions if t["type"] == "expense"]
    prev_month_expenses = [t for t in prev_month_transactions if t["type"] == "expense"]

    total_current_expenses = sum(t["amount"] for t in current_month_expenses)
    total_prev_expenses = sum(t["amount"] for t in prev_month_expenses)

    console.print(f"[bold]Current Month ({current_year}-{current_month:02d}) Expenses:[/bold] [red]-Rs {total_current_expenses / 100:.2f}[/red]")
    console.print(f"[bold]Previous Month ({prev_year}-{prev_month:02d}) Expenses:[/bold] [red]-Rs {total_prev_expenses / 100:.2f}[/red]")

    if total_prev_expenses > 0:
        change = ((total_current_expenses - total_prev_expenses) / total_prev_expenses) * 100
        if change > 0:
            console.print(f"[bold]Change from last month:[/bold] [red]+{change:.2f}%[/red]")
        else:
            console.print(f"[bold]Change from last month:[/bold] [green]{change:.2f}%[/green]")
    else:
        console.print("[bold]Change from last month:[/bold] N/A (No expenses last month)")

    # Category breakdown
    category_spending = defaultdict(int)
    for expense in current_month_expenses:
        category_spending[expense["category"]] += expense["amount"]

    console.print("\n[bold]Spending by Category (Current Month):[/bold]")
    if category_spending:
        total_spending = sum(category_spending.values())
        sorted_categories = sorted(category_spending.items(), key=lambda item: item[1], reverse=True)

        for category, amount in sorted_categories:
            percentage = (amount / total_spending) * 100
            console.print(f"- {category}: Rs {amount / 100:.2f} ({percentage:.2f}%)")

        console.print("\n[bold]Top 3 Spending Categories:[/bold]")
        for i, (category, amount) in enumerate(sorted_categories[:3]):
            console.print(f"{i+1}. {category}: Rs {amount / 100:.2f}")
    else:
        console.print("No expenses recorded for the current month.")

    # Average daily expense
    days_in_month = (datetime.date(current_year, current_month % 12 + 1, 1) - datetime.date(current_year, current_month, 1)).days
    average_daily_expense = total_current_expenses / days_in_month if days_in_month > 0 else 0
    console.print(f"\n[bold]Average Daily Expense (Current Month):[/bold] [red]Rs {average_daily_expense / 100:.2f}[/red]")


def display_income_analysis(transactions):
    console.print(Panel("[bold green]💰 Income Analysis[/bold green]", expand=False))

    current_year, current_month = get_current_month_and_year()
    prev_year, prev_month = get_previous_month_and_year(current_year, current_month)

    current_month_transactions = get_transactions_for_month(transactions, current_year, current_month)
    prev_month_transactions = get_transactions_for_month(transactions, prev_year, prev_month)

    current_month_income = [t for t in current_month_transactions if t["type"] == "income"]
    prev_month_income = [t for t in prev_month_transactions if t["type"] == "income"]

    total_current_income = sum(t["amount"] for t in current_month_income)
    total_prev_income = sum(t["amount"] for t in prev_month_income)

    console.print(f"[bold]Current Month ({current_year}-{current_month:02d}) Income:[/bold] [green]+Rs {total_current_income / 100:.2f}[/green]")
    console.print(f"[bold]Previous Month ({prev_year}-{prev_month:02d}) Income:[/bold] [green]+Rs {total_prev_income / 100:.2f}[/green]")

    if total_prev_income > 0:
        change = ((total_current_income - total_prev_income) / total_prev_income) * 100
        if change > 0:
            console.print(f"[bold]Change from last month:[/bold] [green]+{change:.2f}%[/green]")
        else:
            console.print(f"[bold]Change from last month:[/bold] [red]{change:.2f}%[/red]")
    else:
        console.print("[bold]Change from last month:[/bold] N/A (No income last month)")

    # Income by source
    income_by_source = defaultdict(int)
    for income in current_month_income:
        income_by_source[income["category"]] += income["amount"]

    console.print("\n[bold]Income by Source (Current Month):[/bold]")
    if income_by_source:
        for source, amount in income_by_source.items():
            console.print(f"- {source}: Rs {amount / 100:.2f}")
    else:
        console.print("No income recorded for the current month.")

def display_savings_analysis(transactions, budgets):
    console.print(Panel("[bold blue]📈 Savings Analysis[/bold blue]", expand=False))

    current_year, current_month = get_current_month_and_year()
    prev_year, prev_month = get_previous_month_and_year(current_year, current_month)

    current_month_transactions = get_transactions_for_month(transactions, current_year, current_month)
    prev_month_transactions = get_transactions_for_month(transactions, prev_year, prev_month)

    current_month_income = sum(t["amount"] for t in current_month_transactions if t["type"] == "income")
    current_month_expenses = sum(t["amount"] for t in current_month_transactions if t["type"] == "expense")

    current_month_savings = current_month_income - current_month_expenses
    console.print(f"[bold]Current Month ({current_year}-{current_month:02d}) Savings:[/bold] Rs {current_month_savings / 100:.2f}")

    if current_month_income > 0:
        savings_rate = (current_month_savings / current_month_income) * 100
        console.print(f"[bold]Savings Rate:[/bold] {savings_rate:.2f}%")
    else:
        console.print("[bold]Savings Rate:[/bold] N/A (No income this month)")

    # Savings trend (last 3 months)
    console.print("\n[bold]Savings Trend (Last 3 Months):[/bold]")
    for i in range(3):
        year = current_year
        month = current_month - i
        if month <= 0:
            month += 12
            year -= 1
        
        month_transactions = get_transactions_for_month(transactions, year, month)
        month_income = sum(t["amount"] for t in month_transactions if t["type"] == "income")
        month_expenses = sum(t["amount"] for t in month_transactions if t["type"] == "expense")
        month_savings = month_income - month_expenses
        console.print(f"- {year}-{month:02d}: Rs {month_savings / 100:.2f}")


def calculate_financial_health_score(transactions, budgets):
    console.print(Panel("[bold magenta]❤️ Financial Health Score[/bold magenta]", expand=False))

    current_year, current_month = get_current_month_and_year()
    current_month_transactions = get_transactions_for_month(transactions, current_year, current_month)

    total_income = sum(t["amount"] for t in current_month_transactions if t["type"] == "income")
    total_expenses = sum(t["amount"] for t in current_month_transactions if t["type"] == "expense")

    score = 0
    score_breakdown = {}

    # 1. Savings Rate (30 points)
    savings = total_income - total_expenses
    if total_income > 0:
        savings_rate = (savings / total_income) * 100
        if savings_rate >= 20: # Example threshold
            score += 30
            score_breakdown["Savings Rate"] = 30
        elif savings_rate >= 10:
            score += 15
            score_breakdown["Savings Rate"] = 15
        else:
            score_breakdown["Savings Rate"] = 0
    else:
        score_breakdown["Savings Rate"] = 0 # No income, no savings rate

    # 2. Budget Adherence (25 points)
    budget_adherence_score = 0
    if budgets:
        total_budgeted = sum(budgets.values())
        total_actual_expense_for_budgeted_categories = 0
        
        for expense in [t for t in current_month_transactions if t["type"] == "expense"]:
            if expense["category"] in budgets:
                total_actual_expense_for_budgeted_categories += expense["amount"]

        if total_budgeted > 0:
            if total_actual_expense_for_budgeted_categories <= total_budgeted:
                budget_adherence_score = 25
            elif total_actual_expense_for_budgeted_categories <= total_budgeted * 1.1: # 10% leeway
                budget_adherence_score = 15
            else:
                budget_adherence_score = 5
        else:
            budget_adherence_score = 10 # Some points if no budget set but also no overspending
    else:
        budget_adherence_score = 10 # Default if no budgets are set

    score += budget_adherence_score
    score_breakdown["Budget Adherence"] = budget_adherence_score

    # 3. Income vs Expenses (25 points)
    if total_income > total_expenses:
        score += 25
        score_breakdown["Income vs Expenses"] = 25
    elif total_income == total_expenses:
        score += 10
        score_breakdown["Income vs Expenses"] = 10
    else:
        score_breakdown["Income vs Expenses"] = 0

    # 4. Debt Management (20 points) - Placeholder for now, as debt isn't tracked
    # For now, assume good debt management if no negative savings
    if savings >= 0:
        score += 20
        score_breakdown["Debt Management"] = 20
    else:
        score_breakdown["Debt Management"] = 5 # Some debt, but not catastrophic

    console.print(f"[bold]Overall Financial Health Score:[/bold] [green]{score}/100[/green]")
    console.print("\n[bold]Score Breakdown:[/bold]")
    for factor, factor_score in score_breakdown.items():
        console.print(f"- {factor}: {factor_score} points")

    console.print("\n[bold]Recommendations:[/bold]")
    if score < 50:
        console.print("- Focus on increasing income or drastically cutting expenses.")
        console.print("- Review your budget and identify areas for significant savings.")
    elif score < 75:
        console.print("- Look for opportunities to increase your savings rate.")
        console.print("- Ensure you are consistently adhering to your budget.")
    else:
        console.print("- Keep up the great work! Consider setting more aggressive financial goals.")

def display_analytics():
    transactions = load_transactions()
    budgets = load_budgets()

    if not transactions:
        console.print("[yellow]No transactions available to perform analytics.[/yellow]")
        return

    console.print(Panel("[bold cyan]✨ Financial Analytics Dashboard ✨[/bold cyan]", expand=False))

    display_spending_analysis(transactions, budgets)
    console.print("\n")
    display_income_analysis(transactions)
    console.print("\n")
    display_savings_analysis(transactions, budgets)
    console.print("\n")
    calculate_financial_health_score(transactions, budgets)
    console.print("\n")

    console.print(Panel("[bold yellow]Comprehensive Monthly Report[/bold yellow]", expand=False))
    # This section will combine all the above into a single report format
    # For now, calling the individual functions serves as a basic report.
    # Further refinement can format this into a more cohesive single output.
    console.print("[italic]Detailed reports for each section are displayed above.[/italic]")

if __name__ == "__main__":
    # Example usage (for testing purposes)
    # You would typically call display_analytics() from main.py
    display_analytics()
