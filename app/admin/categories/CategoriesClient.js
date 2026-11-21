"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Grid,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../actions/categoryActions';
import { uploadImageAction } from '../actions/productActions';
import { optimizeImageBeforeUpload } from '@/lib/imageOptimizer';

export default function CategoriesClient({ initialCategories }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    image_file: null,
    banner_url: '',
    banner_file: null,
  });
  
  const filteredCategories = initialCategories.filter(c => 
    (c.name || '').toLowerCase().includes((searchQuery || '').toLowerCase().trim())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (category) => {
    setIsAdding(false);
    setIsEditing(category.id);
    setImagePreview(null);
    setBannerPreview(null);
    setFormData({
      name: category.name || '',
      description: (category.description || '').replace(/<[^>]*>?/gm, ''),
      image_url: category.image?.src || category.image_url || '',
      image_file: null,
      banner_url: category.banner_url || category.bannerUrl || category.banner?.src || '',
      banner_file: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewClick = () => {
    setIsEditing(null);
    setIsAdding(!isAdding);
    setImagePreview(null);
    setBannerPreview(null);
    setFormData({ name: '', description: '', image_url: '', image_file: null, banner_url: '', banner_file: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      let finalImageUrl = formData.image_url;
      let finalBannerUrl = formData.banner_url;
      
      // If user selected a new category icon/image
      if (formData.image_file) {
        try {
          setIsProcessingImage(true);
          const optimizedFile = await optimizeImageBeforeUpload(formData.image_file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.90
          });
          const uploadData = new FormData();
          uploadData.append('file', optimizedFile);
          
          let result;
          try {
            result = await uploadImageAction(uploadData);
          } catch (serverActionErr) {
            console.warn("Server action upload failed, trying /api/upload fallback:", serverActionErr);
            try {
              const apiRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
              });
              result = await apiRes.json();
            } catch (apiErr) {
              throw serverActionErr;
            }
          }

          if (result && result.success && result.url) {
            finalImageUrl = result.url;
          } else {
            console.error("Image upload failed:", result?.error);
            alert(result?.error || "ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            return;
          }
        } catch (err) {
          console.error("Image upload exception:", err);
          alert("ছবি আপলোড করার সময় সমস্যা হয়েছে: " + (err?.message || ""));
          return;
        } finally {
          setIsProcessingImage(false);
        }
      }

      // If user selected a new category banner file
      if (formData.banner_file) {
        try {
          setIsProcessingImage(true);
          const optimizedBanner = await optimizeImageBeforeUpload(formData.banner_file, {
            maxWidth: 2560,
            maxHeight: 1440,
            quality: 0.90
          });
          const bannerUploadData = new FormData();
          bannerUploadData.append('file', optimizedBanner);

          let bannerResult;
          try {
            bannerResult = await uploadImageAction(bannerUploadData);
          } catch (serverActionErr) {
            try {
              const apiRes = await fetch('/api/upload', {
                method: 'POST',
                body: bannerUploadData,
              });
              bannerResult = await apiRes.json();
            } catch (apiErr) {
              throw serverActionErr;
            }
          }

          if (bannerResult && bannerResult.success && bannerResult.url) {
            finalBannerUrl = bannerResult.url;
          } else {
            alert(bannerResult?.error || "ব্যানার আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            return;
          }
        } catch (err) {
          console.error("Banner upload exception:", err);
          alert("ব্যানার আপলোড করার সময় সমস্যা হয়েছে: " + (err?.message || ""));
          return;
        } finally {
          setIsProcessingImage(false);
        }
      }

      const actionData = {
        name: formData.name,
        description: formData.description,
        image_url: finalImageUrl,
        banner_url: finalBannerUrl,
      };

      if (isEditing) {
        await updateCategoryAction(isEditing, actionData);
        setIsEditing(null);
      } else {
        await createCategoryAction(actionData);
        setIsAdding(false);
      }
      router.refresh();
      setImagePreview(null);
      setBannerPreview(null);
      setFormData({ name: '', description: '', image_url: '', image_file: null, banner_url: '', banner_file: null });
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setLoadingId(id);
      startTransition(async () => {
        await deleteCategoryAction(id);
        router.refresh();
        setLoadingId(null);
      });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage product categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddNewClick}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {isAdding ? 'Cancel Add' : isEditing ? 'Cancel Edit' : <><Plus className="w-4 h-4" /> Add Category</>}
          </button>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-green-500/30 dark:border-green-500/20 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{initialCategories.length}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Categories</p>
          </div>
        </div>
      </div>

      {/* Form Area */}
      {(isAdding || isEditing) && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-green-600 dark:text-green-400" />
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Category Name *</label>
              <input 
                required
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                placeholder="e.g. সার" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors h-24 resize-none" 
                placeholder="A short description..." 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Category Image</label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl mb-2 shadow-xs border border-green-200 dark:border-green-800 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Selected preview" className="h-28 w-auto object-contain rounded-lg" />
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-medium text-xs mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>নির্বাচিত ছবি: {formData.image_file?.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image_file: null }));
                          setImagePreview(null);
                        }}
                        className="text-red-500 text-xs font-bold hover:underline cursor-pointer"
                      >
                        ছবি পরিবর্তন বা বাদ দিন
                      </button>
                    </div>
                  ) : formData.image_url ? (
                    <div className="flex flex-col items-center">
                      <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl mb-2 shadow-xs border border-gray-200 dark:border-gray-700/60 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.image_url} alt="Current" className="h-24 w-auto object-contain rounded-lg" />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">বর্তমান ছবি</div>
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                        <span>নতুন ছবি আপলোড করুন</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setFormData(prev => ({ ...prev, image_file: file }));
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }} />
                      </label>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                          <span>ছবি নির্বাচন করুন</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setFormData(prev => ({ ...prev, image_file: file }));
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }} />
                        </label>
                        <p className="pl-1">অথবা ড্রপ করুন</p>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center justify-center gap-1">
                        <span>📌 আদর্শ সাইজ: ৩০০ × ৩০০ পিক্সেল (১:১ স্কয়ার অনুপাত, PNG/WebP সবচেয়ে ভালো)</span>
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        হোমপেজ টপ স্লাইডার ও ক্যাটাগরি গ্রিডে এই ছবিটি প্রদর্শিত হবে
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Banner Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Category Banner / Cover Image (ক্যাটাগরি কভার ব্যানার - ঐচ্ছিক)
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="space-y-1 text-center w-full max-w-lg">
                  {bannerPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl mb-2 shadow-xs border border-green-200 dark:border-green-800 flex items-center justify-center w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bannerPreview} alt="Banner preview" className="h-28 w-full object-cover rounded-lg" />
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-medium text-xs mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>নির্বাচিত ব্যানার: {formData.banner_file?.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, banner_file: null }));
                          setBannerPreview(null);
                        }}
                        className="text-red-500 text-xs font-bold hover:underline cursor-pointer"
                      >
                        ব্যানার পরিবর্তন বা বাদ দিন
                      </button>
                    </div>
                  ) : formData.banner_url ? (
                    <div className="flex flex-col items-center">
                      <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl mb-2 shadow-xs border border-gray-200 dark:border-gray-700/60 flex items-center justify-center w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.banner_url} alt="Current banner" className="h-24 w-full object-cover rounded-lg" />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">বর্তমান ব্যানার</div>
                      <label htmlFor="banner-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                        <span>নতুন ব্যানার আপলোড করুন</span>
                        <input id="banner-upload" name="banner-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setFormData(prev => ({ ...prev, banner_file: file }));
                            setBannerPreview(URL.createObjectURL(file));
                          }
                        }} />
                      </label>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                        <label htmlFor="banner-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                          <span>ব্যানার ছবি নির্বাচন করুন</span>
                          <input id="banner-upload" name="banner-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setFormData(prev => ({ ...prev, banner_file: file }));
                              setBannerPreview(URL.createObjectURL(file));
                            }
                          }} />
                        </label>
                        <p className="pl-1">অথবা ড্রপ করুন</p>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center justify-center gap-1">
                        <span>📌 আদর্শ সাইজ: ১২০০ × ৩৫০ বা ১২৮০ × ৩৬০ পিক্সেল (১৬:৫ বা ৪:১ ওয়াইড কভার ব্যানার)</span>
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        নির্দিষ্ট ক্যাটাগরি পেজের একদম শীর্ষে হেডার ব্যানার হিসেবে প্রদর্শিত হবে
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 mt-2 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setIsEditing(null); setImagePreview(null); }}
                disabled={isPending || isProcessingImage}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isPending || isProcessingImage}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {(isPending || isProcessingImage) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessingImage 
                  ? 'ছবি অপ্টিমাইজ ও আপলোড হচ্ছে...' 
                  : isPending 
                    ? 'সংরক্ষণ হচ্ছে...' 
                    : isEditing 
                      ? 'Save Changes' 
                      : 'Publish Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Display */}
      <div className="mb-6 flex flex-col sm:flex-row lg:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900">
            No categories found matching your search.
          </div>
        ) : (
          filteredCategories.map(category => {
            const imageUrl = category.image?.src || null;

            return (
              <div key={category.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all flex flex-col">
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-white border border-gray-200 dark:border-gray-700/60 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                      {imageUrl ? (
                        <img src={imageUrl} alt={category.name} className="w-full h-full object-contain" />
                      ) : (
                        <Grid className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {category.id} • Count: {category.count}</p>
                    </div>
                  </div>
                  
                  {category.description && (
                    <div 
                      className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1"
                      dangerouslySetInnerHTML={{ __html: category.description }}
                    />
                  )}
                  
                  <div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClick(category)}
                        disabled={isPending}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        disabled={isPending}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete category"
                      >
                        {loadingId === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
