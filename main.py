import subprocess
import questionary
from features.transactions import transactions
from features.budgets import budget
from features.analytics.analytics import display_analytics
from features.smart_assistant.smart_assistant import display_smart_assistant_dashboard
from features.data_management import data_management
from rich.console import Console

console = Console()

def run_shell_command(command: str, description: str = ""):
    """Run a terminal command with Rich output."""
    console.print(f"[bold blue]{description}[/bold blue]")

    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError:
        console.print("[bold red]Failed to run command![/bold red]")

def main():
    """Main function to run the finance tracker CLI."""
    while True:
        choice = questionary.select(
            "What would you like to do?",
            choices=[
                'Add Expense',
                'Add Income',
                'List Transactions',
                'View Balance',
                'Set Budget',
                'View Budgets',
                'View Analytics',
                'Smart Assistant',
                'Export Transactions to CSV',
                'Export Transactions to JSON',
                'Export Monthly Report to JSON',
                'Import Transactions from CSV',
                'Create Backup',
                'Restore from Backup',
                'Validate Data Integrity',
                'Launch Web Dashboard',
                'Exit'
            ]
        ).ask()

        if choice == 'Add Expense':
            transactions.add_expense()
        elif choice == 'Add Income':
            transactions.add_income()
        elif choice == 'List Transactions':
            transactions.list_transactions()
        elif choice == 'View Balance':
            transactions.balance()
        elif choice == 'Set Budget':
            budget.add_budget()
        elif choice == 'View Budgets':
            budget.view_budgets()
        elif choice == 'View Analytics':
            display_analytics()
        elif choice == 'Smart Assistant':
            display_smart_assistant_dashboard()
        elif choice == 'Export Transactions to CSV':
            file_path = questionary.text("Enter CSV file path (e.g., transactions.csv):").ask()
            if file_path:
                data_management.export_transactions_to_csv(file_path)
        elif choice == 'Export Transactions to JSON':
            file_path = questionary.text("Enter JSON file path (e.g., transactions.json):").ask()
            if file_path:
                data_management.export_transactions_to_json(file_path)
        elif choice == 'Export Monthly Report to JSON':
            file_path = questionary.text("Enter JSON file path for monthly report (e.g., monthly_report.json):").ask()
            if file_path:
                data_management.export_monthly_report_to_json(file_path)
        elif choice == 'Import Transactions from CSV':
            file_path = questionary.text("Enter CSV file path to import from:").ask()
            if file_path:
                data_management.import_transactions_from_csv(file_path)
        elif choice == 'Create Backup':
            data_management.create_backup()
        elif choice == 'Restore from Backup':
            data_management.restore_from_backup()
        elif choice == 'Validate Data Integrity':
            data_management.validate_data_integrity()
        elif choice == 'Launch Web Dashboard':
            console.print("[bold green]Launching Streamlit Web Dashboard...[/bold green]")
            console.print("[yellow]You might need to open the URL manually.[/yellow]")
            run_shell_command("streamlit run streamlit_dashboard.py", description="Launch Streamlit web dashboard")
        elif choice == 'Exit' or choice is None:
            break

if __name__ == "__main__":
    main()
