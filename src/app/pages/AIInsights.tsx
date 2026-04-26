import { useState, useRef, useEffect } from "react";
import { Sparkles, AlertCircle, TrendingUp, Send, Loader2, RefreshCw, Lightbulb, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { aiService, analyticsService } from "../../api/services";
import { Skeleton } from "../components/ui/skeleton";
import { ListSkeleton } from "../components/ui/PageSkeleton";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

const quickPrompts = [
  "Where am I overspending?",
  "Best investment for ₹10K?",
  "How to reach my savings goal faster?",
  "Tax-saving tips for this year",
  "Suggest a monthly budget plan",
  "How much should I save for emergencies?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIInsights() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI summary
  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ["ai-summary"],
    queryFn: aiService.getSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Fetch cash flow for the chart
  const { data: cashFlowData } = useQuery({
    queryKey: ["cash-flow"],
    queryFn: analyticsService.getCashFlow,
  });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSend = async (message?: string) => {
    const text = message || input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await aiService.chat(text, chatMessages);
      const aiMsg: ChatMessage = { role: "assistant", content: response.message };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please check your GROQ_API_KEY and try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const healthScore = summary?.healthScore || 0;
  const healthLabel = summary?.healthLabel || "Analyzing...";
  const healthColor =
    healthScore >= 80 ? "#00E5A0" : healthScore >= 60 ? "#C8FF00" : healthScore >= 40 ? "#FFB800" : "#FF6B6B";

  const scoreOffset = 251 - (251 * Math.min(healthScore, 100)) / 100;

  // Cash flow chart data
  const chartData = (cashFlowData || []).map((d: any) => ({
    month: d.month,
    income: d.income,
    expense: d.expense,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-[#C8FF00]" />
          <h1 className="text-[32px] sm:text-[40px] font-bold text-white">AI Insights</h1>
        </div>
        <button
          onClick={() => refetchSummary()}
          disabled={isSummaryLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isSummaryLoading ? "animate-spin" : ""}`} />
          Refresh Analysis
        </button>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Anomalies / Alerts */}
        <div className="bg-white/5 border-2 border-[#FF6B6B]/20 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-[#FF6B6B]" />
            <h3 className="font-semibold text-white">Spending Alerts</h3>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : summary?.anomalies?.length > 0 ? (
            <div className="space-y-3">
              {summary.anomalies.map((a: string, i: number) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] mt-2 shrink-0"></div>
                  <p className="text-sm text-white/80 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">No anomalies detected. Your spending looks normal! 🎉</p>
          )}
        </div>

        {/* Health Score */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 flex flex-col items-center justify-center">
          <div className="text-sm text-white/60 mb-3">Financial Health Score</div>
          {isSummaryLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
          ) : (
            <>
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="8"
                    strokeDasharray="251"
                    strokeDashoffset={scoreOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl font-bold" style={{ color: healthColor }}>
                    {healthScore}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium mt-2" style={{ color: healthColor }}>
                {healthLabel}
              </div>
            </>
          )}
        </div>

        {/* Month Projection */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-[#00E5A0]" />
            <h3 className="font-semibold text-white">Month Projection</h3>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-4 pt-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-[#00E5A0] mb-1">
                ₹{(summary?.monthProjection || 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/60 mb-4">Projected total expenses</div>
              {summary?.insight && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-white/70 leading-relaxed">{summary.insight}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* AI Chat Section */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#C8FF00]" />
          <h3 className="text-[20px] font-semibold text-white">AI Financial Assistant</h3>
          <span className="text-xs px-2 py-0.5 bg-[#C8FF00]/10 border border-[#C8FF00]/20 text-[#C8FF00] rounded-full ml-2">
            Powered by Groq
          </span>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {chatMessages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-[#C8FF00]/30 mx-auto mb-4" />
              <p className="text-white/40 text-sm">Ask me anything about your finances!</p>
              <p className="text-white/30 text-xs mt-1">I have access to all your expense data, goals, and investments.</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#C8FF00] flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-[#0A0A0F]" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#C8FF00] text-[#0A0A0F] font-medium"
                    : "bg-white/5 border border-white/10 text-white/90"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#C8FF00] flex items-center justify-center mr-3 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#0A0A0F]" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C8FF00] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#C8FF00] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#C8FF00] animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isTyping}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your finances..."
            disabled={isTyping}
            className="w-full h-[52px] pl-5 pr-14 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#C8FF00] rounded-lg flex items-center justify-center hover:bg-[#d4ff33] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 text-[#0A0A0F] animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-[#0A0A0F]" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row: Charts & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <h3 className="text-[20px] font-semibold text-white mb-4">Income vs Expenses</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="income" fill="#00E5A0" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#FF6B6B" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/40 text-sm">
              Not enough data to show chart yet.
            </div>
          )}
        </div>

        {/* Smart Tips */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#FFB800]" />
            <h3 className="text-[20px] font-semibold text-white">Smart Suggestions</h3>
          </div>
          {isSummaryLoading ? (
            <div className="pt-4">
              <ListSkeleton count={3} />
            </div>
          ) : summary?.tips?.length > 0 ? (
            <div className="space-y-3">
              {summary.tips.map((tip: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.06] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 flex items-center justify-center text-sm font-bold text-[#FFB800] shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{tip.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{tip.description}</div>
                  </div>
                  <div className="text-[#00E5A0] text-sm font-semibold whitespace-nowrap">
                    {tip.savings}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-white/40 text-sm">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-white/20" />
              <p>Add more expenses to unlock personalized AI tips!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
