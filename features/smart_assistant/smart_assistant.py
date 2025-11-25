import datetime
from collections import defaultdict
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
import calendar
import random

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

def is_income_consistent(transactions, num_months=3):
    current_year, current_month = get_current_month_and_year()
    income_months = set()
    for i in range(num_months):
        year = current_year
        month = current_month - i
        if month <= 0:
            month += 12
            year -= 1
        
        month_transactions = get_transactions_for_month(transactions, year, month)
        if any(t["type"] == "income" for t in month_transactions):
            income_months.add((year, month))
    
    return len(income_months) == num_months

def generate_smart_recommendations(transactions, budgets):
    console.print(Panel("[bold yellow]💡 Smart Recommendations[/bold yellow]", expand=False))

    current_year, current_month = get_current_month_and_year()
    current_month_transactions = get_transactions_for_month(transactions, current_year, current_month)

    total_income = sum(t["amount"] for t in current_month_transactions if t["type"] == "income")
    total_expenses = sum(t["amount"] for t in current_month_transactions if t["type"] == "expense")
    
    recommendations = []

    # Recommendation 1: Overspending categories
    expense_by_category = defaultdict(int)
    for t in current_month_transactions:
        if t["type"] == "expense":
            expense_by_category[t["category"]] += t["amount"]

    for category, spent_amount in expense_by_category.items():
        if category in budgets:
            budget_amount = budgets[category]
            if spent_amount > budget_amount:
                overspent_amount = spent_amount - budget_amount
                # Suggest reducing by at least the overspent amount, or a percentage
                reduction_percentage = min(100, (overspent_amount / budget_amount) * 100) if budget_amount > 0 else 100
                recommendations.append(
                    f"Consider reducing spending in [red]{category}[/red]. You've overspent by Rs {overspent_amount / 100:.2f}. Try to cut down by {reduction_percentage:.0f}%."
                )
            elif spent_amount > budget_amount * 0.8: # Nearing budget limit
                remaining = budget_amount - spent_amount
                recommendations.append(
                    f"You are nearing your budget limit for [yellow]{category}[/yellow]. You have Rs {remaining / 100:.2f} remaining out of Rs {budget_amount / 100:.2f}."
                )
        else:
            # If no budget is set for a category with significant spending
            if spent_amount > total_income * 0.1 and total_income > 0: # Arbitrary threshold for "significant"
                recommendations.append(
                    f"You have significant spending in [blue]{category}[/blue] (Rs {spent_amount / 100:.2f}) but no budget set. Consider setting a budget for this category."
                )

    # Recommendation 2: Low savings
    savings = total_income - total_expenses
    if total_income > 0:
        savings_rate = (savings / total_income) * 100
        if savings_rate < 10: # Example: less than 10% savings rate is low
            recommendations.append(
                "Your savings rate is low. Try implementing the [bold]50/30/20 rule[/bold] (50% Needs, 30% Wants, 20% Savings) to boost your savings."
            )
        elif savings_rate >= 20:
            recommendations.append("Excellent savings rate! Keep up the great work and consider increasing your savings goals.")
    else:
        recommendations.append("Record your income to get a clear picture of your savings rate and receive more tailored advice.")

    # Recommendation 3: Irregular income
    if not is_income_consistent(transactions):
        recommendations.append(
            "Your income appears to be irregular. Building a [bold]3-month emergency fund[/bold] is highly recommended to provide financial stability."
        )

    # Recommendation 4: No budget set (overall)
    if not budgets and total_expenses > 0: # Only recommend if there are expenses
        recommendations.append("You haven't set any budgets. [bold]Setting budgets[/bold] can help you control your spending, identify areas for savings, and achieve financial goals.")

    # Display recommendations
    if recommendations:
        for i, rec in enumerate(recommendations):
            console.print(f"• {rec}")
    else:
        console.print("No specific recommendations at this time. Your finances look healthy! Keep up the good work.")

