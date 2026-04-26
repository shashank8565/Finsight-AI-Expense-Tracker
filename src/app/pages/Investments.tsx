import { useState } from "react";
import { TrendingUp, Shield, Zap, Star, Calculator, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "../../api/services";
import { Loader } from "../components/ui/Loader";
import { CardGridSkeleton } from "../components/ui/PageSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";

const investmentIcons: Record<string, any> = {
  "PPF": Shield,
  "NPS": Shield,
  "Mutual Fund SIP": TrendingUp,
  "FD": Shield,
  "Gold ETF": Zap,
  "Sukanya Samriddhi": Star,
  "Stocks": TrendingUp,
  "Crypto": Zap,
  "Other": Shield,
};

const investmentTypes = [
  "PPF", "NPS", "Mutual Fund SIP", "FD", "Gold ETF", "Sukanya Samriddhi", "Stocks", "Crypto", "Other"
];

export function Investments() {
  const queryClient = useQueryClient();
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipReturn, setSipReturn] = useState(12);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("Mutual Fund SIP");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["investments"],
    queryFn: investmentService.getInvestments,
  });

  const createMutation = useMutation({
    mutationFn: investmentService.createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      setIsAddModalOpen(false);
      setName("");
      setType("Mutual Fund SIP");
      setInvestedAmount("");
      setCurrentValue("");
      toast.success("Investment added successfully");
    },
    onError: () => {
      toast.error("Failed to add investment");
    }
  });

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      type,
      investedAmount: Number(investedAmount),
      currentValue: Number(currentValue),
      returns: "12%", // Placeholder or calculate
    });
  };

  const totalSipInvested = sipAmount * 12 * sipYears;
  const futureValue = Math.round(sipAmount * ((Math.pow(1 + sipReturn / 100 / 12, sipYears * 12) - 1) / (sipReturn / 100 / 12)) * (1 + sipReturn / 100 / 12));

  const investments = portfolio?.data || [];
  const summary = portfolio?.summary || { totalInvested: 0, totalCurrentValue: 0, totalReturns: 0, returnPercentage: "0" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[32px] sm:text-[40px] font-bold text-white">Investments</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all">
              <Plus className="w-5 h-5" />
              Add Investment
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121A] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Investment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddInvestment} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="e.g., Axis Bluechip Fund"
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C8FF00]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121A] border-white/10 text-white">
                    {investmentTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Invested Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                  <input
                    required
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full h-[44px] pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Current Value</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                  <input
                    required
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full h-[44px] pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3 mt-2 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all flex items-center justify-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Investment
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 text-center">
           <div className="text-white/60 mb-2">Total Invested</div>
           <div className="text-[32px] font-bold text-white">₹{(summary.totalInvested || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 text-center">
           <div className="text-white/60 mb-2">Current Value</div>
           <div className="text-[32px] font-bold text-[#C8FF00]">₹{(summary.totalCurrentValue || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 text-center">
           <div className="text-white/60 mb-2">Total Returns</div>
           <div className="text-[32px] font-bold text-[#00E5A0]">+{summary.returnPercentage || 0}%</div>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : investments.length === 0 ? (
         <div className="py-12 text-center text-white/60 bg-white/5 border border-white/10 rounded-[20px]">
          No investments found. Add one to start tracking your portfolio.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {investments.map((inv: any) => {
            const Icon = investmentIcons[inv.type] || Shield;
            const returns = inv.currentValue - inv.investedAmount;
            const returnPct = inv.investedAmount > 0 ? ((returns / inv.investedAmount) * 100).toFixed(2) : 0;
            return (
              <div
                key={inv._id}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6 hover:border-white/20 transition-all relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#C8FF00]/10">
                    <Icon className="w-6 h-6 text-[#C8FF00]" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#C8FF00]">
                      {returnPct}%
                    </div>
                    <div className="text-xs text-white/60">Returns</div>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{inv.name}</h4>
                <p className="text-sm text-white/80 mb-3">{inv.type}</p>
                <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                  <div>
                    <div className="text-xs text-white/60">Invested</div>
                    <div className="font-semibold text-white">₹{(inv.investedAmount || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">Current</div>
                    <div className="font-semibold text-white">₹{(inv.currentValue || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-[#C8FF00]" />
          <h3 className="text-[20px] font-semibold text-white">SIP Calculator</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-white/80 mb-3 block flex items-center justify-between">
                <span>Monthly Investment</span>
                <span className="text-[#C8FF00] font-bold">₹{(sipAmount || 0).toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C8FF00]"
              />
            </div>

            <div>
              <label className="text-white/80 mb-3 block flex items-center justify-between">
                <span>Expected Return (%)</span>
                <span className="text-[#C8FF00] font-bold">{sipReturn}%</span>
              </label>
              <input
                type="range"
                min="6"
                max="18"
                step="0.5"
                value={sipReturn}
                onChange={(e) => setSipReturn(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C8FF00]"
              />
            </div>

            <div>
              <label className="text-white/80 mb-3 block flex items-center justify-between">
                <span>Time Period (Years)</span>
                <span className="text-[#C8FF00] font-bold">{sipYears}</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C8FF00]"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="text-white/60 mb-2 text-center">Projected Value After {sipYears} Years</div>
            <div className="text-[40px] font-bold text-[#C8FF00] mb-6">₹{(futureValue / 100000).toFixed(1)}L</div>
            <div className="grid grid-cols-2 gap-8 w-full">
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">Invested</div>
                <div className="text-xl font-bold text-white">₹{(totalSipInvested / 100000).toFixed(1)}L</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">Returns</div>
                <div className="text-xl font-bold text-[#00E5A0]">₹{((futureValue - totalSipInvested) / 100000).toFixed(1)}L</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
