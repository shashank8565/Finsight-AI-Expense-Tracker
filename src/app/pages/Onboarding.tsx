import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Flame } from "lucide-react";

export function Onboarding() {
  const navigate = useNavigate();

  // Check if returning user on mount
  useEffect(() => {
    const isReturning = localStorage.getItem("finsight_returning_user");
    if (isReturning === "true") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#1A0A2E] rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="w-full max-w-[1440px] mx-auto px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo.png" alt="Finsight Logo" className="w-12 h-12 object-contain" />
              <span className="text-3xl font-bold text-white">Finsight</span>
            </div>

            <div>
              <h1 className="text-[40px] sm:text-[48px] font-bold text-white leading-tight mb-4">
                Your money.<br />Finally intelligent.
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-[520px]">
                AI-powered expense tracking built for Indian professionals. Track, analyze, and grow your wealth smarter.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/90 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C8FF00]" />
                <span className="text-sm sm:text-base">AI Analysis</span>
              </div>
              <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00E5A0]" />
                <span className="text-sm sm:text-base">India Investments</span>
              </div>
              <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/90 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-sm sm:text-base">Savings Streaks</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C8FF00] text-[#0A0A0F] rounded-2xl font-semibold hover:bg-[#d4ff33] transition-all shadow-lg shadow-[#C8FF00]/20"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">50K+</div>
                <div className="text-xs sm:text-sm text-white/60">Active Users</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">₹2Cr+</div>
                <div className="text-xs sm:text-sm text-white/60">Money Tracked</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">4.9</div>
                <div className="text-xs sm:text-sm text-white/60">User Rating</div>
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-md lg:max-w-none mx-auto hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7B61FF] rounded-3xl blur-[100px] opacity-30"></div>
              <div className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-full mb-4">
                    <Flame className="w-5 h-5 text-[#FF6B6B]" />
                    <span className="text-white font-semibold">12 day streak</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#FF6B6B" strokeWidth="16" strokeDasharray="314" strokeDashoffset="94" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#C8FF00" strokeWidth="16" strokeDasharray="314" strokeDashoffset="220" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#00E5A0" strokeWidth="16" strokeDasharray="314" strokeDashoffset="251" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">₹28.4K</div>
                        <div className="text-sm text-white/60">This month</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B6B] mx-auto mb-2"></div>
                    <div className="text-xs text-white/60">Spent</div>
                    <div className="font-semibold text-white">₹28,450</div>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-[#C8FF00] mx-auto mb-2"></div>
                    <div className="text-xs text-white/60">Budget</div>
                    <div className="font-semibold text-white">₹20,000</div>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-[#00E5A0] mx-auto mb-2"></div>
                    <div className="text-xs text-white/60">Saved</div>
                    <div className="font-semibold text-white">₹11,200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
