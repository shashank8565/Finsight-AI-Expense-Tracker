import { api } from "./client";

export const authService = {
  login: async (credentials: any) => {
    const { data } = await api.post("/auth/login", credentials);
    return data.data;
  },
  register: async (userData: any) => {
    const { data } = await api.post("/auth/register", userData);
    return data.data;
  },
  verifyEmail: async (code: string) => {
    const { data } = await api.post("/auth/verify-email", { code });
    return data;
  },
  resendVerification: async () => {
    const { data } = await api.post("/auth/resend-verification");
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
  resetPassword: async (payload: { email: string; token: string; newPassword: string }) => {
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  },
  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post("/auth/refresh", { refreshToken });
    return data.data;
  },
  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};

export const userService = {
  getProfile: async () => {
    const { data } = await api.get("/users/me");
    return data.data;
  },
  updateProfile: async (userData: any) => {
    const { data } = await api.put("/users/me", userData);
    return data.data;
  },
  generateTelegramLinkCode: async () => {
    const { data } = await api.post("/users/telegram/link-code");
    return data.data;
  },
};

export const transactionService = {
  getTransactions: async (params?: any) => {
    const { data } = await api.get("/transactions", { params });
    return data;
  },
  createTransaction: async (transactionData: any) => {
    const { data } = await api.post("/transactions", transactionData);
    return data.data;
  },
  updateTransaction: async (id: string, transactionData: any) => {
    const { data } = await api.put(`/transactions/${id}`, transactionData);
    return data.data;
  },
  deleteTransaction: async (id: string) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data.message;
  },
};

export const categoryService = {
  getCategories: async () => {
    const { data } = await api.get("/categories");
    return data.data;
  },
  createCategory: async (categoryData: any) => {
    const { data } = await api.post("/categories", categoryData);
    return data.data;
  },
};

export const goalService = {
  getGoals: async () => {
    const { data } = await api.get("/goals");
    return data.data;
  },
  createGoal: async (goalData: any) => {
    const { data } = await api.post("/goals", goalData);
    return data.data;
  },
  updateGoal: async (id: string, goalData: any) => {
    const { data } = await api.put(`/goals/${id}`, goalData);
    return data.data;
  },
};

export const investmentService = {
  getInvestments: async () => {
    const { data } = await api.get("/investments");
    return data;
  },
  createInvestment: async (investmentData: any) => {
    const { data } = await api.post("/investments", investmentData);
    return data.data;
  },
};

export const analyticsService = {
  getDashboardSummary: async (month?: string) => {
    const { data } = await api.get("/analytics/dashboard-summary", {
      params: month ? { month } : undefined,
    });
    return data.data;
  },
  getExpenseByCategory: async (params?: any) => {
    const { data } = await api.get("/analytics/expense-by-category", { params });
    return data.data;
  },
  getCashFlow: async () => {
    const { data } = await api.get("/analytics/cash-flow");
    return data.data;
  },
  getDailyExpenses: async (month?: string) => {
    const { data } = await api.get("/analytics/daily-expenses", {
      params: month ? { month } : undefined,
    });
    return data;
  },
  getMerchantInsights: async () => {
    const { data } = await api.get("/analytics/merchant-insights");
    return data.data;
  },
};

export const aiService = {
  chat: async (message: string, conversationHistory: any[] = []) => {
    const { data } = await api.post("/ai/chat", { message, conversationHistory });
    return data.data;
  },
  getSummary: async () => {
    const { data } = await api.get("/ai/summary");
    return data.data;
  },
};
