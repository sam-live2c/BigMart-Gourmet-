import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CATEGORY_METADATA } from "../constants";
import { Search, ShoppingCart, ArrowLeft, ShoppingBag } from "lucide-react";

interface CategoriesPageProps {
  cartCount?: number;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  // Ensure we find 'foryou' or default
  const defaultCatId = CATEGORIES.find((c) => c.id === "foryou")?.id || CATEGORIES[0].id;
  const [activeCategoryId, setActiveCategoryId] = useState(defaultCatId);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-[60px] sm:bottom-0 bg-white z-[50] flex flex-col font-sans w-full max-w-7xl mx-auto overflow-hidden">
      {/* Header precisely as shown in screenshot */}
      <header className="flex items-center gap-3 px-3 h-[60px] bg-white z-10 shrink-0 border-b border-gray-200 shadow-sm">
        <ArrowLeft strokeWidth={2} size={24} className="text-gray-800 cursor-pointer shrink-0" onClick={() => navigate(-1)} />
        
        <div 
          className="flex-1 flex items-center bg-gray-100 border border-gray-300 rounded-md px-3 h-[42px] cursor-text overflow-hidden"
          onClick={() => navigate('/search-interface')}
        >
          <input 
            type="text" 
            placeholder="Search in Categories..." 
            className="flex-1 bg-transparent outline-none text-[15px] text-gray-900 w-full pointer-events-none"
            readOnly
          />
          <div className="flex items-center gap-3 text-gray-600 shrink-0 bg-gray-100 pl-2">
             <Search size={22} strokeWidth={2} />
          </div>
        </div>

        <div className="relative cursor-pointer shrink-0 pl-1" onClick={() => navigate('/cart')}>
          <ShoppingCart className="text-gray-900" size={26} strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-[5px] h-[18px] rounded-full flex items-center justify-center border-[2px] border-white min-w-[18px]">
              {cartCount}
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-[84px] bg-[#f5f6f8] overflow-y-auto no-scrollbar shrink-0 relative flex flex-col pb-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`relative flex flex-col items-center justify-center py-[14px] px-1 w-full transition-colors ${
                  isActive ? "bg-white" : ""
                }`}
              >
                {/* Green semi-circle indicator for active state */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[40px] bg-green-600 rounded-r-md"></div>
                )}
                
                <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center mb-1 ${
                  isActive ? 'bg-green-50' : 'bg-transparent'
                }`}>
                  {typeof cat.icon === 'string' ? (
                    <span className="text-[23px]">{cat.icon}</span>
                  ) : (
                    cat.icon
                  )}
                </div>
                
                <span className={`text-[11px] text-center tracking-tight px-1 leading-[1.1] ${
                  isActive ? "text-[#15803d] font-semibold" : "text-gray-500 font-semibold"
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-white pl-3 pr-4 pt-3 pb-8">
          
          {(() => {
            const currentCat = CATEGORIES.find(c => c.id === activeCategoryId);
            const metadata = CATEGORY_METADATA[activeCategoryId] || CATEGORY_METADATA['ginger'];
            
            return (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-[16px] font-bold tracking-tight text-black">
                     {currentCat?.name || 'Explore'}
                   </h2>
                </div>
                
                {metadata.groups.map((group, idx) => (
                  <div key={idx} className="mb-6">
                    <h3 className="text-[13px] font-bold text-gray-800 mb-3 uppercase tracking-wider">{group.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {group.items.map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => navigate(`/search?category=${activeCategoryId}`)}
                          className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors"
                        >
                           <div className="w-[55.4px] h-[55.4px] bg-white rounded-full flex items-center justify-center shadow-sm text-[23px] border border-gray-100">
                             {currentCat?.icon || <ShoppingBag className="w-[28px] h-[28px] text-gray-400 stroke-[1.6]" />}
                           </div>
                           <span className="text-[11px] font-semibold text-center leading-tight text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
