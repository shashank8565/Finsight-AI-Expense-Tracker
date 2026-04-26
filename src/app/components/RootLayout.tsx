import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

export function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden flex">
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#1A0A2E] rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen relative z-10 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8FF00] to-[#00E5A0] flex items-center justify-center">
              <span className="text-[#0A0A0F] font-bold">F</span>
            </div>
            <span className="text-xl font-bold text-white">Finsight</span>
          </div>
          <button 
            className="p-2 text-white/80 hover:text-white bg-white/5 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-[1180px] mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
