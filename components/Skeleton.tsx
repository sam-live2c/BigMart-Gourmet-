import React from 'react';

interface ProductSkeletonProps {
  isCompact?: boolean;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ isCompact = false }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-gray-100 ${isCompact ? "pb-2.5" : "pb-4"} animate-pulse`}>
      {/* Image Container Aspect [4/3] */}
      <div className="relative w-full aspect-[4/3] bg-gray-100/80 flex items-center justify-center">
        {/* Top Badge Placeholder */}
        <div className={`absolute ${isCompact ? "top-1.5 left-1.5 w-16 h-4" : "top-3 left-3 w-20 h-5"} bg-gray-200 rounded-[4px]`} />
        
        {/* Wishlist Button Placeholder */}
        <div className={`absolute ${isCompact ? "top-1.5 right-1.5 w-7 h-7" : "top-3 right-3 w-8 h-8"} rounded-full bg-gray-200`} />
        
        {/* Prep Time Overlay Placeholder */}
        <div className={`absolute ${isCompact ? "bottom-1.5 right-1.5 w-10 h-4" : "bottom-3 right-3 w-14 h-5"} bg-gray-200 rounded-full`} />
      </div>

      {/* Info Container */}
      <div className={`${isCompact ? "pt-2 px-2.5" : "pt-4 px-4"} flex-1 flex flex-col justify-between`}>
        <div className="space-y-2">
          {/* Title & Star Rating Row */}
          <div className="flex items-start justify-between gap-1.5">
            <div className={`bg-gray-200 rounded w-2/3 ${isCompact ? "h-3.5" : "h-4"}`} />
            <div className={`bg-gray-200 rounded-full shrink-0 ${isCompact ? "w-8 h-4" : "w-10 h-5"}`} />
          </div>

          {/* Description Placeholder (Only for non-compact card) */}
          {!isCompact && (
            <div className="space-y-1.5 mt-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          )}
        </div>

        {/* Price & CTA Button Row */}
        <div className={`flex items-center justify-between gap-1.5 ${isCompact ? "mt-3" : "mt-6"}`}>
          <div className="space-y-1">
            <div className={`bg-gray-200 rounded ${isCompact ? "h-4 w-12" : "h-5 w-16"}`} />
            <div className={`bg-gray-100 rounded ${isCompact ? "h-3 w-8" : "h-3.5 w-10"}`} />
          </div>
          
          {/* CTA Action button skeleton */}
          <div className={`bg-gray-200 rounded-full ${isCompact ? "h-7 w-12" : "h-9 w-28"}`} />
        </div>
      </div>
    </div>
  );
};

export const CategoryRowSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-sm mb-4 border-b overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 animate-pulse">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 gap-4 sm:gap-8 min-w-max">
        {/* 'For You' Circle Button */}
        <div className="flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] px-2">
          <div className="w-[55.4px] h-[55.4px] sm:w-[73.9px] sm:h-[73.9px] rounded-full border border-amber-100 bg-amber-50/20 shadow-xs" />
          <div className="h-3.5 bg-amber-200 rounded w-10 mt-2" />
        </div>
        
        {/* Other uniform options */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] px-2">
            <div className="w-[55.4px] h-[55.4px] sm:w-[73.9px] sm:h-[73.9px] rounded-full border border-gray-100 bg-gray-50/80 shadow-xs" />
            <div className="h-3 bg-gray-200 rounded w-12 mt-2.5" />
          </div>
        ))}

        {/* All Chevron action button */}
        <div className="flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] border-l pl-4 sm:pl-8 border-gray-100">
          <div className="w-[55.4px] h-[55.4px] sm:w-[73.9px] sm:h-[73.9px] rounded-full bg-gray-50 border border-gray-100" />
          <div className="h-3 bg-gray-100 rounded w-6 mt-2.5" />
        </div>
      </div>
    </div>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <div className="pb-4 -mx-4 sm:mx-0 -mt-4 sm:-mt-4 animate-pulse">
      <div className="relative h-56 sm:h-96 w-full bg-slate-200 rounded-none sm:rounded-3xl shadow-md border border-gray-100 flex flex-col justify-center px-6 sm:px-14">
        {/* Badge */}
        <div className="w-24 h-4 bg-gray-300 rounded mb-3" />
        {/* Title */}
        <div className="w-2/3 sm:w-1/2 h-8 sm:h-12 bg-gray-300 rounded mb-4" />
        {/* Description */}
        <div className="space-y-2 mb-6 max-w-sm">
          <div className="w-full h-3.5 bg-gray-150 rounded" />
          <div className="w-4/5 h-3.5 bg-gray-150 rounded" />
        </div>
        {/* CTA Button */}
        <div className="w-28 h-10 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

interface ProductGridSkeletonProps {
  title?: string;
  subtitle?: string;
  isPersonalized?: boolean;
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ 
  title, 
  subtitle, 
  isPersonalized = false, 
  count = 3 
}) => {
  return (
    <section 
      className={`p-4 sm:p-6 mb-8 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border shadow-xs animate-pulse ${
        isPersonalized 
          ? "bg-[#15803d]/5 border-[#15803d]/15 text-gray-900" 
          : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <div className={`flex items-center justify-between mb-6 border-b pb-4 ${isPersonalized ? "border-[#15803d]/10" : "border-gray-50"}`}>
        <div className="flex flex-col space-y-1.5 w-full">
          {isPersonalized && (
            <div className="flex items-center gap-2">
              <span className="bg-[#15803d]/20 text-[#15803d] text-[10px] w-24 h-5 rounded-[4px] inline-block" />
              <div className="bg-[#15803d]/20 w-32 h-4 rounded-full" />
            </div>
          )}
          
          {title ? (
            <h2 className={`font-black tracking-tight ${isPersonalized ? "text-gray-800" : "text-gray-950"} text-lg sm:text-2xl`}>
              {title}
            </h2>
          ) : (
            <div className={`rounded-md w-40 sm:w-48 ${isPersonalized ? "bg-[#15803d]/20" : "bg-gray-200"} h-6 sm:h-8`} />
          )}

          {subtitle ? (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>
          ) : (
            <div className={`rounded w-64 max-w-full ${isPersonalized ? "bg-[#15803d]/10" : "bg-gray-100"} h-3.5`} />
          )}
        </div>
      </div>
      
      {/* Product Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    </section>
  );
};

export const FilterSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded w-full" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="h-4 bg-gray-200 rounded w-full" />
        ))}
      </div>
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-[#f1f2f4] min-h-screen pb-24 md:pb-0 font-sans animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-0 md:gap-4 md:py-6 md:px-4">
        {/* Gallery / Image container */}
        <div className="bg-white w-full md:w-5/12 aspect-[4/3] md:aspect-square bg-gray-150 rounded-none md:rounded-2xl shadow-sm" />
        
        {/* Info detail content */}
        <div className="w-full md:w-7/12 flex flex-col gap-2 p-4 md:p-0">
          {/* Header Card */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-8 w-1/4 bg-gray-200 rounded mt-2" />
          </div>
          
          {/* Main Info Card */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="h-4.5 w-1/3 bg-gray-200 rounded mb-2" />
            
            {/* Customization levels mockup */}
            <div className="space-y-4">
              <div className="h-10 w-full bg-gray-100 rounded-lg" />
              <div className="h-10 w-full bg-gray-100 rounded-lg" />
              <div className="h-10 w-full bg-gray-100 rounded-lg" />
            </div>
            
            {/* Action buttons mockup */}
            <div className="flex gap-4 mt-6">
              <div className="h-12 flex-1 bg-gray-200 rounded-full" />
              <div className="h-12 flex-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

