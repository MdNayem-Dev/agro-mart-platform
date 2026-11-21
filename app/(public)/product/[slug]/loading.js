export default function ProductLoading() {
  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8 animate-pulse">
      
      {/* Top Notice / Subtle Loading Indicator */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
          <span>/</span>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2 text-[#488e14] text-xs font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-200/60 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#488e14] animate-ping"></div>
          <span>পণ্যটি লোড হচ্ছে...</span>
        </div>
      </div>

      {/* Main Product Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Left Column: Image Skeleton */}
        <div className="relative border border-gray-200 bg-white p-4 rounded-md shadow-xs">
          {/* Badge Skeleton */}
          <div className="absolute top-4 left-4 bg-gray-200 w-12 h-12 rounded-full"></div>
          
          <div className="aspect-square bg-gray-100 rounded-md flex flex-col items-center justify-center overflow-hidden">
            <svg 
              className="w-16 h-16 text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-xs text-gray-400 mt-2 font-medium">ছবি লোড হচ্ছে...</span>
          </div>
        </div>

        {/* Right Column: Info Skeleton */}
        <div className="flex flex-col">
          {/* Title Skeleton */}
          <div className="h-7 bg-gray-200 rounded-md w-11/12 mb-2"></div>
          <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-4"></div>
          
          {/* Subtitle */}
          <div className="h-4 bg-gray-100 rounded w-48 mb-6"></div>

          {/* Short description lines */}
          <div className="space-y-2.5 mb-8">
            <div className="h-3.5 bg-gray-100 rounded w-full"></div>
            <div className="h-3.5 bg-gray-100 rounded w-11/12"></div>
            <div className="h-3.5 bg-gray-100 rounded w-4/5"></div>
          </div>

          {/* Price Row Skeleton */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-green-100 rounded-md w-28"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="space-y-3">
            <div className="h-12 bg-[#488e14]/20 border border-[#488e14]/30 rounded-md flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#488e14] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-[#488e14]">অর্ডার বাটন প্রস্তুত হচ্ছে...</span>
            </div>
            <div className="h-12 bg-gray-100 rounded-md"></div>
          </div>
        </div>

      </div>

      {/* Description Box Skeleton */}
      <div className="w-full max-w-4xl mx-auto mt-8 mb-12">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 border-b-2 border-gray-300"></div>
        <div className="border border-gray-200 p-6 rounded-md bg-white space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="w-full max-w-5xl mx-auto mt-16">
        <div className="h-6 bg-gray-200 rounded w-52 mx-auto mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 bg-white shadow-xs">
              <div className="aspect-square bg-gray-100 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
