import { useState } from "react";
import { Flame, Trophy, Lock, Award, Target, Zap, TrendingUp, Plus, Loader2, Coins, ShoppingBag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalService, userService, analyticsService } from "../../api/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "sonner";

export function Goals() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contributeAmount, setContributeAmount] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // Fetch profile for streak, score
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  // Fetch dashboard summary for streak
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: analyticsService.getDashboardSummary,
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: goalService.getGoals,
  });

  // Fetch merchant insights
  const { data: merchantData } = useQuery({
    queryKey: ["merchant-insights"],
    queryFn: analyticsService.getMerchantInsights,
  });

  const createMutation = useMutation({
    mutationFn: goalService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setIsAddModalOpen(false);
      setName("");
      setTargetAmount("");
      setTargetDate("");
      toast.success("Goal added successfully");
    },
    onError: () => {
      toast.error("Failed to add goal");
    }
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      goalService.updateGoal(id, { addAmount: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setIsContributeModalOpen(false);
      setContributeAmount("");
      setSelectedGoal(null);
      toast.success("Contribution added!");
    },
    onError: () => {
      toast.error("Failed to add contribution");
    }
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      targetAmount: Number(targetAmount),
      targetDate: new Date(targetDate).toISOString(),
    });
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoal && contributeAmount) {
      contributeMutation.mutate({
        id: selectedGoal._id,
        amount: Number(contributeAmount),
      });
    }
  };

  const openContributeModal = (goal: any) => {
    setSelectedGoal(goal);
    setContributeAmount("");
    setIsContributeModalOpen(true);
  };

  // Live data
  const streak = dashboardData?.streak || profile?.streak || 0;
  const score = dashboardData?.score || profile?.score || 0;

  const totalSaved = goals.reduce((acc: number, g: any) => acc + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((acc: number, g: any) => acc + (g.targetAmount || 0), 0);
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Generate streak calendar from actual streak count
  const generateStreakCalendar = (currentStreak: number) => {
    const calendar: number[][] = [];
    const today = new Date();
    const dayOfMonth = today.getDate();
    // Fill calendar: last N days = 1 (tracked), rest = 0
    const totalDays = 28; // 4 weeks
    const days: number[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      days.push(i < currentStreak ? 1 : 0);
    }
    days.reverse();
    for (let i = 0; i < 4; i++) {
      calendar.push(days.slice(i * 7, (i + 1) * 7));
    }
    return calendar;
  };

  const streakCalendar = generateStreakCalendar(streak);

  // Dynamic badges based on real data
  const completedGoals = goals.filter((g: any) => g.status === "completed").length;
  const badges = [
    {
      name: "Budget Hero",
      desc: "Stay under budget for 3 months",
      earned: totalSaved > 0 && totalProgress < 100,
      color: "#C8FF00",
      icon: Trophy,
    },
    {
      name: "First Goal",
      desc: "Create your first savings goal",
      earned: goals.length > 0,
      color: "#00E5A0",
      icon: Target,
    },
    {
      name: "Goal Crusher",
      desc: "Complete a savings goal",
      earned: completedGoals > 0,
      color: "#7B61FF",
      icon: Award,
      progress: completedGoals > 0 ? 100 : goals.length > 0 ? Math.round(totalProgress) : 0,
    },
    {
      name: "₹10K Saver",
      desc: "Save ₹10,000 across all goals",
      earned: totalSaved >= 10000,
      color: "#FFB800",
      icon: Coins,
      progress: totalSaved >= 10000 ? 100 : Math.min(Math.round((totalSaved / 10000) * 100), 99),
    },
    {
      name: "7-Day Streak",
      desc: "Track expenses for 7 days straight",
      earned: streak >= 7,
      color: "#FF6B6B",
      icon: Flame,
      progress: streak >= 7 ? 100 : Math.round((streak / 7) * 100),
    },
    {
      name: "30-Day Streak",
      desc: "Track expenses for 30 days straight",
      earned: streak >= 30,
      color: "#4B9FFF",
      icon: Zap,
      progress: streak >= 30 ? 100 : Math.round((streak / 30) * 100),
    },
  ];

  // Merchant Brand Icons/Colors Mapping
  const merchantConfig: Record<string, { icon: string; color: string }> = {
    swiggy: { icon: "🟠", color: "#FC8019" },
    zomato: { icon: "🔴", color: "#CB202D" },
    amazon: { icon: "📦", color: "#FF9900" },
    uber: { icon: "🚗", color: "#000000" },
    ola: { icon: "🟢", color: "#1C8C3C" },
    blinkit: { icon: "🟡", color: "#F7D107" },
    zepto: { icon: "🟣", color: "#7F37C9" },
    netflix: { icon: "🎥", color: "#E50914" },
    spotify: { icon: "🎵", color: "#1DB954" },
    myntra: { icon: "👗", color: "#F13AB1" },
    flipkart: { icon: "🛒", color: "#2874F0" },
    bigbasket: { icon: "🥬", color: "#84C225" },
    jio: { icon: "📱", color: "#0A3A7D" },
    paytm: { icon: "💳", color: "#00BAF2" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-10 h-10 text-[#C8FF00]" />
          <h1 className="text-[32px] sm:text-[40px] font-bold text-white">Goals & Gamification</h1>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all">
              <Plus className="w-5 h-5" />
              Add Goal
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121A] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="e.g., Emergency Fund"
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                  <input
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    type="number"
                    min="1"
                    placeholder="0"
                    className="w-full h-[44px] pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Target Date</label>
                <input
                  required
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3 mt-2 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all flex items-center justify-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Goal
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Streak & Progress Hero */}
      <div className="bg-gradient-to-br from-[#C8FF00]/10 to-[#00E5A0]/10 border border-[#C8FF00]/20 backdrop-blur-xl rounded-[20px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFB800] flex items-center justify-center">
                <Flame className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-[#C8FF00] rounded-full flex items-center justify-center text-[#0A0A0F] font-bold text-lg sm:text-xl">
                {streak}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-2">Current Streak</div>
              <div className="text-[56px] sm:text-[72px] font-bold text-white leading-none">{streak}</div>
              <div className="text-lg sm:text-xl text-white/80">
                {streak === 0 ? "Add an expense to start!" : "Days tracked in a row!"}
              </div>
              <div className="text-sm text-[#C8FF00] mt-1">Score: {(score || 0).toLocaleString()} pts</div>
            </div>
          </div>

          <div className="text-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#C8FF00"
                  strokeWidth="20"
                  strokeDasharray="502"
                  strokeDashoffset={502 - (502 * Math.min(totalProgress, 100)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[32px] sm:text-[40px] font-bold text-[#C8FF00]">
                  {totalSaved >= 100000 ? `₹${(totalSaved / 100000).toFixed(1)}L` : `₹${(totalSaved / 1000).toFixed(1)}K`}
                </div>
                <div className="text-sm text-white/60">
                  of {totalTarget >= 100000 ? `₹${(totalTarget / 100000).toFixed(1)}L` : `₹${(totalTarget / 1000).toFixed(1)}K`}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 hidden lg:block">
            {streakCalendar.map((week, i) => (
              <div key={i} className="flex gap-2">
                {week.map((day, j) => (
                  <div
                    key={j}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded ${
                      day === 1 ? "bg-[#00E5A0]" : "bg-white/10"
                    }`}
                    title={day === 1 ? "Tracked!" : "Missed"}
                  ></div>
                ))}
              </div>
            ))}
            <div className="text-xs text-white/60 text-center pt-2">Last 28 days</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Your Badges</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.name}
                className={`bg-white/5 border backdrop-blur-xl rounded-[20px] p-6 text-center transition-all ${
                  badge.earned
                    ? "border-white/20 hover:scale-105 shadow-lg"
                    : "border-white/5 opacity-60"
                }`}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative ${
                    badge.earned ? "" : "grayscale"
                  }`}
                  style={{ backgroundColor: badge.earned ? `${badge.color}20` : "rgba(255,255,255,0.05)" }}
                >
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: badge.earned ? badge.color : "rgba(255,255,255,0.3)" }} />
                  {!badge.earned && <Lock className="absolute w-5 h-5 text-white/40 -bottom-1 -right-1" />}
                </div>
                <h4 className="font-bold text-white mb-1">{badge.name}</h4>
                <p className="text-xs sm:text-sm text-white/60 mb-2">{badge.desc}</p>
                {!badge.earned && badge.progress !== undefined && (
                  <div className="mt-3">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${badge.progress}%`, backgroundColor: badge.color }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/60 mt-1">{badge.progress}% complete</div>
                  </div>
                )}
                {badge.earned && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#00E5A0]/10 border border-[#00E5A0]/20 rounded-full">
                    <span className="text-[#00E5A0] text-xs font-semibold">✓ Earned</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <h3 className="text-[20px] font-semibold text-white mb-4">Your Goals</h3>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
            </div>
          ) : goals.length === 0 ? (
            <div className="py-8 text-center text-white/60">
              No goals found. Create one to start saving!
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map((goal: any) => {
                const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                return (
                  <div key={goal._id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{goal.icon || "🎯"}</span>
                        <div>
                          <span className="text-white font-medium">{goal.name}</span>
                          {goal.status === "completed" && (
                            <span className="ml-2 text-xs bg-[#00E5A0]/10 text-[#00E5A0] px-2 py-0.5 rounded-full">Completed</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${goal.status === "completed" ? "text-[#00E5A0]" : "text-[#C8FF00]"}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: goal.status === "completed" ? "#00E5A0" : goal.color || "#C8FF00"
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">
                        <span className="text-white font-medium">₹{(goal.currentAmount || 0).toLocaleString()}</span>
                        {" / ₹"}{(goal.targetAmount || 0).toLocaleString()}
                      </div>
                      {goal.status !== "completed" && (
                        <button
                          onClick={() => openContributeModal(goal)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8FF00]/10 border border-[#C8FF00]/20 text-[#C8FF00] rounded-lg text-sm font-medium hover:bg-[#C8FF00]/20 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Money
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag className="w-5 h-5 text-[#7B61FF]" />
            <h3 className="text-[20px] font-semibold text-white">Smart Merchant Insights</h3>
          </div>

          {(() => {
            const merchants = merchantData || [];
            if (merchants.length === 0) {
              return (
                <div className="py-8 text-center text-white/40 text-sm">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-white/20" />
                  <p>No merchant data yet.</p>
                  <p className="mt-1">Add a merchant name (e.g., Swiggy, Amazon) when creating expenses to see insights here.</p>
                </div>
              );
            }
            return (
              <div className="space-y-3">
                {merchants.map((m: any, idx: number) => {
                  const config = merchantConfig[m.merchant.toLowerCase()] || { icon: "🛍️", color: "#C8FF00" };
                  return (
                    <div key={m.merchant} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}>
                          {config.icon}
                        </div>
                        <div>
                          <div className="text-white font-medium capitalize">{m.merchant}</div>
                          <div className="text-xs text-white/40">{m.count} order{m.count !== 1 ? 's' : ''} this month</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">₹{m.total.toLocaleString()}</div>
                        <div className={`text-[11px] font-medium ${m.trend > 0 ? 'text-[#FF6B6B]' : m.trend < 0 ? 'text-[#00E5A0]' : 'text-white/40'}`}>
                          {m.trend > 0 ? '↑' : m.trend < 0 ? '↓' : '—'} {m.trendText}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Smart Alert */}
                {merchants.length > 0 && merchants[0].trend > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-[#FF6B6B]/5 border border-[#FF6B6B]/10">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B6B] mt-1.5 shrink-0"></div>
                      <p className="text-sm text-white/80">
                        You've ordered from <strong className="text-white">{merchants[0].merchant}</strong> {merchants[0].count} times this month. That's a <span className="text-[#FF6B6B] font-semibold">{merchants[0].trend}% increase</span> from last month!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Contribute Modal */}
      <Dialog open={isContributeModalOpen} onOpenChange={setIsContributeModalOpen}>
        <DialogContent className="bg-[#12121A] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add Money to "{selectedGoal?.name}"
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4 mt-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Current Progress</span>
                <span className="text-white font-medium">
                  ₹{(selectedGoal?.currentAmount || 0).toLocaleString()} / ₹{(selectedGoal?.targetAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C8FF00]"
                  style={{
                    width: `${selectedGoal?.targetAmount > 0 ? Math.min(((selectedGoal?.currentAmount || 0) / selectedGoal.targetAmount) * 100, 100) : 0}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-white/60 mt-2">
                Remaining: ₹{Math.max(0, (selectedGoal?.targetAmount || 0) - (selectedGoal?.currentAmount || 0)).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Amount to Add</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                <input
                  required
                  type="number"
                  min="1"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-[44px] pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={contributeMutation.isPending}
              className="w-full py-3 mt-2 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all flex items-center justify-center gap-2"
            >
              {contributeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Contribution
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
