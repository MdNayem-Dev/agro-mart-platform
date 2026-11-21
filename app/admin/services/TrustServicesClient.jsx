"use client";

import { useState } from "react";
import { 
  Truck, 
  Wallet, 
  ShieldCheck, 
  Headphones, 
  BadgePercent, 
  Users, 
  PackageCheck, 
  Layers,
  Sparkles,
  Star,
  Award,
  Clock,
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
  Zap,
  ThumbsUp,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Eye,
  Sliders,
  Check
} from "lucide-react";
import { saveTrustServicesAction } from "@/app/admin/actions/trustActions";
import { DEFAULT_TRUST_SERVICES_DATA } from "@/lib/siteDefaults";

// Lucide icon components map
const AVAILABLE_ICONS = {
  Truck: { label: "ডেলিভারি ট্রাক (Truck)", component: Truck },
  Wallet: { label: "নিরাপদ ওয়ালেট (Wallet)", component: Wallet },
  ShieldCheck: { label: "নিরাপত্তা ও আস্থা (ShieldCheck)", component: ShieldCheck },
  Headphones: { label: "কাস্টমার সাপোর্ট (Headphones)", component: Headphones },
  BadgePercent: { label: "ডিসকাউন্ট / সাশ্রয়ী (BadgePercent)", component: BadgePercent },
  PackageCheck: { label: "প্যাকেজ ডেলিভারি (PackageCheck)", component: PackageCheck },
  Users: { label: "গ্রাহক / টিম (Users)", component: Users },
  Sparkles: { label: "বিশেষ সুবিধা (Sparkles)", component: Sparkles },
  Star: { label: "স্টার রেটিং (Star)", component: Star },
  Award: { label: "সেরা মান / অ্যাওয়ার্ড (Award)", component: Award },
  Clock: { label: "দ্রুততম সময় (Clock)", component: Clock },
  HeartHandshake: { label: "আস্থা ও পার্টনারশিপ (HeartHandshake)", component: HeartHandshake },
  PhoneCall: { label: "ফোন কল সহায়তা (PhoneCall)", component: PhoneCall },
  CheckCircle2: { label: "নিশ্চয়তা (CheckCircle)", component: CheckCircle2 },
  Zap: { label: "দ্রুত সেবা (Zap)", component: Zap },
  ThumbsUp: { label: "পছন্দ / সন্তুষ্টি (ThumbsUp)", component: ThumbsUp },
  Layers: { label: "ক্যাটাগরি / স্তর (Layers)", component: Layers },
};

