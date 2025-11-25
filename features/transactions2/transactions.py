import questionary
from datetime import datetime
from rich.console import Console
from rich.table import Table

TRANSACTIONS_FILE = "database/transactions.txt"
console = Console()

def _get_amount_input(prompt: str) -> int:
    while True:
        amount_str = questionary.text(prompt).ask()
        try:
            amount_float = float(amount_str)
            if amount_float <= 0:
                console.print("[red]Amount must be a positive number.[/red]")
                continue
            # Store as paisa/cents to avoid float errors
            return int(amount_float * 100)
        except ValueError:
            console.print("[red]Invalid amount. Please enter a number.[/red]")

def _get_date_input(prompt: str) -> str:
    while True:
        date_str = questionary.text(prompt, default=datetime.now().strftime("%Y-%m-%d")).ask()
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return date_str
        except ValueError:
            console.print("[red]Invalid date format. Please use YYYY-MM-DD.[/red]")

import json

def _read_transactions():
    transactions = []
    try:
        with open(TRANSACTIONS_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    transactions.append({
                        "date": data["date"],
                        "type": data["type"],
                        "category_or_source": data["category_or_source"],
                        "description": data["description"],
                        "amount_paisa": int(data["amount_paisa"])
                    })
                except json.JSONDecodeError:
                    console.print(f"[yellow]Skipping malformed transaction line: {line}[/yellow]")
    except FileNotFoundError:
        console.print(f"[yellow]No transactions found in {TRANSACTIONS_FILE}.[/yellow]")

    return transactions


def _save_transaction(date, type, category_or_source, description, amount_paisa):
    with open(TRANSACTIONS_FILE, "a") as f:
        json.dump({
            "date": date,
            "type": type,
            "category_or_source": category_or_source,
            "description": description,
            "amount_paisa": amount_paisa
        }, f)
        f.write("\n")

    console.print(f"[green]{type.capitalize()} added successfully![/green]")


def add_expense():
    console.print("\n[bold blue]Add New Expense[/bold blue]")
    amount_paisa = _get_amount_input("Enter amount (e.g., 12.50):")
    category = questionary.select(
        "Select category:",
        choices=["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"]
    ).ask()
    description = questionary.text("Enter description:").ask()
    date = _get_date_input("Enter date (YYYY-MM-DD, default today):")

    _save_transaction(date, "expense", category, description, amount_paisa)

def add_income():
    console.print("\n[bold green]Add New Income[/bold green]")
    amount_paisa = _get_amount_input("Enter amount (e.g., 100.00):")
    source = questionary.select(
        "Select source:",
        choices=["Salary", "Freelance", "Business", "Investment", "Gift", "Other"]
    ).ask()
    description = questionary.text("Enter description:").ask()
    date = _get_date_input("Enter date (YYYY-MM-DD, default today):")

    _save_transaction(date, "income", source, description, amount_paisa)

def list_transactions():
    console.print("\n[bold blue]Listing Transactions[/bold blue]")
    transactions = _read_transactions()

    if not transactions:
        return

    filter_option = questionary.select(
        "Filter transactions:",
        choices=["All", "Last 7 days", "Expenses only", "Income only"]
    ).ask()

    filtered_transactions = []
    today = datetime.now().date()

    for t in transactions:
        transaction_date = datetime.strptime(t["date"], "%Y-%m-%d").date()
        
        # Apply date filter
        if filter_option == "Last 7 days":
            if (today - transaction_date).days > 7:
                continue
        
        # Apply type filter
        if filter_option == "Expenses only" and t["type"] != "expense":
            continue
        if filter_option == "Income only" and t["type"] != "income":
            continue
        
        filtered_transactions.append(t)

    if not filtered_transactions:
        console.print("[yellow]No transactions found matching the filter criteria.[/yellow]")
        return

    # Sort by date, newest first
    filtered_transactions.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"), reverse=True)

    table = Table(title="Transactions")
    table.add_column("Date", style="cyan", no_wrap=True)
    table.add_column("Type", style="magenta")
    table.add_column("Category/Source", style="blue")
    table.add_column("Description", style="white")
    table.add_column("Amount", justify="right")

    for t in filtered_transactions:
        amount_display = f"Rs {t['amount_paisa'] / 100:.2f}"
        if t["type"] == "expense":
            amount_style = "red"
        else:
            amount_style = "green"
        
        table.add_row(
            t["date"],
            t["type"].capitalize(),
            t["category_or_source"],
            t["description"],
            f"[{amount_style}]{amount_display}[/{amount_style}]"
        )
    
    console.print(table)

def balance():
    console.print("\n[bold blue]Current Balance[/bold blue]")
    transactions = _read_transactions()

    if not transactions:
        console.print("[yellow]No transactions to calculate balance.[/yellow]")
        return

    current_month = datetime.now().strftime("%Y-%m")
    total_income_paisa = 0
    total_expense_paisa = 0

    for t in transactions:
        if t["date"].startswith(current_month):
            if t["type"] == "income":
                total_income_paisa += t["amount_paisa"]
            elif t["type"] == "expense":
                total_expense_paisa += t["amount_paisa"]
    
    balance_paisa = total_income_paisa - total_expense_paisa

    console.print(f"Total Income ({current_month}): [green]Rs {total_income_paisa / 100:.2f}[/green]")
    console.print(f"Total Expenses ({current_month}): [red]Rs {total_expense_paisa / 100:.2f}[/red]")
    
    balance_color = "green" if balance_paisa >= 0 else "red"
    console.print(f"Current Balance ({current_month}): [{balance_color}]Rs {balance_paisa / 100:.2f}[/{balance_color}]")
