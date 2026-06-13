
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, X, Clock, Mic, ChevronRight, CornerDownLeft, RotateCcw } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';

interface SuggestionItem {
  id: string;
  name: string;
  category: string;
  image: string;
  brand: string;
  type: 'product' | 'category-scope' | 'history';
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const saved = localStorage.getItem('bigmart_recent_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = () => {
      if (query.trim().length > 0) {
        const q = query.toLowerCase();
        
        // Find matching categories for "In Category" suggestions
        const categoryMatches = CATEGORIES.filter(c => c.name.toLowerCase().includes(q))
          .map(c => ({
            id: c.id,
            name: `Search for "${query}" in ${c.name}`,
            category: c.id,
            image: c.image,
            brand: '',
            type: 'category-scope' as const
          }));

        // Find matching products
        const productMatches = PRODUCTS.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        ).slice(0, 6).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          image: p.image,
          brand: p.brand,
          type: 'product' as const
        }));

        setSuggestions([...categoryMatches, ...productMatches]);
      } else {
        setSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (q: string, categoryId?: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('bigmart_recent_searches', JSON.stringify(updated));
    
    const catParam = categoryId ? `&category=${categoryId}` : '';
    navigate(`/search?q=${encodeURIComponent(trimmed)}${catParam}`);
  };

  const removeRecent = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== item);
    setRecentSearches(updated);
    localStorage.setItem('bigmart_recent_searches', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col font-sans">
      {/* Search Header */}
      <div className="flex items-center gap-1 p-2 bg-[#f6f6f6] border-b shadow-sm sticky top-0 shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-white text-gray-900 py-2.5 pl-4 pr-12 rounded-lg border border-gray-300 focus:border-[#fb641b] focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium shadow-sm"
            placeholder="Search BigMart Gourmet"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          />
          <div className="absolute right-0 flex items-center pr-1">
            {query ? (
              <button onClick={() => setQuery('')} className="p-2.5 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            ) : (
              <div className="flex items-center">
                <button className="p-2.5 text-gray-400 hover:text-gray-600">
                  <Mic size={20} />
                </button>
                <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                   <Search size={22} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {query.trim().length > 0 ? (
          <div className="divide-y divide-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
            {suggestions.map((suggestion, idx) => (
              <button
                key={`${suggestion.id}-${idx}`}
                onClick={() => suggestion.type === 'product' 
                  ? navigate(`/product/${suggestion.id}`) 
                  : handleSearch(query, suggestion.category)
                }
                className="w-full text-left px-4 py-3.5 bg-white active:bg-gray-100 flex items-center gap-4 group"
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                   {suggestion.type === 'category-scope' ? (
                     <Search size={20} className="text-gray-300" />
                   ) : (
                     <img src={suggestion.image} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <span className={`text-sm ${suggestion.type === 'category-scope' ? 'text-[#15803d] font-bold' : 'text-gray-800 font-medium'} truncate block`}>
                     {suggestion.name}
                   </span>
                   {suggestion.type === 'product' && (
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{suggestion.brand}</span>
                   )}
                </div>
                <CornerDownLeft size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : (
          <div className="pb-24">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section className="mb-6 px-4 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Clock size={18} className="text-[#15803d]" /> Recent Searches
                  </h3>
                  <button 
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.setItem('bigmart_recent_searches', JSON.stringify([]));
                    }} 
                    className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSearch(s)}
                      className="flex items-center gap-2 bg-white border border-gray-200 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm hover:border-[#15803d] cursor-pointer group transition-all"
                    >
                      <span className="text-sm font-medium text-gray-700">{s}</span>
                      <button 
                        onClick={(e) => removeRecent(e, s)}
                        className="p-1 text-gray-400 hover:bg-gray-100 group-hover:text-red-500 rounded-full transition-colors"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Departments Grid - Photographic circular icons */}
            <section className="px-4 mb-8">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-black text-gray-900">Browse by Department</h3>
                 <button onClick={() => navigate('/categories')} className="text-xs font-bold text-[#15803d] hover:underline">See All</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => navigate(`/search?category=${cat.id}`)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center p-2 group-hover:shadow-md transition-shadow overflow-hidden">
                       <img src={cat.image} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" alt="" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 text-center leading-tight line-clamp-2">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Account Shortcut */}
            <section className="mx-4 p-5 bg-blue-50/50 rounded-2xl border border-dashed border-orange-200 flex items-center justify-between group cursor-pointer" onClick={() => navigate('/account')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#fb641b]">
                   <RotateCcw size={20} />
                </div>
                <div>
                   <p className="text-xs font-black text-gray-800 uppercase tracking-widest">Keep Shopping for</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Your recently viewed items</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[#fb641b] transition-colors" />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
