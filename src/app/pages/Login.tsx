import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authService } from "../../api/services";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"login" | "register" | "forgot" | "reset">("login");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("finsight_returning_user", "true");
      toast.success(`Welcome back, ${data.name}!`);
      
      setTimeout(() => {
        if (!data.isEmailVerified) {
          navigate("/verify-email");
        } else {
          navigate("/app");
        }
      }, 500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Invalid email or password";
      toast.error(msg, { duration: 4000 });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("finsight_returning_user", "true");
      toast.success(`Account created! Check your email for the verification code.`);

      setTimeout(() => {
        navigate("/verify-email");
      }, 500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Registration failed. Try again.";
      toast.error(msg, { duration: 4000 });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success("Password reset email sent! Please check your inbox.");
      setViewMode("reset");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to send reset email.";
      toast.error(msg, { duration: 4000 });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully! You can now log in.");
      setViewMode("login");
      setPassword("");
      setResetToken("");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to reset password.";
      toast.error(msg, { duration: 4000 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode === "register") {
      registerMutation.mutate({ name, email, password });
    } else if (viewMode === "login") {
      loginMutation.mutate({ email, password });
    } else if (viewMode === "forgot") {
      forgotPasswordMutation.mutate(email);
    } else if (viewMode === "reset") {
      resetPasswordMutation.mutate({ email, token: resetToken, newPassword: password });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1A0A2E] rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0A2E1A] rounded-full blur-[120px] opacity-30 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Finsight Logo" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-bold text-white">Finsight</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[24px] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {viewMode === "register" && "Create an Account"}
              {viewMode === "login" && "Welcome Back"}
              {viewMode === "forgot" && "Forgot Password"}
              {viewMode === "reset" && "Reset Password"}
            </h1>
            <p className="text-white/60 text-sm">
              {viewMode === "register" && "Sign up to start tracking your finances smartly."}
              {viewMode === "login" && "Enter your credentials to access your account."}
              {viewMode === "forgot" && "Enter your email to receive a reset code."}
              {viewMode === "reset" && "Enter the code and your new password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {viewMode === "register" && (
              <div>
                <label className="text-sm text-white/60 mb-2 block">Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full h-[48px] px-4 bg-[#0A0A0F]/50 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-white/60 mb-2 block">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@demo.com"
                className="w-full h-[48px] px-4 bg-[#0A0A0F]/50 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] transition-colors"
              />
            </div>

            {viewMode === "reset" && (
              <div>
                <label className="text-sm text-white/60 mb-2 block">Reset Code</label>
                <input
                  required
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="123456"
                  className="w-full h-[48px] px-4 bg-[#0A0A0F]/50 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] transition-colors tracking-widest text-lg"
                />
              </div>
            )}

            {(viewMode === "login" || viewMode === "register" || viewMode === "reset") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white/60 block">
                    {viewMode === "reset" ? "New Password" : "Password"}
                  </label>
                  {viewMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setViewMode("forgot")}
                      className="text-xs text-[#C8FF00] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[48px] pl-4 pr-12 bg-[#0A0A0F]/50 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending}
              className="w-full h-[48px] mt-4 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-bold text-base hover:bg-[#d4ff33] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loginMutation.isPending || registerMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending) && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {viewMode === "register" && "Sign Up"}
              {viewMode === "login" && "Log In"}
              {viewMode === "forgot" && "Send Reset Link"}
              {viewMode === "reset" && "Reset Password"}
            </button>

            <div className="text-center pt-4 mt-4 border-t border-white/10">
              {(viewMode === "forgot" || viewMode === "reset") ? (
                <button
                  type="button"
                  onClick={() => setViewMode("login")}
                  className="text-sm font-semibold text-[#C8FF00] hover:underline"
                >
                  Back to Log In
                </button>
              ) : (
                <>
                  <span className="text-sm text-white/60">
                    {viewMode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === "register" ? "login" : "register")}
                    className="text-sm font-semibold text-[#C8FF00] hover:underline"
                  >
                    {viewMode === "register" ? "Log In" : "Sign Up"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
