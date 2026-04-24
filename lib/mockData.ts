export type Bill = {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
};

export type BudgetEntry = {
  category: string;
  limit: number;
};

export type Jar = {
  name: string;
  target: number;
  saved: number;
  monthlyContribution: number;
  monthsLeft: number;
};

export type Transaction = {
  date: string;
  merchant: string;
  category: string;
  amount: number;
};

export type UserData = {
  balance: number;
  income: number;
  upcomingBills: Bill[];
  categories: string[];
  budgets: BudgetEntry[];
  jars: Jar[];
  transactions: Transaction[];
};

/** Demo “today” so MTD math matches the seeded transactions (April 2026). */
export const DEMO_AS_OF = new Date("2026-04-24T12:00:00");

export const CATEGORY_COLORS: Record<string, string> = {
  groceries: "#22c55e",
  shopping: "#ec4899",
  entertainment: "#a855f7",
  eating_out: "#f97316",
  transport: "#3b82f6",
  bills: "#64748b",
  subscriptions: "#6366f1",
  savings: "#14b8a6",
};

export const userData: UserData = {
  balance: 1240,
  income: 1800,

  upcomingBills: [
    { name: "Rent", amount: 650, dueDate: "2026-04-30", category: "bills" },
    { name: "Electricity", amount: 60, dueDate: "2026-04-28", category: "bills" },
    { name: "Internet", amount: 35, dueDate: "2026-04-27", category: "bills" },
    { name: "Spotify", amount: 10, dueDate: "2026-04-26", category: "subscriptions" },
    { name: "Netflix", amount: 15, dueDate: "2026-04-26", category: "subscriptions" },
  ],

  categories: [
    "groceries",
    "shopping",
    "entertainment",
    "eating_out",
    "transport",
    "bills",
    "subscriptions",
    "savings",
  ],

  budgets: [
    { category: "groceries", limit: 200 },
    { category: "eating_out", limit: 150 },
    { category: "entertainment", limit: 100 },
    { category: "shopping", limit: 180 },
  ],

  jars: [
    {
      name: "Trip to Machu Picchu",
      target: 2400,
      saved: 420,
      monthlyContribution: 220,
      monthsLeft: 9,
    },
    {
      name: "Emergency Fund",
      target: 2000,
      saved: 500,
      monthlyContribution: 150,
      monthsLeft: 10,
    },
    {
      name: "New Laptop",
      target: 1200,
      saved: 200,
      monthlyContribution: 250,
      monthsLeft: 3,
    },
    {
      name: "Summer Trip",
      target: 1500,
      saved: 300,
      monthlyContribution: 200,
      monthsLeft: 4,
    },
  ],

  transactions: [
    { date: "2026-04-22", merchant: "Carrefour", category: "groceries", amount: 45 },
    { date: "2026-04-21", merchant: "Uber Eats", category: "eating_out", amount: 28 },
    { date: "2026-04-20", merchant: "Zara", category: "shopping", amount: 65 },
    { date: "2026-04-19", merchant: "Cinema", category: "entertainment", amount: 18 },
    { date: "2026-04-18", merchant: "Metro", category: "transport", amount: 12 },

    { date: "2026-04-17", merchant: "Lidl", category: "groceries", amount: 52 },
    { date: "2026-04-16", merchant: "McDonald's", category: "eating_out", amount: 14 },
    { date: "2026-04-15", merchant: "H&M", category: "shopping", amount: 40 },
    { date: "2026-04-14", merchant: "Bar Night", category: "entertainment", amount: 35 },
    { date: "2026-04-13", merchant: "Bus Ticket", category: "transport", amount: 10 },

    { date: "2026-04-12", merchant: "Aldi", category: "groceries", amount: 38 },
    { date: "2026-04-11", merchant: "Domino's Pizza", category: "eating_out", amount: 22 },
    { date: "2026-04-10", merchant: "Amazon", category: "shopping", amount: 75 },
    { date: "2026-04-09", merchant: "Concert Ticket", category: "entertainment", amount: 60 },
    { date: "2026-04-08", merchant: "Uber", category: "transport", amount: 18 },

    { date: "2026-04-07", merchant: "Carrefour", category: "groceries", amount: 41 },
    { date: "2026-04-06", merchant: "Cafe", category: "eating_out", amount: 9 },
    { date: "2026-04-05", merchant: "Pull&Bear", category: "shopping", amount: 55 },
    { date: "2026-04-04", merchant: "Club Entry", category: "entertainment", amount: 25 },
    { date: "2026-04-03", merchant: "Metro", category: "transport", amount: 12 },

    { date: "2026-04-02", merchant: "Mercadona", category: "groceries", amount: 47 },
    { date: "2026-04-01", merchant: "KFC", category: "eating_out", amount: 16 },
    { date: "2026-03-31", merchant: "Bershka", category: "shopping", amount: 39 },
    { date: "2026-03-30", merchant: "Netflix Night", category: "entertainment", amount: 8 },
    { date: "2026-03-29", merchant: "Taxi", category: "transport", amount: 20 },

    { date: "2026-03-28", merchant: "Lidl", category: "groceries", amount: 50 },
    { date: "2026-03-27", merchant: "Burger King", category: "eating_out", amount: 13 },
    { date: "2026-03-26", merchant: "ASOS", category: "shopping", amount: 82 },
    { date: "2026-03-25", merchant: "Cinema", category: "entertainment", amount: 20 },
    { date: "2026-03-24", merchant: "Bus Ticket", category: "transport", amount: 9 },

    { date: "2026-03-23", merchant: "Aldi", category: "groceries", amount: 36 },
    { date: "2026-03-22", merchant: "Starbucks", category: "eating_out", amount: 7 },
    { date: "2026-03-21", merchant: "Nike", category: "shopping", amount: 90 },
    { date: "2026-03-20", merchant: "Bar Night", category: "entertainment", amount: 42 },
    { date: "2026-03-19", merchant: "Uber", category: "transport", amount: 17 },

    { date: "2026-03-18", merchant: "Carrefour", category: "groceries", amount: 43 },
    { date: "2026-03-17", merchant: "Pizza Place", category: "eating_out", amount: 19 },
    { date: "2026-03-16", merchant: "Zalando", category: "shopping", amount: 70 },
    { date: "2026-03-15", merchant: "Concert", category: "entertainment", amount: 55 },
    { date: "2026-03-14", merchant: "Metro", category: "transport", amount: 12 },

    { date: "2026-03-13", merchant: "Lidl", category: "groceries", amount: 48 },
    { date: "2026-03-12", merchant: "McDonald's", category: "eating_out", amount: 11 },
    { date: "2026-03-11", merchant: "Uniqlo", category: "shopping", amount: 60 },
    { date: "2026-03-10", merchant: "Club", category: "entertainment", amount: 30 },
    { date: "2026-03-09", merchant: "Taxi", category: "transport", amount: 22 },
  ],
};
