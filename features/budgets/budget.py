import questionary
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, BarColumn, TextColumn, track
from rich.text import Text
from datetime import datetime
import os
import json

# Initialize Rich Console
console = Console()

# File paths
BUDGET_FILE = "database/budgets.txt"
TRANSACTIONS_FILE = "database/transactions.txt"

# Categories for budgeting
BUDGET_CATEGORIES = [
    "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"
]

def _ensure_budget_file_exists():
    """Ensures the budget file exists."""
    if not os.path.exists(BUDGET_FILE):
        with open(BUDGET_FILE, "w") as f:
            f.write("")


def _load_budgets():
    _ensure_budget_file_exists()
    budgets = {}
    with open(BUDGET_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                budgets[entry["category"]] = entry["amount_paisa"]
            except json.JSONDecodeError:
                pass
    return budgets


def _load_transactions():
    """Loads transactions from the transactions file."""
    transactions = []
    if not os.path.exists(TRANSACTIONS_FILE):
        return transactions
    with open(TRANSACTIONS_FILE, "r") as f:
        for line in f:
            parts = line.strip().split(',')
            if len(parts) == 5:
                # date, type, category, description, amount_paisa
                transactions.append({
                    "date": datetime.strptime(parts[0], "%Y-%m-%d"),
                    "type": parts[1],
                    "category_or_source": parts[2],
                    "description": parts[3],
                    "amount_paisa": int(parts[4])
                })
    return transactions

def add_budget():
    """
    Allows the user to set a monthly budget for a specific category.
    """
    _ensure_budget_file_exists()

    console.print("\n[bold cyan]Set Monthly Budget[/bold cyan]")

    category = questionary.select(
        "Choose a category for the budget:",
        choices=BUDGET_CATEGORIES
    ).ask()

    if category is None:
        console.print("[bold red]Budget setup cancelled.[/bold red]")
        return

    while True:
        amount_str = questionary.text(f"Enter monthly budget amount for {category} (e.g., 100.50):").ask()
        if amount_str is None:
            console.print("[bold red]Budget setup cancelled.[/bold red]")
            return
        try:
            amount_float = float(amount_str)
            if amount_float <= 0:
                console.print("[bold red]Amount must be a positive number.[/bold red]")
                continue
            # Store as paisa/cents to avoid floating-point errors
            amount_paisa = int(round(amount_float * 100))
            break
        except ValueError:
            console.print("[bold red]Invalid amount. Please enter a number (e.g., 100.50).[/bold red]")

    # Save to budgets.txt
    # Overwrite existing budget for the same category if it exists
    budgets = _load_budgets()
    budgets[category] = amount_paisa
    with open(BUDGET_FILE, "w") as f:
        for cat, amount in budgets.items():
            f.write(f"{cat},{amount}\n")

    console.print(f"[bold green]Budget of Rs {amount_float:.2f} set for {category}.[/bold green]")

def view_budgets():
    """
    Displays a summary of monthly budgets, spending, and utilization.
    """
    console.print("\n[bold cyan]Monthly Budget Summary[/bold cyan]")

    budgets = _load_budgets()
    transactions = _load_transactions()

    if not budgets:
        console.print("[yellow]No budgets set yet. Use 'Set Budget' to add one.[/yellow]")
        return

    current_month = datetime.now().month
    current_year = datetime.now().year

    spent_by_category = {category: 0 for category in budgets.keys()}
    total_budget_paisa = 0
    total_spent_paisa = 0

    for transaction in transactions:
        if transaction["type"] == "expense" and \
           transaction["date"].month == current_month and \
           transaction["date"].year == current_year:
            category = transaction["category_or_source"]
            if category in spent_by_category:
                spent_by_category[category] += transaction["amount_paisa"]
            # If an expense category is not in budgets, it's not tracked against a budget

    table = Table(title=f"Budgets for {datetime.now().strftime('%B %Y')}")
    table.add_column("Category", style="cyan", no_wrap=True)
    table.add_column("Budget", style="magenta")
    table.add_column("Spent", style="red")
    table.add_column("Remaining", style="green")
    table.add_column("Utilization", style="blue")
    table.add_column("Status", style="white")

    categories_over_budget = []

    for category, budget_amount_paisa in budgets.items():
        spent_amount_paisa = spent_by_category.get(category, 0)
        remaining_paisa = budget_amount_paisa - spent_amount_paisa
        
        total_budget_paisa += budget_amount_paisa
        total_spent_paisa += spent_amount_paisa

        budget_amount_display = f"Rs {budget_amount_paisa / 100:.2f}"
        spent_amount_display = f"Rs {spent_amount_paisa / 100:.2f}"
        remaining_amount_display = f"Rs {remaining_paisa / 100:.2f}"

        if budget_amount_paisa > 0:
            utilization_percent = (spent_amount_paisa / budget_amount_paisa) * 100
        else:
            utilization_percent = 0 # No budget, no utilization

        # Color coding for remaining and status
        remaining_style = "green"
        status_text = "OK"
        if utilization_percent >= 100:
            remaining_style = "bold red"
            status_text = "OVER"
            categories_over_budget.append(category)
        elif utilization_percent >= 70:
            remaining_style = "yellow"
            status_text = "Warning"
        
        # Progress bar
        progress_bar_length = 10
        filled_length = int(progress_bar_length * (utilization_percent / 100))
        bar = "█" * filled_length + "░" * (progress_bar_length - filled_length)
        
        utilization_display = Text()
        utilization_display.append(f"{utilization_percent:.1f}% ", style="blue")
        
        if utilization_percent >= 100:
            utilization_display.append(bar, style="bold red")
        elif utilization_percent >= 70:
            utilization_display.append(bar, style="yellow")
        else:
            utilization_display.append(bar, style="green")


        table.add_row(
            category,
            budget_amount_display,
            spent_amount_display,
            Text(remaining_amount_display, style=remaining_style),
            utilization_display,
            Text(status_text, style=remaining_style)
        )
    
    console.print(table)

    # Overall summary
    console.print("\n[bold underline]Overall Monthly Summary:[/bold underline]")
    console.print(f"Total Monthly Budget: [magenta]Rs {total_budget_paisa / 100:.2f}[/magenta]")
    console.print(f"Total Spent: [red]Rs {total_spent_paisa / 100:.2f}[/red]")
    
    overall_remaining_paisa = total_budget_paisa - total_spent_paisa
    overall_remaining_style = "green" if overall_remaining_paisa >= 0 else "bold red"
    console.print(f"Total Remaining: [{overall_remaining_style}]Rs {overall_remaining_paisa / 100:.2f}[/{overall_remaining_style}]")

    if total_budget_paisa > 0:
        overall_utilization_percent = (total_spent_paisa / total_budget_paisa) * 100
    else:
        overall_utilization_percent = 0

    overall_utilization_style = "green"
    if overall_utilization_percent >= 100:
        overall_utilization_style = "bold red"
    elif overall_utilization_percent >= 70:
        overall_utilization_style = "yellow"

    console.print(f"Overall Utilization: [{overall_utilization_style}]{overall_utilization_percent:.1f}%[/{overall_utilization_style}]")

    if categories_over_budget:
        console.print("\n[bold red]Warning: The following categories are over budget![/bold red]")
        for cat in categories_over_budget:
            console.print(f"- [red]{cat}[/red]")
        console.print("[italic yellow]Consider adjusting your spending or budget allocations.[/italic yellow]")
    elif overall_utilization_percent < 70:
        console.print("\n[bold green]Great job! You are well within your overall budget.[/bold green]")
    elif overall_utilization_percent < 100:
        console.print("\n[bold yellow]You are approaching your overall budget limit. Keep an eye on your spending![/bold yellow]")
    else:
        console.print("\n[bold red]You have exceeded your overall budget![/bold red]")


if __name__ == "__main__":
    # For testing purposes, you can uncomment one of these:
    # add_budget()
    view_budgets()