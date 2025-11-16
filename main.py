import questionary
from features.transactions import transactions
from features.budgets import budget
from features.analytics.analytics import display_analytics

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
        elif choice == 'Exit' or choice is None:
            break

if __name__ == "__main__":
    main()
