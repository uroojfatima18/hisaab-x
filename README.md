# HissabX - Smart Finance Tracker

A professional, modern finance tracking web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **User Authentication**
  - Secure login/signup with SHA-256 password hashing
  - Password recovery with security questions
  - Session management

- **Onboarding Flow**
  - Currency selection (50+ currencies supported)
  - Initial balance setup
  - Step-by-step guided setup

- **Dashboard**
  - Balance overview with income/expense summary
  - Quick action cards for common tasks
  - Recent transactions display
  - Budget alerts and insights

- **Transaction Management**
  - Add, edit, and delete transactions
  - Support for income and expense categories
  - Date-based organization
  - Amount stored as integers (paisa/cents) to avoid floating-point errors

- **Budget Tracking**
  - Set monthly budgets per category
  - Real-time utilization tracking
  - Visual progress bars
  - Warning and over-budget alerts

- **Analytics**
  - Date range filtering
  - Category breakdown reports
  - Balance trend visualization
  - Cash flow charts (income vs expense)

- **Settings**
  - Currency preference management
  - Clear all transactions
  - Factory reset option

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Storage**: localStorage (client-side)

## Design Features

- Glassmorphism UI with backdrop blur effects
- Gradient backgrounds and smooth animations
- Responsive design (mobile, tablet, desktop)
- Professional color palette with primary purple gradient
- Hover effects and micro-interactions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd fintrack-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
fintrack-nextjs/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   ├── analytics/           # Analytics page
│   ├── budgets/             # Budgets page
│   ├── dashboard/           # Main dashboard
│   ├── forgot-password/     # Password recovery
│   ├── login/               # Login page
│   ├── onboarding/          # Onboarding flow
│   ├── settings/            # Settings page
│   ├── signup/              # Signup page
│   ├── transactions/        # Transactions page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── charts/              # Chart components
│   ├── dashboard/           # Dashboard components
│   └── layout/              # Layout components
├── constants/               # Constants and configs
├── context/                 # React Context providers
├── lib/                     # Utility libraries
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## Data Storage

This application uses **localStorage** for client-side data persistence:

- `users` - User accounts with hashed passwords
- `transactions_{username}` - User transactions
- `budgets_{username}` - User budgets
- `settings_{username}` - User settings
- `currentUser` - Active session

> **Note**: For production use, replace localStorage with a proper backend database (PostgreSQL, MongoDB, etc.)

## Key Differences from Streamlit Version

| Feature | Streamlit | Next.js |
|---------|-----------|---------|
| Routing | Session state | File-based routing |
| State Management | st.session_state | React Context + useState |
| Forms | st.form() | React Hook Form |
| Data Storage | Text files (server) | localStorage (client) |
| Charts | Streamlit native | Recharts |
| Styling | Custom CSS | Tailwind CSS |
| Icons | Emojis | Lucide React |

## Currency Support

Supports 45+ currencies including:
- USD, EUR, GBP, JPY, CAD, AUD
- PKR, INR, BDT, LKR (South Asian)
- AED, SAR, QAR (Middle Eastern)
- And many more...

## Security Notes

- Passwords are hashed using SHA-256
- Security answers are also hashed
- No plain-text password storage
- Client-side validation on all forms

## Future Enhancements

- Backend API with database
- User authentication with JWT
- Export data to CSV/PDF
- Recurring transactions
- Multi-account support
- Mobile app (React Native)
- Dark mode toggle

## License

MIT License

## Author

Converted from Streamlit to Next.js by AI Assistant

---

**Note**: This is a client-side application. All data is stored in your browser's localStorage. Clear your browser data will delete all your financial information.
