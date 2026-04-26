# Finsight AI Expense Tracker - Backend API Documentation

This document outlines the RESTful API endpoints required to build the backend for the **Finsight Expense Tracker** application. It excludes AI-specific endpoints (like `AIInsights`) as requested. The purpose of this document is to serve as a comprehensive guide for an AI (or human) to generate the database schema, models, and controllers needed for the backend.

---

## 1. Authentication & User Management
These APIs handle user registration, login, and managing user profiles/preferences from the `Onboarding` and `Settings` pages.

### `POST /api/auth/register`
- **Purpose**: Creates a new user account.
- **Why we need it**: During the `Onboarding` phase, new users need to create an account to start tracking their finances securely. It should initialize default categories and preferences for the user.

### `POST /api/auth/login`
- **Purpose**: Authenticates a user and returns a token (e.g., JWT).
- **Why we need it**: Secures the application so that only authenticated users can access their financial data.

### `GET /api/users/me`
- **Purpose**: Fetches the currently authenticated user's profile and settings.
- **Why we need it**: The frontend needs to display the user's name, profile picture, and load their preferences (like default currency, theme, notification settings) in the `Settings` and `Dashboard` pages.

### `PUT /api/users/me`
- **Purpose**: Updates the user's profile or settings.
- **Why we need it**: When a user changes their currency, updates their name, or toggles notifications in the `Settings` page, these changes need to be persisted to the database.

---

## 2. Transactions (Expenses & Incomes)
These APIs power the `Expenses` page and are the core of the financial tracking system.

### `POST /api/transactions`
- **Purpose**: Adds a new transaction (either an expense or income).
- **Why we need it**: The user needs a way to log money spent or earned. The payload will include the amount, date, category ID, type (income/expense), and an optional note.

### `GET /api/transactions`
- **Purpose**: Retrieves a list of transactions for the authenticated user.
- **Why we need it**: The `Expenses` page displays a history of all transactions. This API must support query parameters for filtering (e.g., `?startDate=2023-01-01&endDate=2023-01-31&type=expense&categoryId=5`) and pagination so the frontend can display data efficiently.

### `GET /api/transactions/:id`
- **Purpose**: Retrieves a single transaction's details.
- **Why we need it**: When a user clicks on a transaction to view its full details or open an edit modal, the frontend needs the complete data object.

### `PUT /api/transactions/:id`
- **Purpose**: Updates an existing transaction.
- **Why we need it**: Users make mistakes. They need to be able to fix the amount, change the category, or update the date of a past transaction.

### `DELETE /api/transactions/:id`
- **Purpose**: Deletes a transaction.
- **Why we need it**: Allows users to remove duplicated or incorrectly entered transactions.

---

## 3. Categories
Categories are used to group transactions (e.g., "Food", "Rent", "Salary").

### `GET /api/categories`
- **Purpose**: Retrieves all available categories for the user.
- **Why we need it**: When a user is adding a new transaction, the frontend needs a list of categories to populate the dropdown menu. It should return both default system categories and any custom categories the user created.

### `POST /api/categories`
- **Purpose**: Creates a custom category.
- **Why we need it**: Users may want to track expenses for specific niches (e.g., "Dog Toys") that aren't included in the default list.

---

## 4. Financial Goals
These APIs power the `Goals` page, where users save towards specific targets (e.g., "Buy a Car", "Emergency Fund").

### `POST /api/goals`
- **Purpose**: Creates a new financial goal.
- **Why we need it**: The user needs to define what they are saving for, the target amount, and the target date.

### `GET /api/goals`
- **Purpose**: Retrieves all active and completed goals.
- **Why we need it**: The `Goals` page lists all goals and shows progress bars indicating how close the user is to their target amount.

### `PUT /api/goals/:id`
- **Purpose**: Updates a goal (e.g., adding saved money, changing the target).
- **Why we need it**: As the user saves money, they need to log contributions towards the goal, updating the `currentAmount` field.

### `DELETE /api/goals/:id`
- **Purpose**: Deletes or cancels a goal.
- **Why we need it**: If a user abandons a goal or makes a mistake, they need to remove it from their list.

---

## 5. Investments
These APIs power the `Investments` page, tracking portfolio assets like stocks, mutual funds, or crypto.

### `POST /api/investments`
- **Purpose**: Adds a new investment asset to the portfolio.
- **Why we need it**: Users need to record what they bought (e.g., "AAPL Stock"), the quantity, purchase price, and date.

### `GET /api/investments`
- **Purpose**: Retrieves the user's investment portfolio.
- **Why we need it**: The `Investments` page needs to display a list of all assets the user holds, including their current calculated value.

### `PUT /api/investments/:id`
- **Purpose**: Updates an investment (e.g., logging a sale, updating current market value).
- **Why we need it**: Allows users to adjust their holdings or update the current valuation if it's not being automatically fetched from a 3rd party market API.

### `DELETE /api/investments/:id`
- **Purpose**: Removes an investment from the portfolio.
- **Why we need it**: To delete incorrect entries.

---

## 6. Dashboard & Reports (Analytics)
These are aggregated endpoints. Instead of the frontend downloading thousands of transactions and doing the math, the backend calculates the summaries. This powers the `Dashboard` and `Reports` pages.

### `GET /api/analytics/dashboard-summary`
- **Purpose**: Retrieves high-level KPIs for the current month.
- **Why we need it**: The `Dashboard` needs to instantly display "Total Balance", "Monthly Income", "Monthly Expenses", and "Savings Rate" without heavy client-side computation.

### `GET /api/analytics/expense-by-category`
- **Purpose**: Retrieves the sum of expenses grouped by category for a given date range.
- **Why we need it**: The `Reports` and `Dashboard` pages use this data to render Pie Charts or Doughnut Charts showing where the user's money is going.

### `GET /api/analytics/cash-flow`
- **Purpose**: Retrieves income vs. expenses grouped by month (or week).
- **Why we need it**: The `Reports` page uses this to render Bar Charts or Line Graphs comparing historical income against historical spending, helping the user visualize trends.
