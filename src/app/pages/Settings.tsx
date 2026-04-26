import { useState, useEffect } from "react";
import { User, Bell, Palette, Link as LinkIcon, Shield, Mail, MapPin, Loader2, Flame, Trophy, Award, LogOut, BadgeCheck, ShieldAlert } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, analyticsService, authService } from "../../api/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerifyInput, setShowVerifyInput] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => analyticsService.getDashboardSummary(),
  });

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    monthlyIncome: 0,
    cityTier: "Tier 1 (Metro)",
    riskProfile: "Moderate",
    currency: "INR",
    darkMode: true,
    notifications: {
      dailyReminders: true,
      budgetAlerts: true,
      investmentUpdates: false,
      goalMilestones: true,
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        city: profile.city || "",
        monthlyIncome: profile.monthlyIncome || 0,
        cityTier: profile.cityTier || "Tier 1 (Metro)",
        riskProfile: profile.riskProfile || "Moderate",
        currency: profile.currency || "INR",
        darkMode: profile.darkMode !== undefined ? profile.darkMode : true,
        notifications: {
          dailyReminders: profile.notifications?.dailyReminders ?? true,
          budgetAlerts: profile.notifications?.budgetAlerts ?? true,
          investmentUpdates: profile.notifications?.investmentUpdates ?? false,
          goalMilestones: profile.notifications?.goalMilestones ?? true,
        },
      });
    }
  }, [profile]);

  const handleUpdate = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateMutation.mutate({ [field]: value });
  };

  const handleNotificationToggle = (key: string) => {
    const updated = {
      ...formData.notifications,
      [key]: !(formData.notifications as any)[key],
    };
    setFormData((prev) => ({ ...prev, notifications: updated }));
    updateMutation.mutate({ notifications: updated });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authService.verifyEmail(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setShowVerifyInput(false);
      setVerificationCode("");
      toast.success("Email verified successfully! ✅");
    },
    onError: () => {
      toast.error("Invalid or expired verification code");
    }
  });

  const resendMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
      toast.success("Verification code sent to your email");
      setShowVerifyInput(true);
    },
    onError: () => {
      toast.error("Failed to send verification email");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C8FF00] animate-spin" />
      </div>
    );
  }

  const initials = profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
  const streak = dashboardData?.streak || profile?.streak || 0;
  const score = dashboardData?.score || profile?.score || 0;

  const notificationSettings = [
    { key: "dailyReminders", name: "Daily Expense Reminders", desc: "Get reminded to log expenses" },
    { key: "budgetAlerts", name: "Budget Alerts", desc: "Alert when nearing budget limits" },
    { key: "investmentUpdates", name: "Investment Updates", desc: "Weekly investment performance" },
    { key: "goalMilestones", name: "Goal Milestones", desc: "Celebrate when goals hit milestones" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-10 h-10 text-[#C8FF00]" />
        <h1 className="text-[32px] sm:text-[40px] font-bold text-white">Settings</h1>
      </div>

      {/* Email Verification Banner */}
      {profile && !profile.isEmailVerified && (
        <div className="bg-[#FFB800]/10 border border-[#FFB800]/30 backdrop-blur-xl rounded-[20px] p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFB800]/20 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#FFB800]" />
              </div>
              <div>
                <div className="text-white font-semibold">Verify your email address</div>
                <div className="text-sm text-white/60">We sent a 6-digit code to <span className="text-[#FFB800]">{profile.email}</span></div>
              </div>
            </div>
            {!showVerifyInput ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVerifyInput(true)}
                  className="px-4 py-2 bg-[#FFB800] text-[#0A0A0F] rounded-xl font-semibold text-sm hover:bg-[#ffc933] transition-all"
                >
                  Enter Code
                </button>
                <button
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm hover:bg-white/10 transition-all"
                >
                  {resendMutation.isPending ? "Sending..." : "Resend"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-[120px] h-[40px] px-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-widest font-mono placeholder:text-white/20 focus:outline-none focus:border-[#FFB800]"
                />
                <button
                  onClick={() => verifyMutation.mutate(verificationCode)}
                  disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                  className="px-4 py-2 bg-[#FFB800] text-[#0A0A0F] rounded-xl font-semibold text-sm hover:bg-[#ffc933] transition-all disabled:opacity-50"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#C8FF00] border-4 border-[#C8FF00] p-1">
              <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{profile?.name || "User"}</h3>
            <div className="flex items-center justify-center gap-1 text-white/60 mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span className="text-sm">{profile?.email}</span>
              {profile?.isEmailVerified ? (
                <BadgeCheck className="w-4 h-4 text-[#00E5A0] ml-1" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#FFB800] ml-1" />
              )}
            </div>
            <div className="flex items-center justify-center gap-1 text-white/60 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{profile?.city || "Not set"}, India</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full">
              <span className="text-[#C8FF00] font-semibold text-sm">Pro Plan</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-2xl font-bold text-white">{streak}</span>
              </div>
              <div className="text-xs text-white/60">Streak</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-[#FFB800]" />
                <span className="text-2xl font-bold text-white">{score}</span>
              </div>
              <div className="text-xs text-white/60">Score</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-4 h-4 text-[#7B61FF]" />
                <span className="text-2xl font-bold text-white">
                  {[streak >= 7, streak >= 30, score > 0, true, true].filter(Boolean).length}
                </span>
              </div>
              <div className="text-xs text-white/60">Badges</div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 hover:bg-[#FF6B6B]/20 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#C8FF00]" />
              <h3 className="text-[20px] font-semibold text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={(e) => handleUpdate('name', e.target.value)}
                  placeholder="Your name"
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  onBlur={(e) => handleUpdate('city', e.target.value)}
                  placeholder="e.g., Mumbai"
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>
            </div>
          </div>

          {/* Financial Profile */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#C8FF00]" />
              <h3 className="text-[20px] font-semibold text-white">Financial Profile</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    onBlur={(e) => handleUpdate('monthlyIncome', Number(e.target.value))}
                    className="w-full h-[44px] pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">City Tier</label>
                <Select value={formData.cityTier} onValueChange={(value) => handleUpdate('cityTier', value)}>
                  <SelectTrigger className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#C8FF00] focus-visible:border-[#C8FF00]">
                    <SelectValue placeholder="Select city tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121A] border-white/10 text-white">
                    <SelectItem value="Tier 1 (Metro)">Tier 1 (Metro)</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                    <SelectItem value="Tier 3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="text-sm text-white/60 mb-2 block">Risk Profile</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {[
                    { name: "Conservative", desc: "Low risk, steady returns", color: "#00E5A0" },
                    { name: "Moderate", desc: "Balanced approach", color: "#C8FF00" },
                    { name: "Aggressive", desc: "High risk, high reward", color: "#FF6B6B" },
                  ].map((risk) => (
                    <button
                      key={risk.name}
                      onClick={() => handleUpdate('riskProfile', risk.name)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-left ${
                        formData.riskProfile === risk.name
                          ? "bg-[#C8FF00] text-[#0A0A0F]"
                          : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <div className="font-semibold text-sm">{risk.name}</div>
                      <div className={`text-xs mt-0.5 ${formData.riskProfile === risk.name ? "text-[#0A0A0F]/60" : "text-white/40"}`}>
                        {risk.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#C8FF00]" />
              <h3 className="text-[20px] font-semibold text-white">Notifications</h3>
            </div>
            <div className="space-y-4">
              {notificationSettings.map((notif) => {
                const isEnabled = (formData.notifications as any)[notif.key];
                return (
                  <div key={notif.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-sm">{notif.name}</div>
                      <div className="text-xs text-white/40">{notif.desc}</div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(notif.key)}
                      className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${
                        isEnabled ? "bg-[#C8FF00]" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                          isEnabled ? "right-0.5" : "left-0.5"
                        }`}
                      ></div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-[#C8FF00]" />
              <h3 className="text-[20px] font-semibold text-white">App Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm">Dark Mode</div>
                  <div className="text-xs text-white/40">Toggle dark/light theme</div>
                </div>
                <button
                  onClick={() => handleUpdate('darkMode', !formData.darkMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    formData.darkMode ? "bg-[#C8FF00]" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                      formData.darkMode ? "right-0.5" : "left-0.5"
                    }`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm">Currency</div>
                  <div className="text-xs text-white/40">Default display currency</div>
                </div>
                <Select value={formData.currency} onValueChange={(value) => handleUpdate('currency', value)}>
                  <SelectTrigger className="w-[130px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#C8FF00] focus-visible:border-[#C8FF00]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121A] border-white/10 text-white">
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-[#C8FF00]" />
              <h3 className="text-[20px] font-semibold text-white">Connected Accounts</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "UPI", icon: "💳", status: "Coming Soon" },
                { name: "SMS Parser", icon: "📱", status: "Coming Soon" },
                { name: "Bank Sync", icon: "🏦", status: "Coming Soon" },
              ].map((account) => (
                <div
                  key={account.name}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl text-center opacity-50 hover:opacity-60 transition-all"
                >
                  <div className="text-3xl mb-2">{account.icon}</div>
                  <div className="text-white font-medium mb-1">{account.name}</div>
                  <div className="text-xs text-white/60">{account.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
