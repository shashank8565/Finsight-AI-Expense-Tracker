import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../api/services";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck, ArrowLeft } from "lucide-react";

export function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if user is logged in
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authService.verifyEmail(code),
    onSuccess: () => {
      toast.success("Email verified successfully! ✅");
      navigate("/app");
    },
    onError: () => {
      toast.error("Invalid or expired code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
      toast.success("New verification code sent!");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
    onError: () => {
      toast.error("Failed to resend code");
    },
  });

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) {
        verifyMutation.mutate(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();

    // Auto-submit if all 6 digits pasted
    if (pastedData.length === 6) {
      verifyMutation.mutate(pastedData);
    }
  };

  const handleSkip = () => {
    navigate("/app");
  };

  const code = otp.join("");
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1A0A2E] rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0A2E1A] rounded-full blur-[120px] opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8FF00] to-[#00E5A0] flex items-center justify-center">
              <span className="text-[#0A0A0F] font-bold text-2xl">F</span>
            </div>
            <span className="text-3xl font-bold text-white">Finsight</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[24px] p-8 sm:p-10">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C8FF00]/20 to-[#00E5A0]/20 border border-[#C8FF00]/30 flex items-center justify-center">
              <Mail className="w-10 h-10 text-[#C8FF00]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-white/60 text-sm">
              We've sent a 6-digit verification code to your email. Enter it below to verify your account.
            </p>
          </div>

          {/* OTP Input Grid */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 bg-white/5 text-white outline-none transition-all ${
                  digit
                    ? "border-[#C8FF00] bg-[#C8FF00]/5 shadow-sm shadow-[#C8FF00]/10"
                    : "border-white/10 focus:border-[#C8FF00]/60"
                }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => verifyMutation.mutate(code)}
            disabled={code.length !== 6 || verifyMutation.isPending}
            className="w-full py-3.5 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-bold text-base hover:bg-[#d4ff33] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Verify Email
              </>
            )}
          </button>

          {/* Timer + Resend */}
          <div className="text-center mt-6">
            {canResend ? (
              <button
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-[#C8FF00] hover:text-[#d4ff33] font-medium text-sm transition-all"
              >
                {resendMutation.isPending ? "Sending..." : "Resend verification code"}
              </button>
            ) : (
              <p className="text-white/40 text-sm">
                Resend code in{" "}
                <span className="text-white/70 font-semibold">{formatTime(timer)}</span>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleSkip}
              className="w-full flex items-center justify-center gap-2 py-2 text-white/40 hover:text-white/60 text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Skip for now, verify later
            </button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-white/30 text-xs mt-6">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
}