def display_smart_assistant_dashboard():
    transactions = load_transactions()
    budgets = load_budgets()

    if not transactions:
        console.print("[yellow]No transactions available for smart assistant analysis.[/yellow]")
        return

    console.print(Panel("[bold blue]🧠 Smart Financial Assistant[/bold blue]", expand=False))

    # Daily Financial Check
    console.print(f"\n[bold]📊 Daily Financial Check ({datetime.date.today().strftime('%b %d, %Y')}):[/bold]")
    today = datetime.date.today()
    current_year, current_month = get_current_month_and_year()
    current_month_transactions = get_transactions_for_month(transactions, current_year, current_month)

    today_spending = sum(t["amount"] for t in transactions if t["date"] == today and t["type"] == "expense")
    console.print(f"Today's Spending: Rs {today_spending / 100:.2f}")

    # Calculate remaining daily budget
    total_monthly_budget = sum(budgets.values())
    current_month_expenses = sum(t["amount"] for t in current_month_transactions if t["type"] == "expense")
    
    # Get days in current month
    _, last_day_of_month = calendar.monthrange(current_year, current_month)
    days_in_month = last_day_of_month
    remaining_days = days_in_month - today.day + 1 # Including today

    daily_budget_status = Text("N/A", style="yellow")
    if total_monthly_budget > 0 and remaining_days > 0:
        remaining_monthly_budget = total_monthly_budget - current_month_expenses
        if remaining_monthly_budget > 0:
            remaining_daily_budget = remaining_monthly_budget / remaining_days
            daily_budget_status = Text(f"Rs {remaining_daily_budget / 100:.2f} ✅", style="green")
        else:
            daily_budget_status = Text("Over budget ❌", style="red")
    
    console.print(f"Remaining Daily Budget: {daily_budget_status}")

    # Alerts
    alerts = []
    total_income_this_month = sum(t["amount"] for t in current_month_transactions if t["type"] == "income")

    # Budget warnings (>80% used)
    expense_by_category = defaultdict(int)
    for t in current_month_transactions:
        if t["type"] == "expense":
            expense_by_category[t["category"]] += t["amount"]

    for category, spent_amount in expense_by_category.items():
        if category in budgets:
            budget_amount = budgets[category]
            if budget_amount > 0 and spent_amount > budget_amount * 0.8 and spent_amount <= budget_amount:
                alerts.append(f"• [yellow]Budget Warning:[/yellow] {category} is at {spent_amount / budget_amount:.0%} of its budget (Rs {spent_amount / 100:.2f} / Rs {budget_amount / 100:.2f})")
            elif spent_amount > budget_amount:
                alerts.append(f"• [red]Budget Overspent:[/red] {category} budget overspent by Rs {(spent_amount - budget_amount) / 100:.2f}")

    # Large transaction alerts (>20% of monthly income)
    for t in current_month_transactions:
        if t["type"] == "expense" and total_income_this_month > 0 and t["amount"] > total_income_this_month * 0.2:
            alerts.append(f"• [yellow]Large Transaction:[/yellow] Rs {t['amount'] / 100:.2f} in {t['category']} on {t['date'].strftime('%b %d')} (>{total_income_this_month * 0.2 / 100:.2f} of monthly income)")

    if alerts:
        console.print("\n[bold]⚠️ Alerts:[/bold]")
        for alert in alerts:
            console.print(alert)
    else:
        console.print("\n[bold]✅ No alerts at this time.[/bold]")

    # Quick tip for the day
    tips = [
        "Review your subscriptions and cancel any you don't use.",
        "Try the '30-day rule' for non-essential purchases.",
        "Cook at home more often to save on food expenses.",
        "Set a small, achievable savings goal for this week.",
        "Track every penny you spend today to become more aware.",
        "Consider automating your savings to reach goals faster."
    ]
    console.print(f"\n[bold]💡 Tip:[/bold] {random.choice(tips)}")

    console.print("\n")
    generate_smart_recommendations(transactions, budgets)

if __name__ == "__main__":
    display_smart_assistant_dashboard()
