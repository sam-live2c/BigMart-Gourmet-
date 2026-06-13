
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  Beef,
  Pizza,
  Soup,
  Cake
} from 'lucide-react';

const CategoryBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm mb-2 border-b overflow-x-auto no-scrollbar scroll-smooth -mx-4 sm:mx-0 px-4 sm:px-0">
      <style>{`
        @keyframes for-you-slide {
          0%, 20% { transform: translateX(0%); }
          25%, 45% { transform: translateX(-20%); }
          50%, 70% { transform: translateX(-40%); }
          75%, 95% { transform: translateX(-60%); }
          100% { transform: translateX(-80%); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 gap-4 sm:gap-8 min-w-max">
        {/* 'For You' Category Option with Sliding Lucide Category Icons */}
        <button
          onClick={() => {
            const element = document.getElementById('for-you-section');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              navigate('/search?category=foryou');
            }
          }}
          className="flex flex-col items-center group cursor-pointer min-w-[4rem] sm:min-w-[5rem] relative active:scale-95 transition-all duration-300 flex-shrink-0 px-2"
        >
          <div className="w-[55.4px] h-[55.4px] sm:w-[73.9px] sm:h-[73.9px] flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 relative rounded-full border border-amber-200 bg-amber-50/40 shadow-xs overflow-hidden">
            <div 
              className="flex flex-row items-center h-full absolute left-0 top-0 cursor-pointer pointer-events-none" 
              style={{ 
                width: '500%', 
                animation: 'for-you-slide 8s cubic-bezier(0.25, 1, 0.5, 1) infinite' 
              }}
            >
              {/* Burgers Icon */}
              <div className="w-[20%] flex items-center justify-center flex-shrink-0">
                <Beef className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-amber-600 stroke-[1.6]" />
              </div>
              {/* Pizzas Icon */}
              <div className="w-[20%] flex items-center justify-center flex-shrink-0">
                <Pizza className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-orange-600 stroke-[1.6]" />
              </div>
              {/* Appetizers Icon */}
              <div className="w-[20%] flex items-center justify-center flex-shrink-0">
                <Soup className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-green-600 stroke-[1.6]" />
              </div>
              {/* Desserts Icon */}
              <div className="w-[20%] flex items-center justify-center flex-shrink-0">
                <Cake className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-pink-600 stroke-[1.6]" />
              </div>
              {/* Loop Clone of Burgers Icon for seamless return */}
              <div className="w-[20%] flex items-center justify-center flex-shrink-0">
                <Beef className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-amber-600 stroke-[1.6]" />
              </div>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-amber-600 group-hover:text-amber-500 text-center transition-colors max-w-[80px] leading-tight flex items-center gap-0.5">
            For You
          </span>
        </button>
        {CATEGORIES.map((cat) => {
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/search?category=${cat.id}`)}
              className="flex flex-col items-center group cursor-pointer min-w-[4rem] sm:min-w-[5rem] relative active:scale-95 transition-all duration-300 flex-shrink-0 px-2"
            >
              
              <div className="w-[55.4px] h-[55.4px] sm:w-[73.9px] sm:h-[73.9px] flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 relative rounded-full border border-gray-100 bg-gray-50 shadow-xs">
                {typeof cat.icon === 'string' ? (
                  <span className="text-[28px]">{cat.icon}</span>
                ) : (
                  cat.icon
                )}
              </div>
              
              <span className="text-[10px] sm:text-xs font-bold text-gray-700 group-hover:text-amber-500 text-center transition-colors max-w-[80px] leading-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
        
        <button
          onClick={() => navigate('/categories')}
          className="flex flex-col items-center group cursor-pointer min-w-[4rem] sm:min-w-[5rem] border-l pl-4 sm:pl-8 border-gray-100 active:scale-95 transition-all duration-300 flex-shrink-0"
        >
          <div className="w-[55.4px] h-[55.4px] sm:w-[73.9px] sm:h-[73.9px] rounded-full bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center mb-2 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white shadow-sm">
            <ChevronRight className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px]" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-gray-400 group-hover:text-gray-900 text-center transition-colors">
            All
          </span>
        </button>
      </div>
    </div>
  );
};

export default CategoryBar;
