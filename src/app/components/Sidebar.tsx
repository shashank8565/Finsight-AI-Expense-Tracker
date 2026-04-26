import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CreditCard, Sparkles, TrendingUp, Trophy, PieChart, Settings, LogOut, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../api/services";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Expenses", href: "/app/expenses", icon: CreditCard },
  { name: "AI Insights", href: "/app/insights", icon: Sparkles },
  { name: "Investments", href: "/app/investments", icon: TrendingUp },
  { name: "Goals", href: "/app/goals", icon: Trophy },
  { name: "Reports", href: "/app/reports", icon: PieChart },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const initials = profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'F';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-[260px] bg-[#080808] border-r border-white/10 backdrop-blur-xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3">
            <img src="/logo.png" alt="Finsight Logo" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold text-white">Finsight</span>
          </Link>
          <button 
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/app" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#C8FF00]/10 text-[#C8FF00] shadow-lg shadow-[#C8FF00]/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={2} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#C8FF00] border-2 border-[#C8FF00] flex items-center justify-center text-[#0A0A0F] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{profile?.name || "Loading..."}</div>
              <div className="text-xs text-white/60 truncate">{profile?.city ? `${profile.city}, India` : "India"}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}
