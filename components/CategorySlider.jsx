import Link from 'next/link';
import { getProductCategories } from '@/lib/api';
import CategorySliderTrack from './CategorySliderTrack';

export default async function CategorySlider() {
  const categories = await getProductCategories();
  
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col mt-2 md:mt-1 mb-3 md:mb-3">
      {/* Header - Desktop */}
      <div className="hidden md:flex justify-end mb-2">
        <Link 
          href="/categories" 
          className="bg-[#66b333] hover:bg-green-700 text-white px-3 py-1.5 rounded-sm text-xs font-bold transition-colors shadow-2xs"
        >
          সকল ক্যাটাগরি দেখুন →
        </Link>
      </div>

      {/* Header - Mobile */}
      <div className="flex md:hidden items-center justify-between px-2 mb-2">
        <h3 className="text-lg font-bold text-gray-900">পণ্য বিভাগ সমূহ</h3>
        <Link 
          href="/categories" 
          className="text-[#488e14] text-sm font-bold hover:text-green-800 transition-colors flex items-center gap-1"
        >
          সব দেখুন <span className="text-lg leading-none">→</span>
        </Link>
      </div>

      {/* Slider Track Container */}
      <CategorySliderTrack categories={categories} />
    </div>
  );
}

