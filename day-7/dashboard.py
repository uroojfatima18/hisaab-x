import streamlit as st
import pandas as pd
import json
from datetime import datetime
import os
import time
import hashlib
import base64
from PIL import Image
import io

print("--- Reloading Dashboard ---")

# Page Configuration
st.set_page_config(
    page_title="FinTrack AI",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS for Ultra-Modern UI ---
st.markdown("""
    <style>
    /* Imports */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    /* Global Variables */
    :root {
        --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --glass-bg: rgba(255, 255, 255, 0.7);
        --glass-border: rgba(255, 255, 255, 0.5);
        --shadow-soft: 0 10px 40px rgba(0, 0, 0, 0.05);
        --shadow-hover: 0 20px 50px rgba(0, 0, 0, 0.1);
        --text-main: #1e293b;
        --text-light: #64748b;
    }
    
    /* Base Styles */
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
        color: var(--text-main);
    }
    
    .stApp {
        background: #f8fafc;
        background-image: 
            radial-gradient(at 0% 0%, rgba(102, 126, 234, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(118, 75, 162, 0.05) 0px, transparent 50%);
    }
    
    /* Sidebar Styling */
    [data-testid="stSidebar"] {
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.5);
    }
    
    /* Top Bar Styling */
    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0 30px 0;
    }
    .search-bar {
        background: white;
        padding: 10px 20px;
        border-radius: 30px;
        box-shadow: var(--shadow-soft);
        border: 1px solid var(--glass-border);
        width: 300px;
        color: var(--text-light);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .profile-pill {
        background: white;
        padding: 5px 15px 5px 5px;
        border-radius: 30px;
        box-shadow: var(--shadow-soft);
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .profile-pill:hover {
        transform: translateY(-2px);
    }
    
    /* Balance Card (Glassmorphism + Gradient) */
    .balance-card {
        background: var(--primary-gradient);
        border-radius: 24px;
        padding: 40px;
        color: white;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(118, 75, 162, 0.3);
        margin-bottom: 30px;
        transition: transform 0.3s ease;
    }
    .balance-card:hover {
        transform: translateY(-5px);
    }
    .balance-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
        transform: rotate(30deg);
    }
    
    /* Action Cards */
    .action-card {
        background: white;
        border-radius: 20px;
        padding: 20px;
        text-align: center;
        box-shadow: var(--shadow-soft);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255,255,255,0.8);
        cursor: pointer;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }
    .action-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-hover);
    }
    .icon-box {
        width: 50px;
        height: 50px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        margin-bottom: 5px;
    }
    
    /* Transaction List */
    .tx-row {
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 15px 20px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }
    .tx-row:hover {
        background: white;
        transform: scale(1.01);
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        border-color: rgba(102, 126, 234, 0.2);
    }
    .category-pill {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    /* Login/Onboarding Styles */
    .center-container {
        max-width: 500px;
        margin: 50px auto;
        background: rgba(255, 255, 255, 0.9);
        padding: 40px;
        border-radius: 24px;
        box-shadow: var(--shadow-hover);
        text-align: center;
    }
    .stepper {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        color: var(--text-light);
        font-size: 0.9rem;
    }
    .step {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .step-circle {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .step.active .step-circle {
        background: #10b981;
        color: white;
    }
    .step.active {
        color: #0f172a;
        font-weight: 600;
    }
    
    /* Streamlit Elements Overrides */
    div[data-testid="stMetricValue"] {
        font-family: 'Outfit', sans-serif;
    }
    div.stButton > button {
        border-radius: 12px;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.2s;
    }
    div.stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    /* Hide Streamlit Header */
    header {visibility: hidden;}
    
    </style>
""", unsafe_allow_html=True)

# --- Constants & Setup ---
USERS_FILE = "database/users.txt"
os.makedirs("database", exist_ok=True)

EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"]
INCOME_SOURCES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"]

CATEGORY_ICONS = {
    "Food": "🍔", "Transport": "🚗", "Shopping": "🛍️", "Bills": "🧾", 
    "Entertainment": "🎬", "Health": "💊", "Other": "🔹",
    "Salary": "💰", "Freelance": "💻", "Business": "🏢", "Investment": "📈", "Gift": "🎁",
    "Initial Balance": "💰"
}

CURRENCIES = {
    "USD": {"name": "United States Dollar", "symbol": "$"},
    "EUR": {"name": "Euro", "symbol": "€"},
    "GBP": {"name": "British Pound", "symbol": "£"},
    "PKR": {"name": "Pakistani Rupee", "symbol": "₨"},
    "INR": {"name": "Indian Rupee", "symbol": "₹"},
    "JPY": {"name": "Japanese Yen", "symbol": "¥"},
    "CAD": {"name": "Canadian Dollar", "symbol": "C$"},
    "AUD": {"name": "Australian Dollar", "symbol": "A$"},
    "CNY": {"name": "Chinese Yuan", "symbol": "¥"},
    "RUB": {"name": "Russian Ruble", "symbol": "₽"},
    "AED": {"name": "UAE Dirham", "symbol": "د.إ"},
    "AFN": {"name": "Afghan Afghani", "symbol": "؋"},
    "ALL": {"name": "Albanian Lek", "symbol": "L"},
    "AMD": {"name": "Armenian Dram", "symbol": "֏"},
    "ARS": {"name": "Argentine Peso", "symbol": "$"},
    "BDT": {"name": "Bangladeshi Taka", "symbol": "৳"},
    "BRL": {"name": "Brazilian Real", "symbol": "R$"},
    "CHF": {"name": "Swiss Franc", "symbol": "Fr"},
    "COP": {"name": "Colombian Peso", "symbol": "$"},
    "CZK": {"name": "Czech Koruna", "symbol": "Kč"},
    "DKK": {"name": "Danish Krone", "symbol": "kr"},
    "EGP": {"name": "Egyptian Pound", "symbol": "E£"},
    "HKD": {"name": "Hong Kong Dollar", "symbol": "HK$"},
    "IDR": {"name": "Indonesian Rupiah", "symbol": "Rp"},
    "ILS": {"name": "Israeli New Shekel", "symbol": "₪"},
    "KRW": {"name": "South Korean Won", "symbol": "₩"},
    "KWD": {"name": "Kuwaiti Dinar", "symbol": "KD"},
    "LKR": {"name": "Sri Lankan Rupee", "symbol": "Rs"},
    "MXN": {"name": "Mexican Peso", "symbol": "$"},
    "MYR": {"name": "Malaysian Ringgit", "symbol": "RM"},
    "NGN": {"name": "Nigerian Naira", "symbol": "₦"},
    "NOK": {"name": "Norwegian Krone", "symbol": "kr"},
    "NZD": {"name": "New Zealand Dollar", "symbol": "NZ$"},
    "PHP": {"name": "Philippine Peso", "symbol": "₱"},
    "PLN": {"name": "Polish Złoty", "symbol": "zł"},
    "QAR": {"name": "Qatari Riyal", "symbol": "QR"},
    "SAR": {"name": "Saudi Riyal", "symbol": "SR"},
    "SEK": {"name": "Swedish Krona", "symbol": "kr"},
    "SGD": {"name": "Singapore Dollar", "symbol": "S$"},
    "THB": {"name": "Thai Baht", "symbol": "฿"},
    "TRY": {"name": "Turkish Lira", "symbol": "₺"},
    "TWD": {"name": "New Taiwan Dollar", "symbol": "NT$"},
    "UAH": {"name": "Ukrainian Hryvnia", "symbol": "₴"},
    "VND": {"name": "Vietnamese Đồng", "symbol": "₫"},
    "ZAR": {"name": "South African Rand", "symbol": "R"}
}

# --- Auth Functions ---
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r") as f:
            data = json.load(f)
            # Migration check: Convert old string passwords to dict format
            new_data = {}
            for k, v in data.items():
                if isinstance(v, str):
                    new_data[k] = {"password": v, "question": "None", "answer": "None"}
                else:
                    new_data[k] = v
            return new_data
    except:
        return {}

def save_user(username, password, question, answer):
    users = load_users()
    users[username] = {
        "password": hash_password(password),
        "question": question,
        "answer": hash_password(answer.lower().strip())
    }
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

def check_login(username, password):
    users = load_users()
    if username in users:
        user_data = users[username]
        # Handle both old (str) and new (dict) formats just in case
        stored_hash = user_data if isinstance(user_data, str) else user_data["password"]
        if stored_hash == hash_password(password):
            return True
    return False

def reset_password(username, new_password):
    users = load_users()
    if username in users:
        users[username]["password"] = hash_password(new_password)
        with open(USERS_FILE, "w") as f:
            json.dump(users, f)
        return True
    return False

def verify_security_answer(username, answer):
    users = load_users()
    if username in users:
        stored_answer = users[username].get("answer")
        if stored_answer and stored_answer == hash_password(answer.lower().strip()):
            return True
    return False

def get_security_question(username):
    users = load_users()
    if username in users:
        return users[username].get("question")
    return None

def load_user_settings():
    if 'username' not in st.session_state:
        return {}
    settings_file = f"database/settings_{st.session_state.username}.json"
    if not os.path.exists(settings_file):
        return {}
    try:
        with open(settings_file, "r") as f:
            return json.load(f)
    except:
        return {}

def save_user_settings(settings):
    if 'username' not in st.session_state:
        return
    settings_file = f"database/settings_{st.session_state.username}.json"
    with open(settings_file, "w") as f:
        json.dump(settings, f)

def load_transactions():
    if 'username' not in st.session_state:
        return pd.DataFrame()
    
    user_file = f"database/transactions_{st.session_state.username}.txt"
    transactions = []
    if not os.path.exists(user_file):
        return pd.DataFrame()
    try:
        with open(user_file, "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        t = json.loads(line)
                        t["amount"] = t["amount_paisa"] / 100
                        transactions.append(t)
                    except:
                        continue
    except:
        return pd.DataFrame()
        
    if not transactions:
        return pd.DataFrame()
        
    df = pd.DataFrame(transactions)
    df["date"] = pd.to_datetime(df["date"])
    return df

def save_transaction(date, type_, category, description, amount):
    if 'username' not in st.session_state:
        return
        
    user_file = f"database/transactions_{st.session_state.username}.txt"
    t = {
        "date": date.strftime("%Y-%m-%d"),
        "type": type_,
        "category": category,
        "description": description,
        "amount_paisa": int(amount * 100)
    }
    with open(user_file, "a") as f:
        f.write(json.dumps(t) + "\n")

def load_budgets():
    if 'username' not in st.session_state:
        return pd.DataFrame()
        
    user_file = f"database/budgets_{st.session_state.username}.txt"
    budgets = []
    if not os.path.exists(user_file):
        return pd.DataFrame()
        
    try:
        with open(user_file, "r") as f:
            for line in f:
                if "," in line:
                    cat, limit = line.strip().split(",")
                    budgets.append({"Category": cat, "Budget": float(limit)})
    except:
        return pd.DataFrame()
        
    return pd.DataFrame(budgets)

def save_budget(category, limit):
    if 'username' not in st.session_state:
        return
        
    user_file = f"database/budgets_{st.session_state.username}.txt"
    # Load existing to update or append
    budgets = {}
    if os.path.exists(user_file):
        with open(user_file, "r") as f:
            for line in f:
                if "," in line:
                    c, l = line.strip().split(",")
                    budgets[c] = float(l)
    
    budgets[category] = limit
    
    with open(user_file, "w") as f:
        for c, l in budgets.items():
            f.write(f"{c},{l}\n")

def delete_transaction(index):
    if 'username' not in st.session_state:
        return
    
    user_file = f"database/transactions_{st.session_state.username}.txt"
    if not os.path.exists(user_file):
        return
        
    transactions = []
    try:
        with open(user_file, "r") as f:
            transactions = [line.strip() for line in f if line.strip()]
            
        if 0 <= index < len(transactions):
            transactions.pop(index)
            
        with open(user_file, "w") as f:
            for t in transactions:
                f.write(t + "\n")
    except:
        pass

def delete_budget(category):
    if 'username' not in st.session_state:
        return
        
    user_file = f"database/budgets_{st.session_state.username}.txt"
    if not os.path.exists(user_file):
        return
        
    lines = []
    try:
        with open(user_file, "r") as f:
            for line in f:
                if "," in line:
                    c, l = line.strip().split(",")
                    if c != category:
                        lines.append(line.strip())
        
        with open(user_file, "w") as f:
            for line in lines:
                f.write(line + "\n")
    except:
        pass

def edit_transaction(index, new_data):
    if 'username' not in st.session_state:
        return
    
    user_file = f"database/transactions_{st.session_state.username}.txt"
    if not os.path.exists(user_file):
        return
        
    transactions = []
    try:
        with open(user_file, "r") as f:
            transactions = [line.strip() for line in f if line.strip()]
            
        if 0 <= index < len(transactions):
            # Update the specific transaction
            t = json.loads(transactions[index])
            t.update(new_data)
            # Ensure amount_paisa is updated if amount changed
            if "amount" in new_data:
                t["amount_paisa"] = int(new_data["amount"] * 100)
                del t["amount"] # Don't store float in file
            
            transactions[index] = json.dumps(t)
            
        with open(user_file, "w") as f:
            for t in transactions:
                f.write(t + "\n")
    except:
        pass

def edit_budget(category, new_limit):
    # Re-use save_budget since it overwrites by category key
    save_budget(category, new_limit)

def get_user_files():
    if 'username' not in st.session_state:
        return None, None, None
    
    u = st.session_state.username
    return (
        f"database/transactions_{u}.txt",
        f"database/budgets_{u}.txt",
        f"database/settings_{u}.json"
    )

# --- UI Components ---
def render_logo():
    st.markdown("""
    <div style="text-align: center; margin-bottom: 20px;">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="url(#paint0_linear)"/>
            <path d="M30 70V30L50 50L70 30V70" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#667eea"/>
                    <stop offset="1" stop-color="#764ba2"/>
                </linearGradient>
            </defs>
        </svg>
    </div>
    """, unsafe_allow_html=True)

# --- Navigation ---
if 'page' not in st.session_state:
    st.session_state.page = "Dashboard"
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'auth_mode' not in st.session_state:
    st.session_state.auth_mode = "Login"
if 'onboarding_step' not in st.session_state:
    st.session_state.onboarding_step = 1

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# --- Helper Functions ---

def get_img_as_base64(file):
    try:
        with open(file, "rb") as f:
            img = Image.open(f)
            # Convert RGBA to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            # Resize to thumbnail to keep string size low
            img.thumbnail((200, 200))
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        # Fallback: return empty string to avoid massive text spill
        print(f"Image error: {e}")
        return ""

# --- Main App ---
def main():
    # --- Authentication Flow ---
    if not st.session_state.logged_in:
        # --- Minimalist CSS ---
        st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .stApp {
            background-color: #f1f5f9;
            font-family: 'Inter', sans-serif;
        }
        
        .login-card {
            max-width: 400px;
            margin: 100px auto;
            padding: 40px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            text-align: center;
        }
        
        .brand-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
        }
        
        .form-sub {
            color: #64748b;
            margin-bottom: 30px;
            font-size: 0.9rem;
        }
        
        /* Input styling */
        div[data-testid="stTextInput"] input {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            padding: 12px 15px !important;
            color: #334155 !important;
        }
        div[data-testid="stTextInput"] input:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Button styling */
        div[data-testid="stButton"] button {
            border-radius: 12px !important;
            padding: 10px 20px !important;
            font-weight: 600 !important;
        }
        </style>
        """, unsafe_allow_html=True)

        # Centered Layout
        c1, c2, c3 = st.columns([1, 2, 1])
        
        with c2:
            st.markdown('<div class="login-card">', unsafe_allow_html=True)
            st.markdown('<div class="brand-title">FinTrack</div>', unsafe_allow_html=True)
            
            if st.session_state.auth_mode == "Login":
                st.markdown('<div class="form-sub">Sign in to your account</div>', unsafe_allow_html=True)
                
                username = st.text_input("Username", placeholder="Enter username")
                password = st.text_input("Password", type="password", placeholder="••••••••")
                
                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("Sign In", type="primary", use_container_width=True):
                    if check_login(username, password):
                        st.session_state.logged_in = True
                        st.session_state.username = username
                        st.success("Logged in!")
                        time.sleep(0.5)
                        st.rerun()
                    else:
                        st.error("Incorrect credentials")
                
                st.markdown("<br>", unsafe_allow_html=True)
                c_signup, c_forgot = st.columns(2)
                with c_signup:
                    if st.button("Create Account", type="secondary", use_container_width=True):
                        st.session_state.auth_mode = "Signup"
                        st.rerun()
                with c_forgot:
                    if st.button("Forgot Password?", type="secondary", use_container_width=True):
                        st.session_state.auth_mode = "Forgot"
                        st.rerun()

            elif st.session_state.auth_mode == "Signup":
                st.markdown('<div class="form-sub">Create a new account</div>', unsafe_allow_html=True)
                
                new_user = st.text_input("Choose Username")
                new_pass = st.text_input("Choose Password", type="password")
                confirm_pass = st.text_input("Confirm Password", type="password")
                
                st.markdown("---")
                sec_q = st.selectbox("Security Question", [
                    "What is your mother's maiden name?",
                    "What was the name of your first pet?",
                    "What city were you born in?",
                    "What is your favorite food?"
                ])
                sec_a = st.text_input("Answer")
                
                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("Sign Up", type="primary", use_container_width=True):
                    if new_pass != confirm_pass:
                        st.error("Passwords do not match")
                    elif new_user in load_users():
                        st.error("Username already exists")
                    elif len(new_pass) < 4:
                        st.error("Password too short")
                    elif not sec_a:
                        st.error("Answer required")
                    else:
                        save_user(new_user, new_pass, sec_q, sec_a)
                        st.success("Account created!")
                        st.session_state.auth_mode = "Login"
                        time.sleep(1)
                        st.rerun()
                
                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("Back to Login", type="secondary"):
                    st.session_state.auth_mode = "Login"
                    st.rerun()

            elif st.session_state.auth_mode == "Forgot":
                st.markdown('<div class="form-sub">Reset your password</div>', unsafe_allow_html=True)
                
                if 'reset_step' not in st.session_state:
                    st.session_state.reset_step = 1
                
                if st.session_state.reset_step == 1:
                    f_user = st.text_input("Username or Email")
                    if st.button("Send Code", type="primary", use_container_width=True):
                        if f_user in load_users():
                            st.session_state.reset_user = f_user
                            st.session_state.reset_code = "1234"
                            st.session_state.reset_step = 2
                            st.toast(f"Code sent to {f_user}@example.com", icon="📧")
                            time.sleep(1)
                            st.rerun()
                        else:
                            st.error("User not found")
                            
                elif st.session_state.reset_step == 2:
                    st.info("Code sent (Use 1234)")
                    code = st.text_input("4-digit Code", max_chars=4)
                    if st.button("Verify", type="primary", use_container_width=True):
                        if code == st.session_state.reset_code:
                            st.session_state.reset_step = 3
                            st.rerun()
                        else:
                            st.error("Invalid code")
                            
                elif st.session_state.reset_step == 3:
                    new_p = st.text_input("New Password", type="password")
                    conf_p = st.text_input("Confirm", type="password")
                    if st.button("Reset", type="primary", use_container_width=True):
                        if new_p == conf_p and len(new_p) >= 4:
                            reset_password(st.session_state.reset_user, new_p)
                            st.success("Reset successful!")
                            st.session_state.auth_mode = "Login"
                            del st.session_state['reset_step']
                            del st.session_state['reset_user']
                            del st.session_state['reset_code']
                            time.sleep(1)
                            st.rerun()
                        else:
                            st.error("Mismatch or too short")

                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("Back", type="secondary"):
                    st.session_state.auth_mode = "Login"
                    if 'reset_step' in st.session_state: del st.session_state['reset_step']
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)
        return

    # --- Onboarding Flow ---
    settings = load_user_settings()
    if not settings.get("setup_complete", False):
        c1, c2, c3 = st.columns([1, 2, 1])
        with c2:
            st.markdown("<br>", unsafe_allow_html=True)
            
            # Stepper UI
            step = st.session_state.onboarding_step
            st.markdown(f"""
            <div class="stepper">
                <div class="step {'active' if step >= 1 else ''}">
                    <div class="step-circle">1</div> Select Currency
                </div>
                <div class="step {'active' if step >= 2 else ''}">
                    <div class="step-circle">2</div> Set Balance
                </div>
                <div class="step {'active' if step >= 3 else ''}">
                    <div class="step-circle">3</div> Success
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown('<div class="center-container">', unsafe_allow_html=True)
            
            if step == 1:
                st.markdown("### 🌍 Select Base Currency")
                st.caption("Choose the currency you use most often.")
                
                # Create display options: "United States Dollar (USD)"
                currency_options = [f"{data['name']} ({code})" for code, data in CURRENCIES.items()]
                # Sort alphabetically
                currency_options.sort()
                
                selected_option = st.selectbox("Currency", currency_options)
                
                if st.button("Confirm Currency", type="primary", use_container_width=True):
                    # Extract code from "Name (Code)"
                    currency_code = selected_option.split("(")[-1].strip(")")
                    
                    settings["currency"] = currency_code
                    settings["symbol"] = CURRENCIES[currency_code]["symbol"]
                    save_user_settings(settings)
                    st.session_state.onboarding_step = 2
                    st.rerun()
                    
            elif step == 2:
                symbol = settings.get("symbol", "₹")
                st.markdown("### Set Initial Balance")
                st.caption("How much cash do you have right now?")
                
                initial_balance = st.number_input(f"Current Balance ({symbol})", min_value=0.0, step=100.0)
                
                if st.button("Set Balance", type="primary", use_container_width=True):
                    if initial_balance > 0:
                        save_transaction(datetime.now(), "income", "Initial Balance", "Starting Balance", initial_balance)
                    settings["setup_complete"] = True
                    save_user_settings(settings)
                    st.session_state.onboarding_step = 3
                    st.rerun()
                    
            elif step == 3:
                st.markdown("### 🎉 Success!")
                st.markdown("Your account is all set up.")
                st.markdown("<div style='font-size: 4rem; margin: 20px 0;'>🚀</div>", unsafe_allow_html=True)
                
                if st.button("Go to Dashboard", type="primary", use_container_width=True):
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)
        return

    # --- Main Dashboard (Logged In & Onboarded) ---
    symbol = settings.get("symbol", "₹")
    
    # Sidebar
    with st.sidebar:
        st.markdown("### 🟦 FinTrack AI")
        st.caption(f"Logged in as **{st.session_state.username}**")
        st.markdown("<br>", unsafe_allow_html=True)
        
        menu_items = {
            "Dashboard": "📊",
            "Transactions": "📝",
            "Analytics": "📈",
            "Budgets": "🎯",
            "Settings": "⚙️"
        }
        
        for item, icon in menu_items.items():
            if st.button(f"{icon} {item}", use_container_width=True, type="primary" if st.session_state.page == item else "secondary"):
                navigate_to(item)
        
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.logged_in = False
            st.session_state.onboarding_step = 1
            st.rerun()
            
        st.markdown("<br><br>", unsafe_allow_html=True)
        st.caption("© 2025 FinTrack AI")

    # --- Top Bar ---
    c_search, c_profile = st.columns([4, 1])
    with c_search:
        st.markdown("""
        <div class="search-bar">
            <span>🔍</span> Search transactions...
        </div>
        """, unsafe_allow_html=True)
    with c_profile:
        st.markdown(f"""
        <div class="profile-pill" style="justify-content: center;">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed={st.session_state.username}" width="30" height="30" style="border-radius: 50%;">
            <span style="font-weight: 600; font-size: 0.9rem;">{st.session_state.username}</span>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)

    # --- Dashboard ---
    if st.session_state.page == "Dashboard":
        df = load_transactions()
        budgets_df = load_budgets()
        
        now = datetime.now()
        current_month_df = df[(df["date"].dt.month == now.month) & (df["date"].dt.year == now.year)] if not df.empty else pd.DataFrame()
        
        income = current_month_df[current_month_df["type"] == "income"]["amount"].sum() if not current_month_df.empty else 0
        expenses = current_month_df[current_month_df["type"] == "expense"]["amount"].sum() if not current_month_df.empty else 0
        total_balance = (df[df["type"] == "income"]["amount"].sum() - df[df["type"] == "expense"]["amount"].sum()) if not df.empty else 0

        # Balance Card
        st.markdown(f"""
        <div class="balance-card">
            <div style="font-size: 1rem; opacity: 0.9;">Total Balance</div>
            <div style="font-size: 3rem; font-weight: 700; margin: 10px 0;">{symbol}{total_balance:,.2f}</div>
            <div style="display: flex; gap: 30px; margin-top: 20px;">
                <div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Income</div>
                    <div style="font-size: 1.2rem; font-weight: 600;">+ {symbol}{income:,.0f}</div>
                </div>
                <div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Expense</div>
                    <div style="font-size: 1.2rem; font-weight: 600;">- {symbol}{expenses:,.0f}</div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Action Cards
        c1, c2, c3, c4 = st.columns(4)
        
        def action_card_html(icon, title, color, bg_color):
            return f"""
            <div class="action-card">
                <div class="icon-box" style="background: {bg_color}; color: {color};">
                    {icon}
                </div>
                <div style="font-weight: 600; font-size: 0.9rem;">{title}</div>
            </div>
            """

        with c1:
            st.markdown(action_card_html("➖", "Add Expense", "#ef4444", "#fee2e2"), unsafe_allow_html=True)
            if st.button("Add ", key="btn_exp", use_container_width=True):
                st.session_state['default_type'] = 'expense'
                navigate_to("Transactions")
        
        with c2:
            st.markdown(action_card_html("➕", "Add Income", "#10b981", "#d1fae5"), unsafe_allow_html=True)
            if st.button("Add ", key="btn_inc", use_container_width=True):
                st.session_state['default_type'] = 'income'
                navigate_to("Transactions")
                
        with c3:
            st.markdown(action_card_html("🛍️", "Shopping", "#8b5cf6", "#ede9fe"), unsafe_allow_html=True)
            if st.button("Shop", key="btn_shop", use_container_width=True):
                st.session_state['default_type'] = 'expense'
                st.session_state['default_cat'] = 'Shopping'
                navigate_to("Transactions")
                
        with c4:
            st.markdown(action_card_html("🎯", "Set Budget", "#3b82f6", "#dbeafe"), unsafe_allow_html=True)
            if st.button("Set ", key="btn_bud", use_container_width=True):
                navigate_to("Budgets")

        st.markdown("<br>", unsafe_allow_html=True)

        # Recent Transactions & Insights
        col_main, col_right = st.columns([2, 1])
        
        with col_main:
            st.subheader("Recent Transactions")
            if not df.empty:
                recent_df = df.sort_values(by="date", ascending=False).head(5)
                for idx, row in recent_df.iterrows():
                    icon = CATEGORY_ICONS.get(row["category"], "🔹")
                    color = "#10b981" if row["type"] == "income" else "#ef4444"
                    bg_pill = "#d1fae5" if row["type"] == "income" else "#fee2e2"
                    sign = "+" if row["type"] == "income" else "-"
                    
                    c_row, c_del = st.columns([6, 1])
                    with c_row:
                        st.markdown(f"""
                        <div class="tx-row">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 1.5rem;">{icon}</div>
                                <div>
                                    <div style="font-weight: 600;">{row['category']}</div>
                                    <div style="font-size: 0.8rem; color: #64748b;">{row['date'].strftime('%b %d')} • {row['description']}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 700; color: {color};">{sign} {symbol}{row['amount']:,.2f}</div>
                                <div class="category-pill" style="background: {bg_pill}; color: {color}; display: inline-block; margin-top: 5px;">{row['type'].title()}</div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                    with c_del:
                         st.markdown("<br>", unsafe_allow_html=True)
                         if st.button("🗑️", key=f"del_{idx}"):
                             delete_transaction(idx)
                             st.rerun()
            else:
                st.info("No transactions yet.")

        with col_right:
            st.subheader("Insights")
            # Budget Warnings
            if not budgets_df.empty and not current_month_df.empty:
                for _, row in budgets_df.iterrows():
                    cat = row["Category"]
                    limit = row["Budget"]
                    spent = current_month_df[(current_month_df["type"] == "expense") & (current_month_df["category"] == cat)]["amount"].sum()
                    
                    if spent > limit:
                        st.markdown(f"""
                        <div style="background: #fef2f2; padding: 15px; border-radius: 16px; border: 1px solid #fee2e2; margin-bottom: 10px;">
                            <div style="color: #ef4444; font-weight: 600; margin-bottom: 5px;">⚠️ {cat} Alert</div>
                            <div style="font-size: 0.9rem; color: #7f1d1d;">Over budget by {symbol}{spent-limit:,.0f}</div>
                            <div style="height: 4px; background: #fee2e2; margin-top: 10px; border-radius: 2px;">
                                <div style="width: 100%; height: 100%; background: #ef4444; border-radius: 2px;"></div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                    elif spent > limit * 0.8:
                        pct = (spent/limit)*100
                        st.markdown(f"""
                        <div style="background: #fffbeb; padding: 15px; border-radius: 16px; border: 1px solid #fef3c7; margin-bottom: 10px;">
                            <div style="color: #d97706; font-weight: 600; margin-bottom: 5px;">⚠️ {cat} Warning</div>
                            <div style="font-size: 0.9rem; color: #78350f;">{pct:.0f}% of budget used</div>
                            <div style="height: 4px; background: #fef3c7; margin-top: 10px; border-radius: 2px;">
                                <div style="width: {pct}%; height: 100%; background: #f59e0b; border-radius: 2px;"></div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
            else:
                st.markdown("""
                <div style="background: white; padding: 20px; border-radius: 20px; text-align: center; box-shadow: var(--shadow-soft);">
                    <div style="font-size: 2rem;">✨</div>
                    <div style="margin-top: 10px; color: #64748b;">Your financial insights will appear here.</div>
                </div>
                """, unsafe_allow_html=True)

    # --- Other Pages ---
    elif st.session_state.page == "Transactions":
        st.title("📝 Transactions")
        with st.expander("➕ Add New", expanded=True):
            with st.form("add_tx"):
                c1, c2 = st.columns(2)
                with c1:
                    date = st.date_input("Date", datetime.now())
                    type_ = st.selectbox("Type", ["expense", "income"], index=0 if st.session_state.get('default_type') == 'expense' else 1)
                with c2:
                    opts = EXPENSE_CATEGORIES if type_ == "expense" else INCOME_SOURCES
                    cat = st.selectbox("Category", opts, index=opts.index(st.session_state.default_cat) if 'default_cat' in st.session_state and st.session_state.default_cat in opts else 0)
                    amt = st.number_input(f"Amount ({symbol})", min_value=1.0, step=10.0)
                desc = st.text_input("Description")
                if st.form_submit_button("Save", use_container_width=True):
                    save_transaction(date, type_, cat, desc, amt)
                    st.success("Saved!")
                    if 'default_type' in st.session_state: del st.session_state['default_type']
                    if 'default_cat' in st.session_state: del st.session_state['default_cat']
                    st.rerun()
        
        st.markdown("### History")
        df = load_transactions()
        
        # Edit Mode Handling
        if 'editing_tx' in st.session_state:
            idx = st.session_state.editing_tx
            st.markdown(f"### ✏️ Editing Transaction")
            
            # Get current data
            # We need to find the row with this index. 
            # Since df index resets on load, we need to be careful.
            # Ideally we'd use a unique ID, but for now we'll rely on list position matching file line number.
            # load_transactions returns a dataframe where index 0 is first line.
            
            if idx in df.index:
                row = df.loc[idx]
                with st.form("edit_tx_form"):
                    c1, c2 = st.columns(2)
                    with c1:
                        new_date = st.date_input("Date", row['date'])
                        new_type = st.selectbox("Type", ["expense", "income"], index=0 if row['type'] == 'expense' else 1)
                    with c2:
                        opts = EXPENSE_CATEGORIES if new_type == "expense" else INCOME_SOURCES
                        curr_cat = row['category'] if row['category'] in opts else opts[0]
                        new_cat = st.selectbox("Category", opts, index=opts.index(curr_cat))
                        new_amt = st.number_input(f"Amount ({symbol})", min_value=1.0, step=10.0, value=float(row['amount']))
                    new_desc = st.text_input("Description", row['description'])
                    
                    c_save, c_cancel = st.columns(2)
                    with c_save:
                        if st.form_submit_button("💾 Save Changes", type="primary", use_container_width=True):
                            new_data = {
                                "date": new_date.strftime("%Y-%m-%d"),
                                "type": new_type,
                                "category": new_cat,
                                "description": new_desc,
                                "amount": new_amt
                            }
                            edit_transaction(idx, new_data)
                            del st.session_state.editing_tx
                            st.success("Updated!")
                            st.rerun()
                    with c_cancel:
                        if st.form_submit_button("❌ Cancel", type="secondary", use_container_width=True):
                            del st.session_state.editing_tx
                            st.rerun()
            else:
                st.error("Transaction not found.")
                if st.button("Back"):
                    del st.session_state.editing_tx
                    st.rerun()
        
        elif not df.empty:
            # Normal List View
            for idx, row in df.sort_values(by="date", ascending=False).iterrows():
                c1, c2, c3, c4, c5 = st.columns([2, 3, 2, 0.5, 0.5])
                c1.write(row['date'].strftime('%Y-%m-%d'))
                c2.write(f"{row['category']} ({row['type']})")
                c3.write(f"{symbol}{row['amount']:,.2f}")
                
                if c4.button("✏️", key=f"tx_edit_{idx}"):
                    st.session_state.editing_tx = idx
                    st.rerun()
                    
                if c5.button("🗑️", key=f"tx_del_{idx}"):
                    delete_transaction(idx)
                    st.rerun()
                st.markdown("---")

    elif st.session_state.page == "Analytics":
        st.title("📈 Analytics")
        
        # --- Filters ---
        with st.expander("🔍 Filters", expanded=True):
            c1, c2, c3 = st.columns(3)
            with c1:
                # Date Range (Default to current month)
                today = datetime.now()
                start_of_month = today.replace(day=1)
                date_range = st.date_input("Date Range", [start_of_month, today])
            with c2:
                # Account/Type Filter
                tx_type = st.multiselect("Transaction Type", ["income", "expense"], default=["income", "expense"])
            with c3:
                # Category Filter
                all_cats = EXPENSE_CATEGORIES + INCOME_SOURCES
                selected_cats = st.multiselect("Categories", all_cats, default=all_cats)
        
        # Filter Data
        df = load_transactions()
        if not df.empty:
            # Date Filter
            if len(date_range) == 2:
                df = df[(df["date"].dt.date >= date_range[0]) & (df["date"].dt.date <= date_range[1])]
            
            # Type Filter
            if tx_type:
                df = df[df["type"].isin(tx_type)]
                
            # Category Filter
            if selected_cats:
                df = df[df["category"].isin(selected_cats)]
        
        # --- Tabs ---
        tab1, tab2, tab3 = st.tabs(["📊 Reports", "📈 Balance Trend", "💰 Cash Flow"])
        
        with tab1:
            st.subheader("Incomes & Expenses Report")
            if not df.empty:
                # Summary Cards
                total_inc = df[df["type"] == "income"]["amount"].sum()
                total_exp = df[df["type"] == "expense"]["amount"].sum()
                net = total_inc - total_exp
                
                c1, c2, c3 = st.columns(3)
                c1.metric("Total Income", f"{symbol}{total_inc:,.2f}", delta_color="normal")
                c2.metric("Total Expense", f"{symbol}{total_exp:,.2f}", delta_color="inverse")
                c3.metric("Net Balance", f"{symbol}{net:,.2f}", delta=f"{net:,.2f}")
                
                st.markdown("---")
                
                # Detailed Table
                st.markdown("### Category Breakdown")
                # Group by Category and Type
                cat_group = df.groupby(["category", "type"])["amount"].sum().reset_index()
                cat_group = cat_group.sort_values(by="amount", ascending=False)
                
                # Custom Table
                st.markdown(f"""
                <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <tr>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #64748b;">Category</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #64748b;">Type</th>
                                <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #64748b;">Amount</th>
                                <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #64748b;">%</th>
                            </tr>
                        </thead>
                        <tbody>
                """, unsafe_allow_html=True)
                
                total_vol = df["amount"].sum()
                
                for _, row in cat_group.iterrows():
                    pct = (row["amount"] / total_vol) * 100 if total_vol > 0 else 0
                    color = "#10b981" if row["type"] == "income" else "#ef4444"
                    icon = CATEGORY_ICONS.get(row["category"], "🔹")
                    
                    st.markdown(f"""
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 16px;">
                                <span style="margin-right: 8px;">{icon}</span> {row['category']}
                            </td>
                            <td style="padding: 12px 16px;">
                                <span style="background: {color}20; color: {color}; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                    {row['type'].title()}
                                </span>
                            </td>
                            <td style="padding: 12px 16px; text-align: right; font-weight: 600;">
                                {symbol}{row['amount']:,.2f}
                            </td>
                            <td style="padding: 12px 16px; text-align: right; color: #64748b;">
                                {pct:.1f}%
                            </td>
                        </tr>
                    """, unsafe_allow_html=True)
                    
                st.markdown("</tbody></table></div>", unsafe_allow_html=True)
                
            else:
                st.info("No data available for selected filters.")

        with tab2:
            st.subheader("Balance Trend")
            if not df.empty:
                # Daily Balance Calculation
                daily_df = df.copy()
                daily_df["signed_amount"] = daily_df.apply(lambda x: x["amount"] if x["type"] == "income" else -x["amount"], axis=1)
                daily_trend = daily_df.groupby("date")["signed_amount"].sum().cumsum().reset_index()
                
                st.line_chart(daily_trend, x="date", y="signed_amount", color="#667eea")
            else:
                st.info("No data available.")

        with tab3:
            st.subheader("Cash Flow (Income vs Expense)")
            if not df.empty:
                # Daily Income vs Expense
                cash_flow = df.groupby(["date", "type"])["amount"].sum().unstack().fillna(0)
                st.bar_chart(cash_flow, color=["#ef4444", "#10b981"]) # Red for expense (if col 1), Green for income (if col 2) - verify order
            else:
                st.info("No data available.")

    elif st.session_state.page == "Budgets":
        st.title("🎯 Budgets")
        with st.form("bud_form"):
            c1, c2 = st.columns(2)
            cat = c1.selectbox("Category", EXPENSE_CATEGORIES)
            amt = c2.number_input(f"Limit ({symbol})", min_value=100.0, step=500.0)
            if st.form_submit_button("Set Budget"):
                save_budget(cat, amt)
                st.rerun()
        
        st.markdown("### Active Budgets")
        bdf = load_budgets()
        
        # Edit Mode Handling
        if 'editing_budget' in st.session_state:
            cat = st.session_state.editing_budget
            st.markdown(f"### ✏️ Editing Budget: {cat}")
            
            # Find current limit
            curr_limit = 0.0
            if not bdf.empty and cat in bdf["Category"].values:
                curr_limit = float(bdf[bdf["Category"] == cat]["Budget"].values[0])
            
            with st.form("edit_bud_form"):
                new_limit = st.number_input(f"New Limit ({symbol})", min_value=100.0, step=500.0, value=curr_limit)
                
                c_save, c_cancel = st.columns(2)
                with c_save:
                    if st.form_submit_button("💾 Save Changes", type="primary", use_container_width=True):
                        edit_budget(cat, new_limit)
                        del st.session_state.editing_budget
                        st.success("Updated!")
                        st.rerun()
                with c_cancel:
                    if st.form_submit_button("❌ Cancel", type="secondary", use_container_width=True):
                        del st.session_state.editing_budget
                        st.rerun()
        
        elif not bdf.empty:
            for _, row in bdf.iterrows():
                c1, c2, c3, c4 = st.columns([3, 2, 0.5, 0.5])
                c1.write(row['Category'])
                c2.write(f"{symbol}{row['Budget']:,.2f}")
                
                if c3.button("✏️", key=f"bud_edit_{row['Category']}"):
                    st.session_state.editing_budget = row['Category']
                    st.rerun()
                    
                if c4.button("🗑️", key=f"bud_del_{row['Category']}"):
                    delete_budget(row['Category'])
                    st.rerun()
                st.markdown("---")

    elif st.session_state.page == "Settings":
        st.title("⚙️ Settings")
        
        st.markdown("### Preferences")
        st.markdown('<div class="css-card">', unsafe_allow_html=True)
        c1, c2 = st.columns(2)
        with c1:
            # Prepare options
            currency_options = [f"{data['name']} ({code})" for code, data in CURRENCIES.items()]
            currency_options.sort()
            
            # Find current index
            current_code = settings.get("currency", "INR")
            current_label = f"{CURRENCIES.get(current_code, {'name': 'Unknown'})['name']} ({current_code})"
            
            # Handle case where current code might not be in the new list (fallback)
            default_index = 0
            if current_label in currency_options:
                default_index = currency_options.index(current_label)
            
            selected_option = st.selectbox("Currency", currency_options, index=default_index)
            
            if st.button("Update Currency"):
                new_code = selected_option.split("(")[-1].strip(")")
                settings["currency"] = new_code
                settings["symbol"] = CURRENCIES[new_code]["symbol"]
                save_user_settings(settings)
                st.success("Currency updated!")
                time.sleep(0.5)
                st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("### Danger Zone")
        tx_file, bud_file, _ = get_user_files()
        
        if st.button("🗑️ Clear All Transactions"):
            if os.path.exists(tx_file):
                open(tx_file, 'w').close()
            st.success("Cleared!")
            time.sleep(0.5)
            st.rerun()
            
        if st.button("🔥 Factory Reset"):
            if os.path.exists(tx_file): open(tx_file, 'w').close()
            if os.path.exists(bud_file): open(bud_file, 'w').close()
            # Reset settings too
            settings["setup_complete"] = False
            save_user_settings(settings)
            st.session_state.onboarding_step = 1
            st.success("Reset complete!")
            time.sleep(0.5)
            st.rerun()

if __name__ == "__main__":
    main()