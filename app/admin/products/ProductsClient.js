"use client";

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Package,
  Search,
  Plus,
  Pencil,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { createProductAction, updateProductAction, deleteProductAction, uploadImageAction } from '../actions/productActions';
import { optimizeImageBeforeUpload } from '@/lib/imageOptimizer';
import RichTextEditor from '@/components/RichTextEditor';

export default function ProductsClient({ initialProducts = [], initialCategories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Sync state if URL search param changes without effect cascading render
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState(null); // For delete operations
  const [sectionFilter, setSectionFilter] = useState('all_sections');
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    regular_price: '',
    sale_price: '',
    delivery_charge: '',
    stock_status: 'instock',
    stock_quantity: '',
    category: '',
    display_section: 'both',
    short_description: '',
    description: '',
    youtube_video_url: '',
    new_category_name: '',
    image_url: '',
    image_file: null
  });
  
  const searchLower = (searchQuery || '').toLowerCase().trim();
  const filteredProducts = initialProducts.filter(p => {
    // Section filter check
    const sec = p.meta_data?.find(m => m.key === 'display_section')?.value || 'both';
    if (sectionFilter !== 'all_sections') {
      if (sectionFilter === 'both' && sec !== 'both') return false;
      if (sectionFilter === 'popular' && sec !== 'popular') return false;
      if (sectionFilter === 'all' && sec !== 'all') return false;
    }

    if (!searchLower) return true;
    const nameMatch = (p.name || '').toLowerCase().includes(searchLower);
    const catMatch = Array.isArray(p.categories) && p.categories.some(c => (c.name || '').toLowerCase().includes(searchLower));
    const skuMatch = (p.sku || '').toString().toLowerCase().includes(searchLower);
    const idMatch = p.id?.toString().includes(searchLower);
    return nameMatch || catMatch || skuMatch || idMatch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (product) => {
    setIsAdding(false);
    setIsEditing(product.id);
    setImagePreview(null);
    
    // Find youtube video url and display_section in meta_data
    const ytMeta = product.meta_data?.find(m => m.key === 'youtube_video_url');
    const secMeta = product.meta_data?.find(m => m.key === 'display_section');
    
    const currentImg = product.images?.[0]?.src || product.image_url || product.imageUrl || '';
    setImagePreview(currentImg || null);

    setFormData({
      name: product.name || '',
      regular_price: product.regular_price || product.price || '',
      sale_price: product.sale_price || '',
      delivery_charge: product.delivery_charge !== undefined ? product.delivery_charge : (product.deliveryCharge !== undefined ? product.deliveryCharge : ''),
      stock_status: product.stock_status || product.stockStatus || 'instock',
      stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : (product.stockQuantity !== undefined ? product.stockQuantity : ''),
      category: product.categories?.[0]?.id?.toString() || '',
      display_section: secMeta ? secMeta.value : (product.display_section || 'both'),
      short_description: product.short_description || product.shortDescription || '',
      description: product.description || product.fullDescription || '',
      youtube_video_url: ytMeta ? ytMeta.value : '',
      image_url: currentImg,
      image_file: null
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewClick = () => {
    setIsEditing(null);
    setIsAdding(!isAdding);
    setImagePreview(null);
    setFormData({ 
      name: '', 
      regular_price: '', 
      sale_price: '', 
      delivery_charge: '', 
      stock_status: 'instock', 
      stock_quantity: '', 
      category: '', 
      display_section: 'both', 
      short_description: '', 
      description: '', 
      youtube_video_url: '', 
      new_category_name: '', 
      image_url: '', 
      image_file: null 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      let finalImageUrl = formData.image_url;
      
      // If user selected a new file, optimize and upload it
      if (formData.image_file) {
        try {
          setIsProcessingImage(true);
          const optimizedFile = await optimizeImageBeforeUpload(formData.image_file, {
            maxWidth: 2560,
            maxHeight: 2560,
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
            alert(result?.error || "ছবি আপলোড করতে সমস্যা হয়েছে। আপনার এডমিন সেশন চেক করুন এবং আবার চেষ্টা করুন।");
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

      try {
        // Strip image_file so NO browser File object is passed across Server Action boundary!
        const { image_file, ...cleanFormData } = formData;
        const actionData = {
          ...cleanFormData,
          stock_quantity: formData.stock_quantity !== '' && formData.stock_quantity !== null ? parseInt(formData.stock_quantity, 10) : 0,
          image_url: finalImageUrl
        };

        if (isEditing) {
          const res = await updateProductAction(isEditing, actionData);
          if (res && res.success === false) {
            alert(res.error || "পণ্য আপডেট করতে সমস্যা হয়েছে।");
            return;
          }
          setIsEditing(null);
        } else {
          const res = await createProductAction(actionData);
          if (res && res.success === false) {
            alert(res.error || "পণ্য তৈরি করতে সমস্যা হয়েছে।");
            return;
          }
          setIsAdding(false);
        }

        setFormData({ 
          name: '', 
          regular_price: '', 
          sale_price: '', 
          delivery_charge: '', 
          stock_status: 'instock', 
          stock_quantity: '', 
          category: '', 
          display_section: 'both', 
          short_description: '', 
          description: '', 
          youtube_video_url: '', 
          new_category_name: '', 
          image_url: '', 
          image_file: null 
        });
        setImagePreview(null);
        router.refresh();
      } catch (submitErr) {
        console.error("Product submission failed:", submitErr);
        alert("পণ্য সংরক্ষণ করার সময় সমস্যা হয়েছে: " + (submitErr?.message || "সার্ভার রেসপন্স করেনি। অনুগ্রহ করে আবার চেষ্টা করুন।"));
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setLoadingId(id);
      startTransition(async () => {
        await deleteProductAction(id);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your WooCommerce store items</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddNewClick}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {isAdding ? 'Cancel Add' : isEditing ? 'Cancel Edit' : <><Plus className="w-4 h-4" /> Add Product</>}
          </button>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-green-500/30 dark:border-green-500/20 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{initialProducts.length}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Products</p>
          </div>
        </div>
      </div>

      {/* Form Area (Add or Edit) */}
      {(isAdding || isEditing) && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Product Name *</label>
              <input 
                required
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                placeholder="e.g. Tomato Seeds" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2">
              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Regular/Old Price (৳) *</label>
                <input 
                  required
                  type="number" 
                  name="regular_price"
                  value={formData.regular_price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                  placeholder="e.g. 500" 
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Sale/New Price (৳)</label>
                <input 
                  type="number" 
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                  placeholder="e.g. 450" 
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Delivery Charge (৳ / ডেলিভারি চার্জ)</label>
                <input 
                  type="number" 
                  name="delivery_charge"
                  value={formData.delivery_charge}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                  placeholder="e.g. 100 (ডিফল্ট: 0)" 
                />
              </div>

              {/* Stock Management Section */}
              <div className="col-span-full bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Stock Management (স্টক ব্যবস্থাপনা)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                      Stock Status (স্টক অবস্থা) *
                    </label>
                    <select
                      name="stock_status"
                      value={formData.stock_status || 'instock'}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                    >
                      <option value="instock">In Stock (স্টকে আছে)</option>
                      <option value="outofstock">Out of Stock (স্টক শেষ / স্টক আউট)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                      Stock Quantity (স্টক পরিমাণ - কত পিস আছে)
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity ?? ''}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                      placeholder="e.g. 50 (কত পিস স্টকে আছে)"
                    />
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">কত পিস স্টকে আছে লিখুন, ওয়েবসাইটে গ্রাহকরা এই সংখ্যাটি দেখতে পাবেন।</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Category</label>
                <div className="flex flex-col gap-3">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                  >
                    <option value="">Select a category</option>
                    {initialCategories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="new">+ Create New Category</option>
                  </select>
                  
                  {formData.category === 'new' && (
                    <input 
                      type="text" 
                      name="new_category_name"
                      value={formData.new_category_name || ''}
                      onChange={handleInputChange}
                      className="w-full bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                      placeholder="Type new category name here..." 
                      required
                    />
                  )}
                </div>
              </div>

              {/* Display Section Options */}
              <div className="col-span-2">
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">
                  পণ্য প্রদর্শনের সেকশন (Display Section) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label 
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.display_section === 'popular'
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="display_section" 
                      value="popular" 
                      checked={formData.display_section === 'popular'}
                      onChange={handleInputChange}
                      className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div>
                      <span className="block font-bold text-sm">★ জনপ্রিয় পণ্য</span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">শুধু জনপ্রিয় পণ্য সেকশনে শো করবে</span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.display_section === 'all'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="display_section" 
                      value="all" 
                      checked={formData.display_section === 'all'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="block font-bold text-sm">📦 সকল পণ্য</span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">শুধু সকল পণ্য সেকশনে শো করবে</span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.display_section === 'both'
                        ? 'border-green-500 bg-green-50/60 dark:bg-green-950/30 text-green-900 dark:text-green-200 ring-1 ring-green-500'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="display_section" 
                      value="both" 
                      checked={formData.display_section === 'both'}
                      onChange={handleInputChange}
                      className="text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <div>
                      <span className="block font-bold text-sm">✓ জনপ্রিয় ও সকল পণ্য (উভয়টি)</span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">উভয় সেকশনেই একই সাথে শো করবে</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">YouTube Video Link (Optional)</label>
              <input 
                type="url" 
                name="youtube_video_url"
                value={formData.youtube_video_url}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors" 
                placeholder="https://www.youtube.com/watch?v=..." 
              />
            </div>
            
            
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300 font-medium">Product Cover Image</label>
              
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">যেকোনো হাই-কোয়ালিটি ছবি (JPG, PNG, WebP) নির্বাচন করতে পারবেন</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <RichTextEditor 
                label="Short Description (সংক্ষিপ্ত বিবরণ)"
                value={formData.short_description}
                onChange={(html) => setFormData(prev => ({ ...prev, short_description: html }))}
                placeholder="A short compelling description... (ChatGPT থেকে ফরম্যাট করা লেখা পেস্ট করতে পারবেন)"
                minHeight="160px"
              />
            </div>
            
            <div className="md:col-span-2">
              <RichTextEditor 
                label="Detailed Description (পণ্যটির বিস্তারিত বিবরণ)"
                value={formData.description}
                onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                placeholder="Write product description here..."
                minHeight="280px"
              />
            </div>
            
            <div className="md:col-span-2 mt-2 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setIsEditing(null); }}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
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
                      : 'Publish Product'}
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
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="text-gray-900 dark:text-gray-100 font-bold">{filteredProducts.length}</span> items
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">ফিল্টার:</span>
        <button
          onClick={() => setSectionFilter('all_sections')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sectionFilter === 'all_sections'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
          }`}
        >
          সকল আইটেম ({initialProducts.length})
        </button>
        <button
          onClick={() => setSectionFilter('popular')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sectionFilter === 'popular'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 border border-amber-200 dark:border-amber-800/40'
          }`}
        >
          ★ শুধু জনপ্রিয় পণ্য ({initialProducts.filter(p => (p.meta_data?.find(m => m.key === 'display_section')?.value) === 'popular').length})
        </button>
        <button
          onClick={() => setSectionFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sectionFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 border border-blue-200 dark:border-blue-800/40'
          }`}
        >
          📦 শুধু সকল পণ্য ({initialProducts.filter(p => (p.meta_data?.find(m => m.key === 'display_section')?.value) === 'all').length})
        </button>
        <button
          onClick={() => setSectionFilter('both')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sectionFilter === 'both'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 hover:bg-green-50 border border-green-200 dark:border-green-800/40'
          }`}
        >
          ✓ উভয়টি (উভয় সেকশনে) ({initialProducts.filter(p => {
            const v = p.meta_data?.find(m => m.key === 'display_section')?.value;
            return !v || v === 'both';
          }).length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900">
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map(product => {
            const imageUrl = product.images?.[0]?.src || null;
            const categoryName = product.categories?.[0]?.name || 'Uncategorized';
            const price = product.price || product.regular_price || 0;

            return (
              <div key={product.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all flex flex-col">
                
                <div className="relative aspect-[4/3] bg-white dark:bg-white overflow-hidden p-4 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-400">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider border border-gray-200 dark:border-gray-700 shadow-sm">
                    {categoryName}
                  </div>
                  {(() => {
                    const isOut = product.stock_status === 'outofstock' || product.stockStatus === 'outofstock';
                    const rawQty = product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity !== ''
                      ? product.stock_quantity
                      : (product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity !== '' ? product.stockQuantity : null);
                    const qty = rawQty !== null ? Number(rawQty) : null;
                    const isZeroStock = qty !== null && qty <= 0;

                    if (isOut || isZeroStock) {
                      return (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-bold shadow-sm bg-rose-600 text-white flex items-center gap-1">
                          <span>✕ স্টক শেষ</span>
                        </div>
                      );
                    }

                    return (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-bold shadow-sm bg-emerald-600 text-white flex items-center gap-1">
                        <span>✓ ইন স্টক{qty !== null && qty > 0 ? ` (${qty} পিস)` : ''}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2">
                    {(() => {
                      const sec = product.meta_data?.find(m => m.key === 'display_section')?.value || 'both';
                      if (sec === 'popular') {
                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
                            ★ জনপ্রিয় পণ্য
                          </span>
                        );
                      } else if (sec === 'all') {
                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md">
                            📦 সকল পণ্য
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                            ✓ জনপ্রিয় ও সকল পণ্য
                          </span>
                        );
                      }
                    })()}
                  </div>
                  <h3 
                    className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: product.name }}
                  />
                  
                  <div 
                    className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1"
                    dangerouslySetInnerHTML={{ __html: product.short_description || product.description || '' }}
                  />
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ৳{price}
                      </div>
                      {product.delivery_charge > 0 && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          ডেলিভারি: ৳{product.delivery_charge}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        disabled={isPending}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        disabled={isPending}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete product"
                      >
                        {loadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