// Available color styles
const COLOR_OPTIONS = [
  { id: "amber", name: "Amber (কমলা / সোনালী)", bg: "bg-amber-500/10 text-amber-600 border-amber-200/60", dot: "bg-amber-500" },
  { id: "emerald", name: "Emerald (সবুজ)", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60", dot: "bg-emerald-500" },
  { id: "blue", name: "Blue (নীল)", bg: "bg-blue-500/10 text-blue-600 border-blue-200/60", dot: "bg-blue-500" },
  { id: "purple", name: "Purple (বেগুনি)", bg: "bg-purple-500/10 text-purple-600 border-purple-200/60", dot: "bg-purple-500" },
  { id: "rose", name: "Rose (লাল / গোলাপি)", bg: "bg-rose-500/10 text-rose-600 border-rose-200/60", dot: "bg-rose-500" },
  { id: "indigo", name: "Indigo (গাঢ় নীল)", bg: "bg-indigo-500/10 text-indigo-600 border-indigo-200/60", dot: "bg-indigo-500" },
  { id: "cyan", name: "Cyan (আকাশী)", bg: "bg-cyan-500/10 text-cyan-600 border-cyan-200/60", dot: "bg-cyan-500" },
];

export default function TrustServicesClient({ initialData }) {
  const [data, setData] = useState(() => {
    const raw = initialData || DEFAULT_TRUST_SERVICES_DATA;
    const sanitizedFeatures = (raw.features || []).map((f) => ({
      ...f,
      title: f.title === "নতুন অঙ্গীকার শিরোনাম" ? "" : (f.title || ""),
      description: f.description === "এখানে আপনার সেবার বিস্তারিত বিবরণ লিখুন।" ? "" : (f.description || ""),
      subtitle: f.subtitle || "Smart Agro Guarantee"
    }));
    return {
      ...raw,
      features: sanitizedFeatures
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Section fields handler
  const handleSectionChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      section: {
        ...prev.section,
        [field]: value
      }
    }));
  };

  // Stats field handler
  const handleStatChange = (index, field, value) => {
    setData((prev) => {
      const nextStats = [...prev.stats];
      nextStats[index] = {
        ...nextStats[index],
        [field]: field === 'target' ? Number(value) || 0 : value
      };
      return { ...prev, stats: nextStats };
    });
  };

  // Feature cards handlers
  const handleFeatureChange = (index, field, value) => {
    setData((prev) => {
      const nextFeatures = [...prev.features];
      nextFeatures[index] = {
        ...nextFeatures[index],
        [field]: value
      };
      return { ...prev, features: nextFeatures };
    });
  };

  const handleAddFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      icon: "ShieldCheck",
      title: "",
      subtitle: data.section?.guaranteeTag || "Smart Agro Guarantee",
      description: "",
      color: "emerald"
    };

    setData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const handleDeleteFeature = (index) => {
    if (data.features.length <= 1) {
      alert("স্লাইডারে ন্যূনতম ১টি কার্ড রাখা আবশ্যক!");
      return;
    }
    if (confirm("আপনি কি নিশ্চিত এই কার্ডটি মুছে ফেলতে চান?")) {
      setData((prev) => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const handleMoveFeature = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= data.features.length) return;
    setData((prev) => {
      const nextFeatures = [...prev.features];
      const temp = nextFeatures[index];
      nextFeatures[index] = nextFeatures[targetIdx];
      nextFeatures[targetIdx] = temp;
      return { ...prev, features: nextFeatures };
    });
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm("সতর্কতা: এটি সকল পরিবর্তন মুছে ডিফল্ট ডেটায় ফিরিয়ে নেবে। আপনি কি নিশ্চিত?")) {
      setData(DEFAULT_TRUST_SERVICES_DATA);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await saveTrustServicesAction(data);
      if (res.success) {
        setSaveMessage({ type: "success", text: res.message });
      } else {
        setSaveMessage({ type: "error", text: res.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে" });
      }
    } catch (err) {
      setSaveMessage({ type: "error", text: "সার্ভার এরর: " + (err?.message || err) });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#488e14] dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>স্লাইডার ও অঙ্গীকার কন্ট্রোল</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            আমাদের অঙ্গীকার ও সেবা স্লাইডার পরিচালনা
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            হোমপেজের চলমান "আমাদের অঙ্গীকার ও সেবা" স্লাইডার কার্ডের সকল টেক্সট, আইকন, কালার এবং টপ ৩টি পরিসংখ্যান এখান থেকে পরিবর্তন করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4 text-[#488e14]" />
            <span>মূল সাইটে দেখুন</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#488e14] hover:bg-[#3d7a11] text-white text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {saveMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
          saveMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
        }`}>
          <span>{saveMessage.text}</span>
          <button onClick={() => setSaveMessage(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* SECTION 1: সেকশন ব্যাজ ও হেডার সেটিংস */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <Award className="w-5 h-5 text-[#488e14]" />
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            ১. স্লাইডারের উপরের ব্যাজ ও হেডার টেক্সট
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              সেকশন ব্যাজ টেক্সট (Section Sub-heading Badge)
            </label>
            <input
              type="text"
              value={data.section?.badge || ""}
              onChange={(e) => handleSectionChange("badge", e.target.value)}
              placeholder="আমাদের অঙ্গীকার ও সেবা"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
            <p className="text-[11px] text-gray-400 mt-1">স্লাইডারের ঠিক উপরে গোল পিলের ভেতর প্রদর্শিত হয়।</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              ডিফল্ট গ্যারান্টি সাবটাইটেল (Default Card Tag)
            </label>
            <input
              type="text"
              value={data.section?.guaranteeTag || "Smart Agro Guarantee"}
              onChange={(e) => handleSectionChange("guaranteeTag", e.target.value)}
              placeholder="Smart Agro Guarantee"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
            <p className="text-[11px] text-gray-400 mt-1">প্রতিটি কার্ডের শিরোনামের নিচে ছোট ডট সহ যে ট্যাগ থাকে।</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: টপ ৩টি পরিসংখ্যান কাউন্টার (Top 3 Stats) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <Layers className="w-5 h-5 text-[#488e14]" />
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              ২. শীর্ষ ৩টি অ্যানিমেটেড পরিসংখ্যান (Top Overview Stats)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              স্লাইডারের উপরে ৩টি কার্ডে সংখ্যা অ্যানিমেট হয়ে বৃদ্ধি পায়।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(data.stats || []).map((stat, idx) => (
            <div 
              key={stat.id || idx} 
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#488e14]">
                <span>স্ট্যাটাস কার্ড #{idx + 1}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-black">
                  {stat.target?.toLocaleString()}{stat.suffix}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  টার্গেট সংখ্যা (Target Number)
                </label>
                <input
                  type="number"
                  value={stat.target ?? 0}
                  onChange={(e) => handleStatChange(idx, "target", e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  সাফিক্স (যেমন: +, %, K)
                </label>
                <input
                  type="text"
                  value={stat.suffix || "+"}
                  onChange={(e) => handleStatChange(idx, "suffix", e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  লেবেল বা শিরোনাম (Label Text)
                </label>
                <input
                  type="text"
                  value={stat.label || ""}
                  onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                  placeholder="সন্তুষ্ট খামারি ও কাস্টমার"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: স্লাইডার কার্ড পরিচালনা (Slide Cards Manager) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#488e14]" />
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                ৩. স্লাইডার কার্ড তালিকা (Slide Cards - {data.features?.length || 0}টি কার্ড)
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              প্রতিটি কার্ডের শিরোনাম, বিবরণ, আইকন ও কালার পরিবর্তন করুন অথবা নতুন কার্ড যোগ করুন।
            </p>
          </div>

          <button
            onClick={handleAddFeature}
            className="inline-flex items-center gap-1.5 bg-[#488e14] hover:bg-[#3d7a11] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কার্ড যুক্ত করুন</span>
          </button>
        </div>

        {/* Feature Cards Loop */}
        <div className="space-y-5">
          {(data.features || []).map((feature, idx) => {
            const IconObj = AVAILABLE_ICONS[feature.icon] || AVAILABLE_ICONS.ShieldCheck;
            const IconComponent = IconObj.component;
            const selectedColor = COLOR_OPTIONS.find(c => c.id === feature.color) || COLOR_OPTIONS[0];

            return (
              <div 
                key={feature.id || idx}
                className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-gray-200/70 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[#488e14] dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      কার্ড #{idx + 1}: {feature.title || "নতুন অঙ্গীকার"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveFeature(idx, -1)}
                      disabled={idx === 0}
                      title="উপরে নিন"
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white dark:hover:bg-gray-700"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveFeature(idx, 1)}
                      disabled={idx === data.features.length - 1}
                      title="নিচে নিন"
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white dark:hover:bg-gray-700"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(idx)}
                      title="মুছে ফেলুন"
                      className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Inputs Section (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          আইকন নির্বাচন করুন (Icon)
                        </label>
                        <select
                          value={feature.icon}
                          onChange={(e) => handleFeatureChange(idx, "icon", e.target.value)}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                        >
                          {Object.entries(AVAILABLE_ICONS).map(([key, opt]) => (
                            <option key={key} value={key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          কালার থিম (Color Theme)
                        </label>
                        <select
                          value={feature.color}
                          onChange={(e) => handleFeatureChange(idx, "color", e.target.value)}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                        >
                          {COLOR_OPTIONS.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          কার্ড শিরোনাম (Title)
                        </label>
                        <input
                          type="text"
                          value={feature.title || ""}
                          onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                          placeholder="যেমন: দেশব্যাপী ডেলিভারি"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          উপ-শিরোনাম / ট্যাগ (Subtitle Tag)
                        </label>
                        <input
                          type="text"
                          value={feature.subtitle || ""}
                          onChange={(e) => handleFeatureChange(idx, "subtitle", e.target.value)}
                          placeholder="Smart Agro Guarantee"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        সেবার বিবরণ (Description Text)
                      </label>
                      <textarea
                        rows={2}
                        value={feature.description || ""}
                        onChange={(e) => handleFeatureChange(idx, "description", e.target.value)}
                        placeholder="আমাদের অর্ডারকৃত পণ্য সারাদেশে দ্রুততার সাথে ডেলিভারি দিয়ে থাকি..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                      />
                    </div>
                  </div>

                  {/* Live Preview Section (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#488e14]" />
                      <span>লাইভ স্লাইডার কার্ড প্রিভিউ</span>
                    </span>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-700 rounded-2xl p-4 shadow-xs flex flex-col">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${selectedColor.bg} shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-gray-900 dark:text-white text-xs leading-snug">
                            {feature.title || "শিরোনাম"}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedColor.dot}`} />
                            <span>{feature.subtitle || "Smart Agro Guarantee"}</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                        {feature.description || "সেবার বিবরণ এখানে দেখা যাবে..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add button below cards */}
        <div className="text-center pt-2">
          <button
            onClick={handleAddFeature}
            className="inline-flex items-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#488e14] text-gray-600 dark:text-gray-300 hover:text-[#488e14] px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন অঙ্গীকার / সেবা কার্ড যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl flex items-center justify-between gap-4">
        <button
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ডিফল্টে রিসেট</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">
            মোট {data.features?.length || 0}টি স্লাইডার আইটেম
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#488e14] hover:bg-[#3d7a11] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সেভ করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
