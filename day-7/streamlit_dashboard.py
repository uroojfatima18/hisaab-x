import streamlit as st
import pandas as pd
from datetime import datetime

# Assuming these functions exist and are correctly implemented in your project
# You might need to adjust the import paths based on your project structure
from features.transactions.transactions import _read_transactions
from features.budgets.budget import _load_budgets

def load_data():
    """Loads transactions and budgets from the database."""
    transactions = _read_transactions()
    budgets = _load_budgets()
    return transactions, budgets

def calculate_monthly_summary(transactions):
    """Calculates income, expenses, and balance for the current month."""
    current_month = datetime.now().strftime("%Y-%m")

    monthly_transactions = [
        t for t in transactions if t["date"].startswith(current_month)
    ]

    total_income = sum(t["amount_paisa"] for t in monthly_transactions if t["type"] == "income")
    total_expenses = sum(t["amount_paisa"] for t in monthly_transactions if t["type"] == "expense")
    current_balance = total_income - total_expenses

    return total_income, total_expenses, current_balance

def get_budget_status(transactions, budgets):
    """Calculates the spending status for each budget category."""
    current_month = datetime.now().strftime("%Y-%m")

    spent_by_category = {}
    for t in transactions:
        if t["type"] == "expense" and t["date"].startswith(current_month):
            category = t["category_or_source"]
            spent_by_category[category] = spent_by_category.get(category, 0) + t["amount_paisa"]

    budget_status = []
    for category, budgeted_paisa in budgets.items():
        spent_paisa = spent_by_category.get(category, 0)
        utilization = (spent_paisa / budgeted_paisa) * 100 if budgeted_paisa > 0 else 0

        if utilization < 70:
            color = "green"
        elif 70 <= utilization < 100:
            color = "orange"
        else:
            color = "red"

        budget_status.append({
            "category": category,
            "budgeted": budgeted_paisa / 100,
            "spent": spent_paisa / 100,
            "utilization": utilization,
            "color": color
        })

    return budget_status

def style_transactions(df):
    """Applies color styling to the transactions DataFrame."""
    def color_row(row):
        colors = []
        if row['Type'] == 'income':
            colors = ['color: green;'] * len(row)
        elif row['Type'] == 'expense':
            colors = ['color: red;'] * len(row)
        else:
            colors = [''] * len(row) # Default, no color
        return colors

    return df.style.apply(color_row, axis=1)

def main():
    """Main function to run the Streamlit dashboard."""
    st.set_page_config(layout="centered", page_title="Finance Dashboard")

    # --- Custom CSS for Card Design ---
    st.markdown("""
    <style>
    .main {
        background-color: #F5F5F5;
        max-width: 1200px;
    }
    .st-metric, .st-header, .st-dataframe, .st-progress > div > div {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .st-metric {
        text-align: center;
    }
    .balance {
        font-size: 3.5em;
        font-weight: bold;
        text-align: center;
    }
    .balance-green {
        color: #28a745;
    }
    .balance-red {
        color: #dc3545;
    }
    /* Custom Progress Bar Styling */
    .progress-wrapper {
        background-color: #e0e0e0;
        border-radius: 5px;
        height: 20px;
        overflow: hidden;
        margin-top: 5px;
    }
    .progress-bar {
        height: 100%;
        width: 0%; /* Initial width */
        border-radius: 5px;
        text-align: center;
        color: white;
        font-weight: bold;
        transition: width 0.5s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .progress-bar.green { background-color: #28a745; }
    .progress-bar.orange { background-color: #ffc107; }
    .progress-bar.red { background-color: #dc3545; }
    </style>
    """, unsafe_allow_html=True)

    st.title("Financial Dashboard")

    transactions, budgets = load_data()

    # --- Balance Section ---
    total_income, total_expenses, current_balance = calculate_monthly_summary(transactions)

    balance_color_class = "balance-green" if current_balance >= 0 else "balance-red"
    st.markdown(f"<div class='balance {balance_color_class}'>₹{current_balance / 100:,.2f}</div>", unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center;'>Current Balance</h3>", unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        st.metric(label="Income (This Month)", value=f"₹{total_income / 100:,.2f}")
    with col2:
        st.metric(label="Expenses (This Month)", value=f"₹{total_expenses / 100:,.2f}")

    st.markdown("<br>", unsafe_allow_html=True)

    # --- Budget Status Section ---
    st.header("Budget Status")
    budget_status = get_budget_status(transactions, budgets)

    if not budget_status:
        st.info("No budgets set. Add budgets in the CLI to see progress here.")
    else:
        for item in budget_status:
            st.write(f"**{item['category']}**")
            st.write(f"Spent ₹{item['spent']:,.2f} of ₹{item['budgeted']:,.2f}")
            progress_width = min(item['utilization'], 100) # Cap at 100% for display purposes
            st.markdown(f"""
                <div class="progress-wrapper">
                    <div class="progress-bar {item['color']}" style="width: {progress_width:.1f}%;">
                        {item['utilization']:.1f}%
                    </div>
                </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # --- Recent Transactions Table ---
    st.header("Recent Transactions")
    if not transactions:
        st.info("No transactions found.")
    else:
        df = pd.DataFrame(transactions)
        df["amount"] = df["amount_paisa"] / 100
        df["Date"] = pd.to_datetime(df["date"]).dt.strftime('%Y-%m-%d')

        # Sort by date (newest first) and select top 10
        df = df.sort_values(by="date", ascending=False).head(10)

        # Select and rename columns for display
        display_df = df[['Date', 'type', 'category_or_source', 'description', 'amount']]
        display_df.columns = ['Date', 'Type', 'Category', 'Description', 'Amount (₹)']

        # Apply styling
        st.dataframe(style_transactions(display_df), use_container_width=True, hide_index=True)

if __name__ == "__main__":
    main()