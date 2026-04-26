import { Loader2 } from "lucide-react";

interface LoaderProps {
  fullPage?: boolean;
}

export function Loader({ fullPage = true }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        {/* Glowing background */}
        <div className="absolute inset-0 bg-[#C8FF00] rounded-full blur-[30px] opacity-20 animate-pulse"></div>
        
        {/* Logo container */}
        <div className="relative w-24 h-24 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src="/logo.png" 
            alt="Finsight Logo" 
            className="w-14 h-14 object-contain animate-pulse" 
          />
          
          {/* Spinning ring */}
          <div className="absolute inset-0 border-2 border-transparent border-t-[#C8FF00] rounded-full animate-spin"></div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Finsight AI</h3>
        <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#C8FF00]" />
          Analyzing your finances...
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0A0A0F] flex items-center justify-center">
        {/* Background blobs for full page loader */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1A0A2E] rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0A2E1A] rounded-full blur-[120px] opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
