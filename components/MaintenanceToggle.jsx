"use client";

import { useState, useEffect } from "react";
import { Wrench, CheckCircle2, Loader2 } from "lucide-react";
import { getMaintenanceModeAction, toggleMaintenanceModeAction } from "@/app/admin/actions/maintenanceActions";

export default function MaintenanceToggle({ className = "" }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Load status on mount
  useEffect(() => {
    let mounted = true;
    getMaintenanceModeAction().then((res) => {
      if (mounted && res?.success) {
        setIsEnabled(res.enabled);
      }
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleToggle = async () => {
    if (isUpdating) return;

    const nextState = !isEnabled;
    const confirmText = nextState 
      ? "আপনি কি নিশ্চিতভাবে 'Maintenance Mode' চালু করতে চান? মূল সাইটে ভিজিট করলে 'Under Development by Renovra IT' পেজ দেখতে পাবে।"
      : "আপনি কি সাইটটি আবার লাইভ (Live) করতে চান?";

    if (!window.confirm(confirmText)) return;

    setIsUpdating(true);
    setStatusMessage("");

    // Optimistic UI update
    setIsEnabled(nextState);

    const res = await toggleMaintenanceModeAction(nextState);
    setIsUpdating(false);

    if (res?.success) {
      setIsEnabled(res.enabled);
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(""), 4000);
    } else {
      // Revert if failed
      setIsEnabled(!nextState);
      alert(res?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-500 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" />
        <span>লোডিং...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      
      {/* Status Pill Badge */}
      <div 
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors shadow-xs ${
          isEnabled 
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800" 
            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isEnabled ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
        <span>{isEnabled ? "Maintenance Mode" : "Site Live"}</span>
      </div>

      {/* Modern iOS-Style Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#488e14] focus:ring-offset-2 ${
          isEnabled ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
        } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
        role="switch"
        aria-checked={isEnabled}
        title={isEnabled ? "ক্লিক করে সাইট লাইভ করুন" : "ক্লিক করে মেইনটেইনেন্স মোড চালু করুন"}
      >
        <span className="sr-only">Toggle Maintenance Mode</span>
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
            isEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {isUpdating ? (
            <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
          ) : isEnabled ? (
            <Wrench className="w-2.5 h-2.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
          )}
        </span>
      </button>

      {/* Status Notification Toast */}
      {statusMessage && (
        <span className="hidden sm:inline-block text-xs font-semibold text-emerald-600 animate-fade-in">
          ✓ {statusMessage}
        </span>
      )}

    </div>
  );
}
