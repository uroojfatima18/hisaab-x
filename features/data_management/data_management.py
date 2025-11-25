import csv
import os
from datetime import datetime
from rich.console import Console

# Assuming the TRANSACTIONS_FILE path is relative to the project root
TRANSACTIONS_FILE = "database/transactions.txt"
console = Console()

def _read_all_transactions():
    """Reads all transactions from the transactions file."""
    transactions = []
    try:
        with open(TRANSACTIONS_FILE, "r") as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) == 5:
                    transactions.append({
                        "date": parts[0],
                        "type": parts[1],
                        "category_or_source": parts[2],
                        "description": parts[3],
                        "amount_paisa": int(parts[4])
                    })
    except FileNotFoundError:
        console.print(f"[yellow]No transactions file found at {TRANSACTIONS_FILE}.[/yellow]")
    except Exception as e:
        console.print(f"[red]Error reading transactions file: {e}[/red]")
    return transactions

def export_transactions_to_csv(file_path: str):
    """
    Exports all transactions to a CSV file.

    Args:
        file_path (str): The path to the output CSV file.
    """
    transactions = _read_all_transactions()

    if not transactions:
        console.print("[yellow]No transactions to export.[/yellow]")
        return

    try:
        with open(file_path, "w", newline="") as csvfile:
            fieldnames = ["Date", "Type", "Category/Source", "Description", "Amount"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for t in transactions:
                writer.writerow({
                    "Date": t["date"],
                    "Type": t["type"],
                    "Category/Source": t["category_or_source"],
                    "Description": t["description"],
                    "Amount": f"{t['amount_paisa'] / 100:.2f}" # Convert paisa back to currency format
                })
        console.print(f"[green]Transactions successfully exported to {file_path}[/green]")
    except IOError as e:
        console.print(f"[red]Error writing to CSV file: {e}[/red]")
    except Exception as e:
        console.print(f"[red]An unexpected error occurred: {e}[/red]")

import json

def export_transactions_to_json(file_path: str):
    """
    Exports all transactions to a JSON file.

    Args:
        file_path (str): The path to the output JSON file.
    """
    transactions = _read_all_transactions()

    if not transactions:
        console.print("[yellow]No transactions to export.[/yellow]")
        return

    # Convert amount_paisa to actual currency for JSON export
    transactions_for_json = []
    for t in transactions:
        t_copy = t.copy()
        t_copy["amount"] = f"{t_copy['amount_paisa'] / 100:.2f}"
        del t_copy["amount_paisa"] # Remove paisa version
        transactions_for_json.append(t_copy)

    try:
        with open(file_path, "w") as jsonfile:
            json.dump(transactions_for_json, jsonfile, indent=4)
        console.print(f"[green]Transactions successfully exported to {file_path}[/green]")
    except IOError as e:
        console.print(f"[red]Error writing to JSON file: {e}[/red]")
    except Exception as e:
        console.print(f"[red]An unexpected error occurred: {e}[/red]")

from features.budgets.budget import _load_budgets # Import budget loading function

def export_monthly_report_to_json(file_path: str):
    """
    Exports a comprehensive monthly report to a JSON file.
    This report includes transactions, budget summary, and basic analytics.

    Args:
        file_path (str): The path to the output JSON file.
    """
    transactions = _read_all_transactions()
    budgets = _load_budgets()

    if not transactions and not budgets:
        console.print("[yellow]No data to generate a monthly report.[/yellow]")
        return

    current_month = datetime.now().month
    current_year = datetime.now().year
    current_month_str = datetime.now().strftime("%Y-%m")

    # 1. Transaction Summary for current month
    monthly_transactions = [
        t for t in transactions
        if datetime.strptime(t["date"], "%Y-%m-%d").month == current_month and
           datetime.strptime(t["date"], "%Y-%m-%d").year == current_year
    ]

    total_income_paisa = sum(t["amount_paisa"] for t in monthly_transactions if t["type"] == "income")
    total_expense_paisa = sum(t["amount_paisa"] for t in monthly_transactions if t["type"] == "expense")
    balance_paisa = total_income_paisa - total_expense_paisa

    # Convert paisa to currency format for the report
    transactions_for_report = []
    for t in monthly_transactions:
        t_copy = t.copy()
        t_copy["amount"] = f"{t_copy['amount_paisa'] / 100:.2f}"
        del t_copy["amount_paisa"]
        transactions_for_report.append(t_copy)

    # 2. Budget Summary for current month
    budget_summary = {}
    spent_by_category = {category: 0 for category in budgets.keys()}

    for transaction in monthly_transactions:
        if transaction["type"] == "expense":
            category = transaction["category_or_source"]
            if category in spent_by_category:
                spent_by_category[category] += transaction["amount_paisa"]

    for category, budget_amount_paisa in budgets.items():
        spent_amount_paisa = spent_by_category.get(category, 0)
        remaining_paisa = budget_amount_paisa - spent_amount_paisa
        utilization_percent = (spent_amount_paisa / budget_amount_paisa) * 100 if budget_amount_paisa > 0 else 0

        budget_summary[category] = {
            "budgeted": f"{budget_amount_paisa / 100:.2f}",
            "spent": f"{spent_amount_paisa / 100:.2f}",
            "remaining": f"{remaining_paisa / 100:.2f}",
            "utilization_percent": f"{utilization_percent:.2f}%",
            "status": "OVER" if utilization_percent >= 100 else ("Warning" if utilization_percent >= 70 else "OK")
        }

    # 3. Assemble the full report
    monthly_report = {
        "report_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "month": current_month_str,
        "summary": {
            "total_income": f"{total_income_paisa / 100:.2f}",
            "total_expenses": f"{total_expense_paisa / 100:.2f}",
            "net_balance": f"{balance_paisa / 100:.2f}"
        },
        "transactions": transactions_for_report,
        "budget_performance": budget_summary,
        # Placeholder for Analytics and Health Score - will be populated when those features are ready
        "analytics": {
            "spending_patterns": "N/A",
            "savings_rate": "N/A",
            "financial_health_score": "N/A"
        },
        "recommendations": []
    }

    try:
        with open(file_path, "w") as jsonfile:
            json.dump(monthly_report, jsonfile, indent=4)
        console.print(f"[green]Monthly report successfully exported to {file_path}[/green]")
    except IOError as e:
        console.print(f"[red]Error writing to JSON file: {e}[/red]")
    except Exception as e:
        console.print(f"[red]An unexpected error occurred: {e}[/red]")

import questionary # Import questionary for user confirmation

def import_transactions_from_csv(file_path: str):
    """
    Imports transactions from a CSV file, with validation and duplicate checking.

    Args:
        file_path (str): The path to the input CSV file.
    """
    if not os.path.exists(file_path):
        console.print(f"[red]Error: CSV file not found at {file_path}[/red]")
        return

    existing_transactions = _read_all_transactions()
    existing_transaction_set = set()
    for t in existing_transactions:
        # Create a unique tuple for each transaction to easily check for duplicates
        existing_transaction_set.add((t["date"], t["type"], t["category_or_source"], t["description"], t["amount_paisa"]))

    transactions_to_import = []
    skipped_count = 0
    imported_count = 0

    try:
        with open(file_path, "r", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            # Expected headers: Date,Type,Category/Source,Description,Amount
            if not all(header in reader.fieldnames for header in ["Date", "Type", "Category/Source", "Description", "Amount"]):
                console.print("[red]Error: CSV file must contain 'Date', 'Type', 'Category/Source', 'Description', 'Amount' headers.[/red]")
                return

            for row_num, row in enumerate(reader, 2): # Start row_num from 2 for data rows
                try:
                    date_str = row["Date"]
                    transaction_type = row["Type"].lower()
                    category_or_source = row["Category/Source"]
                    description = row["Description"]
                    amount_str = row["Amount"]

                    # Validate date
                    datetime.strptime(date_str, "%Y-%m-%d")

                    # Validate type
                    if transaction_type not in ["expense", "income"]:
                        console.print(f"[yellow]Skipping row {row_num}: Invalid transaction type '{transaction_type}'. Must be 'expense' or 'income'.[/yellow]")
                        skipped_count += 1
                        continue

                    # Validate amount
                    amount_float = float(amount_str)
                    if amount_float <= 0:
                        console.print(f"[yellow]Skipping row {row_num}: Amount must be a positive number.[/red]")
                        skipped_count += 1
                        continue
                    amount_paisa = int(round(amount_float * 100))

                    # Check for duplicate
                    transaction_tuple = (date_str, transaction_type, category_or_source, description, amount_paisa)
                    if transaction_tuple in existing_transaction_set:
                        console.print(f"[yellow]Skipping row {row_num}: Duplicate transaction found.[/yellow]")
                        skipped_count += 1
                        continue

                    transactions_to_import.append({
                        "date": date_str,
                        "type": transaction_type,
                        "category_or_source": category_or_source,
                        "description": description,
                        "amount_paisa": amount_paisa
                    })

                except ValueError as ve:
                    console.print(f"[yellow]Skipping row {row_num}: Data validation error - {ve}.[/yellow]")
                    skipped_count += 1
                except KeyError as ke:
                    console.print(f"[yellow]Skipping row {row_num}: Missing expected column - {ke}.[/yellow]")
                    skipped_count += 1
                except Exception as ex:
                    console.print(f"[yellow]Skipping row {row_num}: Unexpected error - {ex}.[/yellow]")
                    skipped_count += 1

        if not transactions_to_import:
            console.print("[yellow]No new valid transactions to import.[/yellow]")
            return

        console.print(f"\n[bold blue]Import Summary:[/bold blue]")
        console.print(f"  [green]Valid transactions ready to import: {len(transactions_to_import)}[/green]")
        console.print(f"  [yellow]Transactions skipped (duplicates or errors): {skipped_count}[/yellow]")

        confirm = questionary.confirm("Do you want to proceed with importing these transactions?").ask()

        if confirm:
            with open(TRANSACTIONS_FILE, "a") as f:
                for t in transactions_to_import:
                    f.write(f"{t['date']},{t['type']},{t['category_or_source']},{t['description']},{t['amount_paisa']}\n")
                    imported_count += 1
            console.print(f"[green]Successfully imported {imported_count} new transactions.[/green]")
        else:
            console.print("[red]Import cancelled by user.[/red]")

    except FileNotFoundError:
        console.print(f"[red]Error: CSV file not found at {file_path}[/red]")
    except Exception as e:
        console.print(f"[red]An unexpected error occurred during CSV import: {e}[/red]")

import zipfile
import shutil
import glob

# Define backup directory and files to backup
BACKUP_DIR = "backups"
BUDGET_FILE = "database/budget.txt" # Assuming this is the correct path for budget file
FILES_TO_BACKUP = [TRANSACTIONS_FILE, BUDGET_FILE]
MAX_BACKUPS = 10

def create_backup():
    """
    Creates a timestamped zip archive of the database files and manages old backups.
    """
    os.makedirs(BACKUP_DIR, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = os.path.join(BACKUP_DIR, f"finance_tracker_backup_{timestamp}.zip")

    try:
        with zipfile.ZipFile(backup_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in FILES_TO_BACKUP:
                if os.path.exists(file_path):
                    zipf.write(file_path, os.path.basename(file_path))
                else:
                    console.print(f"[yellow]Warning: File not found for backup: {file_path}[/yellow]")
        console.print(f"[green]Backup created successfully: {backup_filename}[/green]")
        _cleanup_old_backups()
    except Exception as e:
        console.print(f"[red]Error creating backup: {e}[/red]")

def _cleanup_old_backups():
    """
    Deletes oldest backup files, keeping only the MAX_BACKUPS most recent ones.
    """
    backup_files = sorted(glob.glob(os.path.join(BACKUP_DIR, "finance_tracker_backup_*.zip")), key=os.path.getmtime)
    if len(backup_files) > MAX_BACKUPS:
        for old_backup in backup_files[:-MAX_BACKUPS]:
            try:
                os.remove(old_backup)
                console.print(f"[yellow]Removed old backup: {old_backup}[/yellow]")
            except Exception as e:
                console.print(f"[red]Error removing old backup {old_backup}: {e}[/red]")

def restore_from_backup():
    """
    Restores database files from a selected backup archive.
    """
    if not os.path.exists(BACKUP_DIR):
        console.print(f"[red]Backup directory '{BACKUP_DIR}' not found.[/red]")
        return

    backup_files = sorted(glob.glob(os.path.join(BACKUP_DIR, "finance_tracker_backup_*.zip")), key=os.path.getmtime, reverse=True)

    if not backup_files:
        console.print("[yellow]No backups found to restore.[/yellow]")
        return

    selected_backup = questionary.select(
        "Select a backup to restore:",
        choices=[os.path.basename(f) for f in backup_files]
    ).ask()

    if not selected_backup:
        console.print("[red]Restore cancelled by user.[/red]")
        return

    backup_path = os.path.join(BACKUP_DIR, selected_backup)

    confirm = questionary.confirm(
        f"This will overwrite current data with the contents of '{selected_backup}'. Are you sure?"
    ).ask()

    if not confirm:
        console.print("[red]Restore cancelled by user.[/red]")
        return

    try:
        with zipfile.ZipFile(backup_path, 'r') as zipf:
            # Ensure the database directory exists
            database_dir = os.path.dirname(TRANSACTIONS_FILE)
            if not database_dir:
                database_dir = "database" # Fallback
            os.makedirs(database_dir, exist_ok=True)
            zipf.extractall(database_dir)
            
            # Check which files were restored
            restored_files = zipf.namelist()
            console.print(f"[green]Successfully restored {', '.join(restored_files)} from {selected_backup}[/green]")

    except FileNotFoundError:
        console.print(f"[red]Error: Backup file not found at {backup_path}[/red]")
    except Exception as e:
        console.print(f"[red]An unexpected error occurred during restore: {e}[/red]")

    
def validate_data_integrity():
    """
    Checks the integrity of transactions.txt and budgets.txt files.
    Reports any malformed entries or inconsistencies.
    """
    console.print("\n[bold blue]Running Data Integrity Check...[/bold blue]")
    issues_found = False

    # Validate transactions.txt
    console.print("\n[bold underline]Validating Transactions Data:[/bold underline]")
    try:
        with open(TRANSACTIONS_FILE, "r") as f:
            for i, line in enumerate(f, 1):
                parts = line.strip().split(',')
                if len(parts) != 5:
                    console.print(f"[red]Issue in transactions.txt, line {i}: Malformed line (expected 5 parts, got {len(parts)}): {line.strip()}[/red]")
                    issues_found = True
                    continue
                
                date_str, type_str, category_or_source, description, amount_paisa_str = parts

                # Validate Date
                try:
                    datetime.strptime(date_str, "%Y-%m-%d")
                except ValueError:
                    console.print(f"[red]Issue in transactions.txt, line {i}: Invalid date format '{date_str}'. Expected YYYY-MM-DD.[/red]")
                    issues_found = True

                # Validate Type
                if type_str not in ["expense", "income"]:
                    console.print(f"[red]Issue in transactions.txt, line {i}: Invalid transaction type '{type_str}'. Expected 'expense' or 'income'.[/red]")
                    issues_found = True
                
                # Validate Amount
                try:
                    amount_paisa = int(amount_paisa_str)
                    if amount_paisa <= 0:
                        console.print(f"[red]Issue in transactions.txt, line {i}: Amount must be positive, got '{amount_paisa_str}'.[/red]")
                        issues_found = True
                except ValueError:
                    console.print(f"[red]Issue in transactions.txt, line {i}: Invalid amount '{amount_paisa_str}'. Expected integer (paisa).[/red]")
                    issues_found = True

    except FileNotFoundError:
        console.print(f"[yellow]transactions.txt not found. Skipping transaction validation.[/yellow]")
    except Exception as e:
        console.print(f"[red]Error reading transactions.txt: {e}[/red]")
        issues_found = True

    # Validate budgets.txt
    console.print("\n[bold underline]Validating Budgets Data:[/bold underline]")
    try:
        with open(BUDGET_FILE, "r") as f:
            for i, line in enumerate(f, 1):
                parts = line.strip().split(',')
                if len(parts) != 2:
                    console.print(f"[red]Issue in budgets.txt, line {i}: Malformed line (expected 2 parts, got {len(parts)}): {line.strip()}[/red]")
                    issues_found = True
                    continue
                
                category, amount_paisa_str = parts

                # Validate Amount
                try:
                    amount_paisa = int(amount_paisa_str)
                    if amount_paisa <= 0:
                        console.print(f"[red]Issue in budgets.txt, line {i}: Budget amount must be positive, got '{amount_paisa_str}'.[/red]")
                        issues_found = True
                except ValueError:
                    console.print(f"[red]Issue in budgets.txt, line {i}: Invalid budget amount '{amount_paisa_str}'. Expected integer (paisa).[/red]")
                    issues_found = True

    except FileNotFoundError:
        console.print(f"[yellow]budgets.txt not found. Skipping budget validation.[/yellow]")
    except Exception as e:
        console.print(f"[red]Error reading budgets.txt: {e}[/red]")
        issues_found = True

    if not issues_found:
        console.print("\n[bold green]Data integrity check completed: No issues found![/bold green]")
    else:
        console.print("\n[bold red]Data integrity check completed: Issues found. Please review the errors above.[/bold red]")