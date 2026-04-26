import { BarChart3, Receipt, Loader2 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../api/services";

const COLORS = ["#FF6B6B", "#C8FF00", "#7B61FF", "#00E5A0", "#FFB800", "#4B9FFF", "#FF6B6B", "#C8FF00"];

const taxSavings = [
  { name: "80C (PPF, ELSS)", current: 45000, limit: 150000 },
  { name: "HRA", current: 72000, limit: 72000 },
  { name: "Medical (80D)", current: 8000, limit: 25000 },
];

export function Reports() {
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["expense-by-category"],
    queryFn: () => analyticsService.getExpenseByCategory(),
  });

  const { data: cashFlowData, isLoading: isCashFlowLoading } = useQuery({
    queryKey: ["cash-flow"],
    queryFn: analyticsService.getCashFlow,
  });

  if (isCategoryLoading || isCashFlowLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C8FF00] animate-spin" />
      </div>
    );
  }

  const rawCategory = categoryData || [];
  const spendingData = rawCategory.map((item: any) => ({
    category: item.name || item.category || "Other",
    totalAmount: item.total || item.totalAmount || 0,
    icon: item.icon || "",
  }));
  const monthlyComparison = cashFlowData || [];

  const totalExpense = spendingData.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);

  const salaryBreakdown = spendingData.map((item: any, index: number) => ({
    name: item.category,
    value: item.totalAmount,
    percent: totalExpense > 0 ? Number(((item.totalAmount / totalExpense) * 100).toFixed(1)) : 0,
    color: COLORS[index % COLORS.length]
  }));

  const categoryPieData = salaryBreakdown;

  const savingsTrajectory = monthlyComparison.map((m: any) => ({
    month: `${m.month}/${m.year}`,
    actual: m.income - m.expense,
    target: 15000, // Hardcoded target for now, ideally fetch from user settings
  }));

  const chartData = monthlyComparison.map((m: any) => ({
    month: `${m.month}/${m.year}`,
    spent: m.expense,
    saved: m.income - m.expense,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-10 h-10 text-[#C8FF00]" />
        <h1 className="text-[32px] sm:text-[40px] font-bold text-white">Reports & Analytics</h1>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
        <h3 className="text-[20px] font-semibold text-white mb-6">"Where did my money go?"</h3>
        {salaryBreakdown.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="text-sm text-white/60 w-24">Expenses</div>
              <div className="flex-1 h-12 bg-white/5 rounded-xl flex overflow-hidden">
                {salaryBreakdown.map((item: any) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-center text-white text-xs font-semibold transition-all hover:opacity-80"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    title={`${item.name}: ₹${(item.value || 0).toLocaleString()} (${item.percent}%)`}
                  >
                    {item.percent > 10 && item.percent + "%"}
                  </div>
                ))}
              </div>
              <div className="text-white font-bold w-32 text-left sm:text-right">₹{(totalExpense || 0).toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4">
              {salaryBreakdown.map((item: any) => (
                <div key={item.name} className="text-center">
                  <div className="w-4 h-4 rounded mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
                  <div className="text-xs text-white/60 mb-1">{item.name}</div>
                  <div className="font-bold text-white">₹{(item.value / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-white/60">{item.percent}%</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-white/40 text-center py-6">No expense data available</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <h3 className="text-[20px] font-semibold text-white mb-4">Month-over-Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.6)" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#12121A', borderColor: '#333', color: '#fff' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="spent" fill="#FF6B6B" radius={[4, 4, 0, 0]} name="Spent" maxBarSize={40} />
              <Bar dataKey="saved" fill="#00E5A0" radius={[4, 4, 0, 0]} name="Saved" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <h3 className="text-[20px] font-semibold text-white mb-4">Savings Trajectory</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={savingsTrajectory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.6)" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#333', color: '#fff' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="actual" stroke="#C8FF00" strokeWidth={3} name="Actual" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeDasharray="5 5" name="Target" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <h3 className="text-[20px] font-semibold text-white mb-4">Category Distribution</h3>
          {categoryPieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="w-full sm:w-1/2 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      dataKey="percent"
                    >
                      {categoryPieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#333' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 w-full sm:w-1/2 mt-4 sm:mt-0 px-4">
                {categoryPieData.map((item: any) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-white/80">{item.name}</span>
                    <span className="text-white font-semibold ml-auto">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="text-white/40 text-center py-6">No data available</div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-6 h-6 text-[#C8FF00]" />
            <h3 className="text-[20px] font-semibold text-white">Tax Saving Summary</h3>
          </div>
          <div className="space-y-4">
            {taxSavings.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-sm text-white/60">
                    ₹{(item.current || 0).toLocaleString()} / ₹{(item.limit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C8FF00] to-[#00E5A0]"
                    style={{ width: `${(item.current / item.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-xl">
              <div className="text-white/80 text-sm mb-1">Potential Tax Saved</div>
              <div className="text-3xl font-bold text-[#C8FF00]">₹18,500</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
