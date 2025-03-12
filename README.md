# Personal Finance Visualizer - Stage 3

A comprehensive personal finance management application with advanced budgeting features, spending insights, and detailed analytics.

## Features

### Core Features
- **All Stage 1 & 2 Features**
  - Transaction management (add/edit/delete)
  - Transaction categorization
  - Transaction list view
  - Monthly expenses chart
  - Category pie chart
  - Dashboard with financial overview

### New Features
- **Budget Management**
  - Set monthly budgets for each category
  - Visual progress indicators for budget usage
  - Edit and delete budgets
  - Over-budget warnings and indicators

- **Budget vs. Actual Comparison**
  - Side-by-side comparison chart
  - Visual representation of budget adherence
  - Interactive tooltips with detailed information

- **Spending Insights**
  - Smart observations about spending habits
  - Over-budget alerts
  - Category spending analysis
  - Large transaction notifications
  - Budget recommendations

## Tech Stack

- **Frontend**
  - Next.js 
  - React 
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Recharts for data visualization

- **Backend**
  - Next.js API routes
  - MongoDB for data storage

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SVPraveen1/finance_app-stage3.git
   cd finance_app-stage3

2. Install dependencies:

    ```shellscript
    npm install
    ```


3. Create a `.env.local` file in the root directory with your MongoDB connection string:

    ```plaintext
    MONGODB_URI=your_mongodb_connection_string
    ```


4. Run the development server:

    ```shellscript
    npm run dev
    ```


5. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Usage Guide

### Managing Budgets

1. Navigate to the "Budgets" tab
2. Click "Add Budget" to create a new budget
3. Select a category and enter the monthly budget amount
4. View your budgets with progress indicators
5. Edit or delete budgets using the action buttons


### Budget vs. Actual Analysis

1. Navigate to the "Insights" tab
2. The bar chart shows your budgeted amounts versus actual spending
3. Hover over bars to see detailed information
4. Identify categories where you're over or under budget


### Viewing Spending Insights

1. Navigate to the "Insights" tab
2. Review the automatically generated insights about your spending habits
3. Pay attention to alerts about over-budget categories
4. Consider recommendations for budget adjustments


## Project Structure

```plaintext
finance-tracker-stage3/
├── app/
│   ├── api/
│   │   ├── transactions/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── budgets/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── transaction-form.tsx
│   ├── transaction-list.tsx
│   ├── transaction-edit-form.tsx
│   ├── expenses-chart.tsx
│   ├── category-chart.tsx
│   ├── dashboard.tsx
│   ├── budget-manager.tsx
│   ├── budget-comparison-chart.tsx
│   └── spending-insights.tsx
├── lib/
│   ├── mongodb.ts
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
└── public/
```

## API Endpoints

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/[id]` - Update a transaction
- `DELETE /api/transactions/[id]` - Delete a transaction


### Budgets

- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/[id]` - Update a budget
- `DELETE /api/budgets/[id]` - Delete a budget


## Data Models

### Transaction

```typescript
interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}
```

### Budget

```typescript
interface Budget {
  _id: string;
  category: string;
  amount: number;
}
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the `MONGODB_URI` environment variable in the Vercel project settings
4. Deploy the project


## Customization

### Adding New Insights

1. Open `components/spending-insights.tsx`
2. Add new insight generation logic in the `useEffect` hook:

```typescript
// Example: Add a new insight for transactions above a certain amount
if (transactions.some(t => t.amount > 500)) {
  generatedInsights.push(
    "You have some very large transactions. Consider reviewing these expenses."
  );
}
```




### Modifying Budget Visualization

- Edit the `budget-manager.tsx` and `budget-comparison-chart.tsx` files to customize the budget visualizations
- Adjust the progress indicators, colors, and chart elements


### Extending the Application

- Add income tracking functionality
- Implement savings goals
- Create recurring transaction support
- Add export/import functionality for data backup


## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**

1. Verify your connection string is correct
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that your MongoDB user has the correct permissions



2. **Budget Creation Issues**

1. Each category can only have one budget
2. Ensure you're selecting a category that doesn't already have a budget



3. **Chart Rendering Issues**

1. Charts require data to render properly
2. Add some transactions and budgets to see the visualizations


## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [MongoDB](https://www.mongodb.com/)
