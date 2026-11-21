"use client";

import { useState, useTransition } from "react";
import { 
  Upload, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw
} from "lucide-react";
import { saveBrandingAction, uploadBrandingImageAction } from "@/app/admin/actions/brandingActions";
import { optimizeImageBeforeUpload } from "@/lib/imageOptimizer";

const DEFAULT_LOGO_URL = "https://api.smartagrosource.com/wp-content/uploads/2026/07/Smart_Agro_Source_Logo_200x100-6.png";
const DEFAULT_BANNER_URL = "https://api.smartagrosource.com/wp-content/uploads/2026/10/SmartAgroSource_1200x300.png";

export default function BannersClient({ initialLogo = "", initialBanners = [] }) {
  const [logoUrl, setLogoUrl] = useState(initialLogo || DEFAULT_LOGO_URL);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialLogo || DEFAULT_LOGO_URL);

  // Array of banner objects: { id, url, file, preview }
  const [banners, setBanners] = useState(() => {
    const list = Array.isArray(initialBanners) && initialBanners.length > 0
      ? initialBanners.filter(Boolean)
      : [DEFAULT_BANNER_URL];

    return list.slice(0, 4).map((url, idx) => ({
      id: `banner-${Date.now()}-${idx}`,
      url: url || "",
      file: null,
      preview: url || ""
    }));
  });

  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // 1. Handle Logo file change
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      setLogoUrl(""); // clear manual URL when file is picked
    }
  };

  const handleResetLogo = () => {
    setLogoFile(null);
    setLogoPreview(DEFAULT_LOGO_URL);
    setLogoUrl(DEFAULT_LOGO_URL);
  };

  // 2. Handle Banner actions
  const handleAddBanner = () => {
    if (banners.length >= 4) {
      alert("সর্বোচ্চ ৪টি ব্যানার যোগ করা সম্ভব।");
      return;
    }
    setBanners((prev) => [
      ...prev,
      {
        id: `banner-${Date.now()}-${prev.length}`,
        url: "",
        file: null,
        preview: ""
      }
    ]);
  };

  const handleRemoveBanner = (index) => {
    setBanners((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewSlideIndex(0);
  };

  const handleMoveBanner = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    setBanners((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleBannerUrlChange = (index, url) => {
    setBanners((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        url,
        file: null,
        preview: url
      };
      return next;
    });
  };

  const handleBannerFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setBanners((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          file,
          preview: objectUrl,
          url: ""
        };
        return next;
      });
    }
  };

  // 3. Save all changes
  const handleSave = () => {
    setStatusMessage(null);

    startTransition(async () => {
      try {
        let finalLogo = logoUrl;

        // Upload logo if file is selected
        if (logoFile) {
          const optimizedLogo = await optimizeImageBeforeUpload(logoFile, {
            maxWidth: 1200,
            maxHeight: 600,
            quality: 0.92,
            preservePngTransparency: true
          });
          const formData = new FormData();
          formData.append("file", optimizedLogo);
          const uploadRes = await uploadBrandingImageAction(formData);
          if (uploadRes.success && uploadRes.url) {
            finalLogo = uploadRes.url;
            setLogoUrl(finalLogo);
            setLogoFile(null);
          } else {
            setStatusMessage({
              type: "error",
              text: "লোগো আপলোড ব্যর্থ হয়েছে: " + (uploadRes.error || "অজানা ত্রুটি")
            });
            return;
          }
        }

        // Upload each banner if file is selected
        const finalBannerUrls = [];
        for (let i = 0; i < banners.length; i++) {
          const item = banners[i];
          if (item.file) {
            const optimizedBanner = await optimizeImageBeforeUpload(item.file, {
              maxWidth: 2560,
              maxHeight: 1200,
              quality: 0.90
            });
            const formData = new FormData();
            formData.append("file", optimizedBanner);
            const uploadRes = await uploadBrandingImageAction(formData);
            if (uploadRes.success && uploadRes.url) {
              finalBannerUrls.push(uploadRes.url);
            } else {
              setStatusMessage({
                type: "error",
                text: `ব্যানার #${i + 1} আপলোড করতে সমস্যা হয়েছে: ${uploadRes.error || "ত্রুটি"}`
              });
              return;
            }
          } else if (item.url && item.url.trim()) {
            finalBannerUrls.push(item.url.trim());
          }
        }

        // Save to WooCommerce persistent tag
        const saveRes = await saveBrandingAction({
          logo: finalLogo || DEFAULT_LOGO_URL,
          banners: finalBannerUrls
        });

        if (saveRes.success) {
          setStatusMessage({
            type: "success",
            text: saveRes.message || "ব্যানার ও লোগো সফলভাবে সেভ করা হয়েছে!"
          });
          // Update local state previews with permanent uploaded URLs
          setBanners(finalBannerUrls.map((url, idx) => ({
            id: `banner-${Date.now()}-${idx}`,
            url,
            file: null,
            preview: url
          })));
        } else {
          setStatusMessage({
            type: "error",
            text: saveRes.message || "সংরক্ষণ করতে সমস্যা হয়েছে।"
          });
        }
      } catch (err) {
        console.error("Save error:", err);
        setStatusMessage({
          type: "error",
          text: "অপ্রত্যাশিত ত্রুটি ঘটেছে: " + (err.message || err)
        });
      }
    });
  };

  const previewBanners = banners.filter((b) => b.preview || b.url);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#488e14] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ব্র্যান্ডিং ও ব্যানার নিয়ন্ত্রণ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            লোগো ও ব্যানার সেটিংস
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            ওয়েবসাইটের মূল লোগো এবং হোমপেজের ব্যানার/ক্যারোসেল পরিবর্তন করুন।
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
          >
            <span>লাইভ সাইট দেখুন</span>
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

      {/* SECTION 1: Site Logo */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#488e14] flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              ১. ওয়েবসাইটের লোগো (Site Logo)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              হেডার, মেন্যু এবং ফুটারের লোগো হিসেবে প্রদর্শিত হবে।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-4">
          {/* Logo Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl min-h-[140px]">
            <span className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
              বর্তমান লোগো প্রিভিউ
            </span>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center justify-center max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview || DEFAULT_LOGO_URL}
                alt="Logo Preview"
                className="max-h-14 w-auto object-contain"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                নতুন লোগো আপলোড করুন
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 bg-[#488e14] hover:bg-[#3d7a11] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>কম্পিউটার/মোবাইল থেকে আপলোড</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট লোগোতে ফিরুন</span>
                </button>
              </div>
              {logoFile && (
                <p className="text-xs font-bold text-[#488e14] mt-2">
                  ✓ সিলেক্ট করা ফাইল: {logoFile.name} (সেভ করলে স্থায়ীভাবে আপলোড হবে)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                অথবা সরাসরি ইমেজ URL লিংক দিন
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setLogoPreview(e.target.value || DEFAULT_LOGO_URL);
                  setLogoFile(null);
                }}
                placeholder="https://example.com/logo.png"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14] transition-colors"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                প্রস্তাবিত মাপ: ২০০×৫০ বা ২৫০×৮০ পিক্সেল (ট্রান্সপারেন্ট PNG/WebP ফাইল)।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Homepage Banners (Carousel) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>২. হোমপেজ ব্যানার ও স্লাইডার (১ থেকে ৪টি)</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#488e14]">
                  {banners.length}/৪ ব্যানার
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ১টি ব্যানার দিলে একক স্থির থাকবে, আর ২-৪টি ব্যানার দিলে মূল সাইটে স্বয়ংক্রিয় ক্যারোসেল স্লাইডার হবে।
              </p>
            </div>
          </div>

          {/* Add Banner Button */}
          <button
            type="button"
            onClick={handleAddBanner}
            disabled={banners.length >= 4}
            className="inline-flex items-center gap-1.5 bg-[#488e14] hover:bg-[#3d7a11] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্যানার যোগ করুন ({banners.length}/৪)</span>
          </button>
        </div>

        {/* Dynamic Mode Notification */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#488e14] animate-pulse" />
            <span className="text-gray-800 dark:text-gray-200">
              {banners.length === 0
                ? "বর্তমানে কোনো ব্যানার নেই (ডিফল্ট প্রমোশনাল ব্যানার প্রদর্শিত হবে)"
                : banners.length === 1
                ? "বর্তমানে ১টি ব্যানার সক্রিয় (মূল সাইটে একক স্থির ব্যানার হিসেবে থাকবে)"
                : `বর্তমানে ${banners.length}টি ব্যানার সক্রিয় (মূল সাইটে আকর্ষণীয় ক্যারোসেল স্লাইডার হিসেবে চলবে 🚀)`}
            </span>
          </div>

          <span className="text-[11px] text-gray-400 font-medium">
            প্রস্তাবিত অনুপাত: ১২০০×৩৫০ পিক্সেল
          </span>
        </div>

        {/* Banners List */}
        {banners.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20">
            <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
              এখনও কোনো ব্যানার যোগ করা হয়নি
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              আপনার ওয়েবসাইটের প্রথম ব্যানারটি যোগ করতে নিচের বাটনে চাপ দিন।
            </p>
            <button
              onClick={handleAddBanner}
              className="inline-flex items-center gap-1.5 bg-[#488e14] hover:bg-[#3d7a11] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ব্যানার #১ যোগ করুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-xs"
              >
                {/* Banner Item Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200/80 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#488e14] text-white text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      ব্যানার ছবি #{index + 1}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBanner(index, -1)}
                      title="উপরে নিন"
                      className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMoveBanner(index, 1)}
                      title="নিচে নিন"
                      className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(index)}
                      title="মুছে ফেলুন"
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Banner Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  {/* Image Preview */}
                  <div className="w-full aspect-[12/3.5] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-300 dark:border-gray-600">
                    {banner.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.preview}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        কোনো ছবি সিলেক্ট করা নেই
                      </span>
                    )}
                  </div>

                  {/* Upload and URL input */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ছবি আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleBannerFileChange(index, e)}
                        />
                      </label>

                      {banner.file && (
                        <span className="text-xs font-bold text-[#488e14]">
                          ✓ ফাইল: {banner.file.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <input
                        type="url"
                        value={banner.url}
                        onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                        placeholder="অথবা সরাসরি ইমেজ লিংক (URL) দিন..."
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#488e14]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Live Interactive Preview */}
      {previewBanners.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#488e14]" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                লাইভ ক্যারোসেল প্রিভিউ (Live Preview)
              </h2>
            </div>
            <span className="text-xs text-gray-400">
              মূল সাইটে ঠিক এরকম দেখাবে
            </span>
          </div>

          <div className="w-full relative overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-100 group">
            {/* Slide Track */}
            <div
              className="flex w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${previewSlideIndex * 100}%)` }}
            >
              {previewBanners.map((b, idx) => (
                <div key={idx} className="w-full flex-shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.preview}
                    alt={`Preview slide ${idx + 1}`}
                    className="w-full h-auto object-cover select-none"
                  />
                </div>
              ))}
            </div>

            {/* Arrows for multi-banner */}
            {previewBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewSlideIndex((prev) =>
                      prev === 0 ? previewBanners.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewSlideIndex((prev) => (prev + 1) % previewBanners.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  {previewBanners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewSlideIndex(idx)}
                      className={`rounded-full transition-all cursor-pointer ${
                        previewSlideIndex === idx
                          ? "w-6 h-1.5 bg-[#488e14]"
                          : "w-1.5 h-1.5 bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
