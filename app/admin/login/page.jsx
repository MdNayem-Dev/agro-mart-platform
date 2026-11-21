"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Sprout,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { adminLogin } from "@/app/actions/adminAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedInput = emailOrUsername.trim();
    if (!trimmedInput) {
      setErrorMessage("অনুগ্রহ করে আপনার ইমেইল বা ইউজারনেম লিখুন।");
      return;
    }
    if (!password) {
      setErrorMessage("অনুগ্রহ করে আপনার পাসওয়ার্ড প্রদান করুন।");
      return;
    }

    startTransition(async () => {
      try {
        const result = await adminLogin({
          emailOrUsername: trimmedInput,
          password: password,
        });

        if (result?.success) {
          router.push(redirectUrl);
          router.refresh();
        } else {
          setErrorMessage(
            result?.error || "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
          );
        }
      } catch (err) {
        console.error("Login submission error:", err);
        setErrorMessage("সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। আবার চেষ্টা করুন।");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card container */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/40 overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header / Brand */}
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-white shadow-xl shadow-emerald-950/40 border border-white/30 mb-4 ring-4 ring-emerald-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png" 
              alt="Smart Agro Source Logo" 
              className="h-12 w-auto object-contain max-w-[180px]"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            অ্যাডমিন লগইন
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            SmartAgro ম্যানেজমেন্ট প্যানেলে প্রবেশ করতে আপনার ক্রেডেনশিয়াল দিন
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>সুরক্ষিত অ্যাডমিন অথেনটিকেশন</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            role="alert"
            className="relative z-10 mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5" noValidate>
          {/* Email / Username Input */}
          <div>
            <label
              htmlFor="emailOrUsername"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              ইমেইল বা ইউজারনেম (Gmail / Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                disabled={isPending}
                value={emailOrUsername}
                onChange={(e) => {
                  setEmailOrUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="smartagrosource.com"
                className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                পাসওয়ার্ড (Password)
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isPending}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>লগইন হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Security / Role Notice */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            শুধুমাত্র <span className="text-emerald-400 font-semibold">Administrator</span> ও{" "}
            <span className="text-emerald-400 font-semibold">Shop Manager</span> রোলধারী ইউজাররা
            অ্যাডমিন প্যানেল অ্যাক্সেস করতে পারবেন।
          </p>

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>স্মার্ট এগ্রো মূল ওয়েবসাইটে ফিরে যান</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
