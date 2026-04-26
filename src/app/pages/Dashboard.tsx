import { useState } from "react";
import { Flame, TrendingUp, Target, Sparkles, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { analyticsService, transactionService } from "../../api/services";

const COLORS = ["#FF6B6B", "#C8FF00", "#7B61FF", "#00E5A0", "#FFB800", "#4B9FFF"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/** Returns a color based on expense amount relative to daily average */
const getExpenseColor = (amount: number, avg: number) => {
  if (amount === 0) return "bg-white/5 border-white/5";
  if (amount <= avg * 0.5) return "bg-[#00E5A0]/30 border-[#00E5A0]/30";
  if (amount <= avg) return "bg-[#C8FF00]/25 border-[#C8FF00]/30";
  if (amount <= avg * 1.5) return "bg-[#FFB800]/25 border-[#FFB800]/30";
  return "bg-[#FF6B6B]/30 border-[#FF6B6B]/30";
};

export function Dashboard() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [merchantPage, setMerchantPage] = useState(0);

  // Parse selectedMonth
  const [selYear, selMon] = selectedMonth.split('-').map(Number);
  const isCurrentMonth = selYear === now.getFullYear() && selMon === now.getMonth() + 1;

  // Month navigation
  const goToPrevMonth = () => {
    const d = new Date(selYear, selMon - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const goToNextMonth = () => {
    if (!isCurrentMonth) {
      const d = new Date(selYear, selMon, 1);
      setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  // Compute date range for category & transaction queries (YYYY-MM-DD avoids timezone issues)
  const daysInMonth = new Date(selYear, selMon, 0).getDate();
  const startDate = `${selYear}-${String(selMon).padStart(2, '0')}-01`;
  const endDate = `${selYear}-${String(selMon).padStart(2, '0')}-${daysInMonth}`;

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["dashboard-summary", selectedMonth],
    queryFn: () => analyticsService.getDashboardSummary(selectedMonth),
  });

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["expense-by-category", selectedMonth],
    queryFn: () => analyticsService.getExpenseByCategory({ startDate, endDate }),
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["transactions", "recent", selectedMonth],
    queryFn: () => transactionService.getTransactions({ limit: 5, startDate, endDate }),
  });

  const { data: dailyExpenseData } = useQuery({
    queryKey: ["daily-expenses", selectedMonth],
    queryFn: () => analyticsService.getDailyExpenses(selectedMonth),
  });

  const { data: merchantData, isLoading: isMerchantLoading } = useQuery({
    queryKey: ["merchant-insights"],
    queryFn: analyticsService.getMerchantInsights,
  });

  const summary = {
    totalIncome: summaryData?.totalIncome || 0,
    totalExpense: summaryData?.totalExpense || 0,
    savingsRate: parseFloat(summaryData?.savingsRate) || 0,
    budgetGoal: summaryData?.goals?.totalTarget || 0,
    currentStreak: summaryData?.streak || 0,
    netSavings: summaryData?.netSavings || 0,
  };

  // Merchant Brand Icons/Colors Mapping
  const merchantConfig: Record<string, { icon: string, color: string }> = {
    swiggy: { icon: "🟠", color: "#FC8019" },
    zomato: { icon: "🔴", color: "#CB202D" },
    amazon: { icon: "🟡", color: "#FF9900" },
    uber: { icon: "⬛", color: "#000000" },
    blinkit: { icon: "🟡", color: "#F7D107" },
    zepto: { icon: "🟣", color: "#7F37C9" },
    netflix: { icon: "🎥", color: "#E50914" },
    spotify: { icon: "🟢", color: "#1DB954" },
    myntra: { icon: "💖", color: "#F13AB1" },
    flipkart: { icon: "🔵", color: "#2874F0" },
  };

  // Normalize API response: backend returns {name, total} or {category, totalAmount}
  const rawCategory = categoryData || [];
  const spendingData = rawCategory.map((item: any) => ({
    category: item.name || item.category || "Other",
    totalAmount: item.total || item.totalAmount || 0,
    icon: item.icon || "",
    percentage: item.percentage || "0",
  }));
  const recentExpenses = transactionsData?.data || [];
  const merchants = merchantData || [];
  
  const budgetProgress = summary.budgetGoal > 0 ? (summary.totalExpense / summary.budgetGoal) * 100 : 0;

  if (isSummaryLoading || isCategoryLoading || isTransactionsLoading || isMerchantLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C8FF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] sm:text-[40px] font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60 italic">"Wealth consists not in having great possessions, but in having few wants."</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xl">
          <button onClick={goToPrevMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-[160px] justify-center">
            <Calendar className="w-4 h-4 text-[#C8FF00]" />
            <span className="text-white font-semibold text-sm">
              {MONTH_NAMES[selMon - 1]} {selYear}
            </span>
            {isCurrentMonth && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full font-medium">Now</span>
            )}
          </div>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            className={`p-1.5 rounded-lg transition-all ${isCurrentMonth ? 'text-white/20 cursor-not-allowed' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 font-medium">Total Spent</span>
            <div className="w-10 h-10 rounded-xl bg-[#FF6B6B]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#FF6B6B]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-[#FF6B6B]">₹{summary.totalExpense.toLocaleString()}</div>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 font-medium">Income</span>
            <div className="w-10 h-10 rounded-xl bg-[#00E5A0]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00E5A0]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-[#00E5A0]">₹{summary.totalIncome.toLocaleString()}</div>
          <div className="text-sm text-white/60 mt-2">Savings Rate: {summary.savingsRate}%</div>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 font-medium">Budget Goal</span>
            <div className="w-10 h-10 rounded-xl bg-[#C8FF00]/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#C8FF00]" />
            </div>
          </div>
          <div className="relative pt-2">
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${budgetProgress > 100 ? 'bg-[#FF6B6B]' : 'bg-[#C8FF00]'}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm font-bold text-white">{budgetProgress.toFixed(0)}%</div>
              <div className="text-xs text-white/60">of ₹{summary.budgetGoal.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 font-medium">Streak</span>
            <div className="w-10 h-10 rounded-xl bg-[#FF6B6B]/10 flex items-center justify-center">
               <Flame className="w-6 h-6 text-[#FF6B6B]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-white">{summary.currentStreak} days</div>
          <div className="text-sm text-white/60 mt-2">Keep it up!</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="col-span-1 lg:col-span-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <h3 className="text-[20px] font-semibold text-white mb-6">Spending Breakdown</h3>
          {spendingData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="w-full sm:w-1/2 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="totalAmount"
                      nameKey="category"
                    >
                      {spendingData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#12121A', borderColor: '#333' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`₹${(value || 0).toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 w-full sm:w-1/2 mt-6 sm:mt-0 px-4">
                {spendingData.map((item: any, index: number) => (
                  <div key={item.category} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-white/80 truncate">{item.category}</span>
                    </div>
                    <span className="font-semibold text-white whitespace-nowrap">₹{(item.totalAmount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-white/40">
              No expenses recorded yet.
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Smart Merchant Insights */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#7B61FF]" />
                <h3 className="text-[18px] font-semibold text-white">Merchant Insights</h3>
              </div>
              {merchants.length > 0 && (
                <span className="text-xs text-white/40">{merchants.length} merchants</span>
              )}
            </div>
            
            {(() => {
              const MERCHANT_PER_PAGE = 5;
              const totalMerchantPages = Math.ceil(merchants.length / MERCHANT_PER_PAGE);
              const currentMerchants = merchants.slice(merchantPage * MERCHANT_PER_PAGE, (merchantPage + 1) * MERCHANT_PER_PAGE);

              return (
                <>
                  <div className="space-y-3 flex-1">
                    {currentMerchants.length > 0 ? (
                      currentMerchants.map((m: any) => {
                        const config = merchantConfig[m.merchant.toLowerCase()] || { icon: "🛍️", color: "#fff" };
                        return (
                          <div key={m.merchant} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg border border-white/10">
                                {config.icon}
                              </div>
                              <div>
                                <div className="text-white font-medium capitalize">{m.merchant}</div>
                                <div className="text-xs text-white/40">{m.count} order{m.count !== 1 ? 's' : ''} this month</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">₹{m.total.toLocaleString()}</div>
                              <div className={`text-[10px] font-medium ${m.trend > 0 ? 'text-[#FF6B6B]' : 'text-[#00E5A0]'}`}>
                                {m.trendText}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-white/40 text-sm">
                        Add merchants to your expenses to see brand insights.
                      </div>
                    )}
                  </div>

                  {totalMerchantPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
                      <button
                        onClick={() => setMerchantPage((p) => Math.max(0, p - 1))}
                        disabled={merchantPage === 0}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${merchantPage === 0 ? 'text-white/20 cursor-not-allowed' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'}`}
                      >
                        ← Prev
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalMerchantPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setMerchantPage(i)}
                            className={`w-2 h-2 rounded-full transition-all ${merchantPage === i ? 'bg-[#C8FF00] w-5' : 'bg-white/20 hover:bg-white/40'}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setMerchantPage((p) => Math.min(totalMerchantPages - 1, p + 1))}
                        disabled={merchantPage === totalMerchantPages - 1}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${merchantPage === totalMerchantPages - 1 ? 'text-white/20 cursor-not-allowed' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'}`}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="bg-gradient-to-br from-[#1A0A2E] to-[#0A0A0F] border border-white/10 backdrop-blur-xl rounded-[20px] p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8FF00]/10 blur-[50px] rounded-full"></div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[#C8FF00]" />
              <h3 className="text-[18px] font-semibold text-white">Smart Alerts</h3>
            </div>
            <div className="space-y-4 relative z-10">
              {merchants.length > 0 && merchants[0].trend > 0 && (
                <div className="flex gap-4 items-start bg-[#FF6B6B]/5 border border-[#FF6B6B]/10 p-3 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B6B] mt-2 shrink-0"></div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    You've ordered from <strong className="text-white">{merchants[0].merchant}</strong> {merchants[0].count} times this month. That's a {merchants[0].trend}% increase!
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-[#00E5A0] mt-2 shrink-0"></div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {budgetProgress < 100 
                    ? `Great job! You're currently under your budget goal. Consider saving the remaining ₹${Math.max(0, summary.budgetGoal - summary.totalExpense).toLocaleString()}.`
                    : `You've exceeded your budget goal. Try to minimize spending for the rest of the month.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[20px] font-semibold text-white">Recent Expenses</h3>
          </div>
          <div className="space-y-4">
            {recentExpenses.length > 0 ? (
              recentExpenses.filter((e: any) => e.type === 'expense').map((expense: any) => (
                <div key={expense._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                       {expense.category?.icon || '💸'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{expense.description}</div>
                      <div className="text-xs text-white/60">
                        {expense.category?.name || 'Uncategorized'} • {format(new Date(expense.date), "MMM dd")}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#FF6B6B] font-semibold whitespace-nowrap">-₹{(expense.amount || 0).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-white/40">No recent expenses</div>
            )}
          </div>
        </div>

        {/* Expense Calendar */}
        {(() => {
          const dailyData = dailyExpenseData?.data || [];
          const monthStr = dailyExpenseData?.month || selectedMonth;
          const [cYear, cMonth] = monthStr.split('-').map(Number);
          const daysInMonth = new Date(cYear, cMonth, 0).getDate();
          const firstDayOfWeek = new Date(cYear, cMonth - 1, 1).getDay(); // 0=Sun
          const todayDate = new Date();
          const isCalCurrentMonth = todayDate.getFullYear() === cYear && todayDate.getMonth() + 1 === cMonth;
          const todayDay = todayDate.getDate();

          // Build daily map
          const dayMap: Record<number, { total: number; count: number }> = {};
          dailyData.forEach((d: any) => { dayMap[d.day] = { total: d.total, count: d.count }; });

          // Calculate daily average for color thresholds
          const totalSpent = dailyData.reduce((s: number, d: any) => s + d.total, 0);
          const daysWithExpenses = dailyData.filter((d: any) => d.total > 0).length;
          const dailyAvg = daysWithExpenses > 0 ? totalSpent / daysWithExpenses : 1000;

          // Build calendar grid cells
          const cells: (null | { day: number; total: number; count: number })[] = [];
          for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, total: dayMap[d]?.total || 0, count: dayMap[d]?.count || 0 });
          }
          // Pad to fill last row
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C8FF00]" />
                  <h3 className="text-[20px] font-semibold text-white">Expense Calendar</h3>
                </div>
                <span className="text-white/60 text-sm font-medium">
                  {MONTH_NAMES[cMonth - 1]} {cYear}
                </span>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {WEEKDAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-xs text-white/40 font-medium py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((cell, i) => {
                  if (!cell) {
                    return <div key={`empty-${i}`} className="aspect-square rounded-lg" />;
                  }
                  const isToday = isCalCurrentMonth && cell.day === todayDay;
                  const isFuture = isCalCurrentMonth && cell.day > todayDay;
                  return (
                    <div
                      key={cell.day}
                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all relative group ${
                        isFuture
                          ? 'bg-black/[0.bg-white/[0.02] border-white/5 opacity-40'
                          : getExpenseColor(cell.total, dailyAvg)
                      } ${isToday ? 'ring-2 ring-[#C8FF00] ring-offset-1 ring-offset-[#0A0A0F]' : ''}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? 'text-[#C8FF00]' : 'text-white/70'}`}>{cell.day}</span>
                      {cell.total > 0 && (
                        <span className="text-[10px] text-white/50 font-medium">
                          {cell.total >= 1000 ? `${(cell.total / 1000).toFixed(1)}k` : `₹${cell.total}`}
                        </span>
                      )}
                      {/* Tooltip */}
                      {cell.total > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                          <div className="text-white font-semibold">₹{cell.total.toLocaleString()}</div>
                          <div className="text-white/50">{cell.count} transaction{cell.count !== 1 ? 's' : ''}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend + Total */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#00E5A0]/30"></div>
                    <span className="text-white/50">Low</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#C8FF00]/25"></div>
                    <span className="text-white/50">Normal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#FFB800]/25"></div>
                    <span className="text-white/50">High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#FF6B6B]/30"></div>
                    <span className="text-white/50">Very High</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-white/50">Total: </span>
                  <span className="text-white font-bold">₹{totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
