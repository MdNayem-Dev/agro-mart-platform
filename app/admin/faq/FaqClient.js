"use client";

import { useState, useTransition } from "react";
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  ChevronDown,
  Search,
  Type,
  ListOrdered,
  Eye,
  MessageSquare
} from "lucide-react";
import { saveFaqAction } from "@/app/admin/actions/faqActions";
import { DEFAULT_FAQ_DATA } from "@/lib/siteDefaults";

const CATEGORY_OPTIONS = [
  { key: "order", label: "অর্ডার ও ডেলিভারি" },
  { key: "machinery", label: "ডেইরি ও কৃষি যন্ত্রপাতি" },
  { key: "payment", label: "পেমেন্ট ও ওয়ারেন্টি" },
  { key: "service", label: "সার্ভিস ও স্পেয়ার পার্টস" },
  { key: "general", label: "সাধারণ জিজ্ঞাসা" },
];

export default function FaqClient({ initialData = null }) {
  const data = initialData || DEFAULT_FAQ_DATA;

  // 1. Header texts state
  const [header, setHeader] = useState({
    badge: data.header?.badge || DEFAULT_FAQ_DATA.header.badge,
    title: data.header?.title || DEFAULT_FAQ_DATA.header.title,
    subtitle: data.header?.subtitle || DEFAULT_FAQ_DATA.header.subtitle,
  });

  // 2. CTA texts state
  const [cta, setCta] = useState({
    tag: data.cta?.tag || DEFAULT_FAQ_DATA.cta.tag,
    title: data.cta?.title || DEFAULT_FAQ_DATA.cta.title,
    subtitle: data.cta?.subtitle || DEFAULT_FAQ_DATA.cta.subtitle,
  });

  // 3. FAQs list state
  const [faqs, setFaqs] = useState(() => {
    if (Array.isArray(data.faqs) && data.faqs.length > 0) {
      return data.faqs.map((item, idx) => ({
        id: item.id ? String(item.id) : `faq-${Date.now()}-${idx}`,
        category: item.category || "general",
        categoryName: item.categoryName || "সাধারণ জিজ্ঞাসা",
        question: item.question === "নতুন প্রশ্ন লিখুন..." ? "" : (item.question || ""),
        answer: item.answer === "এখানে আপনার বিস্তারিত উত্তর লিখুন..." ? "" : (item.answer || "")
      }));
    }
    return DEFAULT_FAQ_DATA.faqs;
  });

  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewOpenId, setPreviewOpenId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState(null);

  // Add a new Question & Answer
  const handleAddFaq = () => {
    const newId = `faq-${Date.now()}`;
    const newFaq = {
      id: newId,
      category: "order",
      categoryName: "অর্ডার ও ডেলিভারি",
      question: "",
      answer: ""
    };

    setFaqs((prev) => [newFaq, ...prev]);
    setSearchFilter("");
    setCategoryFilter("all");
  };

  // Delete a Question
  const handleDeleteFaq = (id) => {
    if (confirm("আপনি কি নিশ্চিত যে এই প্রশ্ন ও উত্তরটি মুছে ফেলতে চান?")) {
      setFaqs((prev) => prev.filter((item) => item.id !== id));
      if (previewOpenId === id) setPreviewOpenId(null);
    }
  };

  // Move item Up or Down
  const handleMoveFaq = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    setFaqs((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Update a field on an FAQ
  const handleFaqChange = (id, field, value) => {
    setFaqs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "category") {
            const found = CATEGORY_OPTIONS.find((c) => c.key === value);
            updated.categoryName = found ? found.label : "সাধারণ জিজ্ঞাসা";
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Save changes via server action
  const handleSave = () => {
    setStatusMessage(null);

    // Validation
    const cleanFaqs = faqs.filter(
      (item) => item.question?.trim() && item.answer?.trim()
    );

    if (cleanFaqs.length === 0) {
      setStatusMessage({
        type: "error",
        text: "অন্তত একটি বৈধ প্রশ্ন এবং উত্তর থাকা আবশ্যক।"
      });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          header,
          cta,
          faqs: cleanFaqs
        };

        const res = await saveFaqAction(payload);
        if (res.success) {
          setStatusMessage({
            type: "success",
            text: res.message || "FAQ সফলভাবে সেভ করা হয়েছে এবং মূল সাইটে আপডেট হয়ে গেছে!"
          });
        } else {
          setStatusMessage({
            type: "error",
            text: res.message || "সংরক্ষণ করতে সমস্যা হয়েছে।"
          });
        }
      } catch (err) {
        console.error("Save error:", err);
        setStatusMessage({
          type: "error",
          text: "অপ্রত্যাশিত সমস্যা হয়েছে: " + (err?.message || err)
        });
      }
    });
  };

  // Filtered FAQs for display in editor
  const filteredFaqs = faqs.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }
    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase().trim();
      const matchQ = (item.question || "").toLowerCase().includes(query);
      const matchA = (item.answer || "").toLowerCase().includes(query);
      return matchQ || matchA;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#488e14] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সাপোর্ট ও সাধারণ জিজ্ঞাসা নিয়ন্ত্রণ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            FAQ সেকশন ও প্রশ্ন-উত্তর ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            ওয়েবসাইটের সাধারণ জিজ্ঞাসা সেকশনের টেক্সট এবং প্রশ্ন-উত্তর যোগ, এডিট বা ডিলিট করুন।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/#faq"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
          >
            <span>লাইভ সাইটে দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#488e14] hover:bg-[#3d7a11] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 border shadow-xs animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#488e14] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-semibold">{statusMessage.text}</div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* CARD 1: Section Header & CTA Texts */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#488e14] flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              ১. সেকশন টেক্সট সেটিংস (Section Header & CTA)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              মূল সাইটে FAQ সেকশনের ওপরের শিরোনাম এবং নিচের হেল্পলাইন টেক্সট কাস্টমাইজ করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Badge */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              সেকশন ব্যাজ টেক্সট (Badge)
            </label>
            <input
              type="text"
              value={header.badge}
              onChange={(e) => setHeader((prev) => ({ ...prev, badge: e.target.value }))}
              placeholder="সাধারণ জিজ্ঞাসা • Frequently Asked Questions"
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
          </div>

          {/* Section Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              মূল শিরোনাম (Main Title)
            </label>
            <input
              type="text"
              value={header.title}
              onChange={(e) => setHeader((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="আপনার মনে থাকা প্রয়োজনীয় প্রশ্নের উত্তর"
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
          </div>

          {/* Section Subtitle */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              উপশিরোনাম / বিবরণ (Subtitle)
            </label>
            <textarea
              rows={2}
              value={header.subtitle}
              onChange={(e) => setHeader((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="স্মার্ট এগ্রো সোর্স থেকে কেনাকাটা, দেশব্যাপী হোম ডেলিভারি..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
          </div>

          {/* Helpline CTA Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              নিচের হেল্পলাইন ব্যানার টাইটেল
            </label>
            <input
              type="text"
              value={cta.title}
              onChange={(e) => setCta((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="আপনার কি অন্য কোনো প্রশ্ন বা জানার আছে?"
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
          </div>

          {/* Helpline CTA Subtitle */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              নিচের হেল্পলাইন ব্যানার সাবটাইটেল
            </label>
            <input
              type="text"
              value={cta.subtitle}
              onChange={(e) => setCta((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="আমাদের অভিজ্ঞ কৃষি ও ডেইরি এক্সপার্টদের সাথে এখনই কথা বলুন..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: FAQ Questions & Answers Management */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>২. প্রশ্ন ও উত্তর তালিকা (Q&A List)</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#488e14]">
                  মোট {faqs.length}টি প্রশ্ন
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                প্রশ্ন এবং উত্তর এডিট করুন, নতুন প্রশ্ন যোগ করুন বা অপ্রয়োজনীয় প্রশ্ন মুছে দিন।
              </p>
            </div>
          </div>

          {/* Add FAQ Button */}
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1.5 bg-[#488e14] hover:bg-[#3d7a11] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রশ্ন যোগ করুন</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === "all"
                  ? "bg-[#488e14] text-white shadow-xs"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              সব ({faqs.length})
            </button>
            {CATEGORY_OPTIONS.map((cat) => {
              const count = faqs.filter((f) => f.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat.key
                      ? "bg-[#488e14] text-white shadow-xs"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="প্রশ্ন খুঁজুন..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#488e14]"
            />
          </div>
        </div>

        {/* FAQs List */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20">
            <HelpCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
              কোনো প্রশ্ন পাওয়া যায়নি
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              {searchFilter ? "সার্চ ফিল্টারের সাথে মিলছে না।" : "নতুন প্রশ্ন যুক্ত করতে নিচের বাটনে চাপুন।"}
            </p>
            <button
              onClick={handleAddFaq}
              className="inline-flex items-center gap-1.5 bg-[#488e14] hover:bg-[#3d7a11] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম প্রশ্নটি যোগ করুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const originalIndex = faqs.findIndex((f) => f.id === faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-gray-50/70 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
                >
                  {/* Item Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-200/80 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#488e14] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {originalIndex + 1}
                      </span>
                      
                      {/* Category selector */}
                      <select
                        value={faq.category}
                        onChange={(e) => handleFaqChange(faq.id, "category", e.target.value)}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#488e14]"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Order & Delete actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={originalIndex === 0}
                        onClick={() => handleMoveFaq(originalIndex, -1)}
                        title="উপরে নিন"
                        className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={originalIndex === faqs.length - 1}
                        onClick={() => handleMoveFaq(originalIndex, 1)}
                        title="নিচে নিন"
                        className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.id)}
                        title="মুছে ফেলুন"
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Input */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                        প্রশ্ন (Question):
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(faq.id, "question", e.target.value)}
                        placeholder="নতুন প্রশ্ন লিখুন..."
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                      />
                    </div>

                    {/* Answer Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                        উত্তর (Answer):
                      </label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(faq.id, "answer", e.target.value)}
                        placeholder="এখানে আপনার বিস্তারিত উত্তর লিখুন..."
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#488e14] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CARD 3: Live Accordion Preview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#488e14]" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              লাইভ একর্ডিয়ন প্রিভিউ (Live Accordion Preview)
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            ক্লিক করে প্রশ্ন-উত্তর পরীক্ষা করুন
          </span>
        </div>

        {/* Live Preview Accordion Box */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50/70 to-emerald-50/20 dark:from-gray-800/40 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-3">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#488e14] text-[11px] font-bold uppercase mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{header.badge}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
              {header.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mt-1">
              {header.subtitle}
            </p>
          </div>

          {faqs.slice(0, 4).map((faq, idx) => {
            const isOpen = previewOpenId === faq.id || (previewOpenId === null && idx === 0);
            return (
              <div
                key={faq.id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isOpen
                    ? "bg-white dark:bg-gray-900 border-[#488e14] shadow-xs"
                    : "bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPreviewOpenId(isOpen ? -1 : faq.id)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {idx + 1}. {faq.question || "নতুন প্রশ্ন..."}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOpen ? "rotate-180 text-[#488e14]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-0 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-2 leading-relaxed">
                    {faq.answer || "এখানে উত্তর প্রদর্শিত হবে..."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-[#488e14] hover:bg-[#3d7a11] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন (Save Changes)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
