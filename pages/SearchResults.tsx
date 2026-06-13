import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PRODUCTS, CATEGORIES } from "../constants";
import BrandLogo from "../components/BrandLogo";
import { useScrollDirection } from "../hooks/useScrollDirection";
import {
  SlidersHorizontal,
  SearchX,
  Search,
  Star,
  X,
  ChevronRight,
  Store,
  Sparkles,
  ShoppingCart,
  Zap,
  Clock,
  Info,
  ArrowUpDown,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { FilterSkeleton } from "../components/Skeleton";
import { CartItem, Product } from "../types";

interface SearchResultsProps {
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (item: CartItem) => void;
  comparisonList: Product[];
  onToggleComparison: (product: Product) => void;
  cartCount?: number;
}

const ListProductCard: React.FC<{
  product: Product;
  onAddToCart: (p: CartItem) => void;
  onWishlist: (id: string) => void;
  isWishlisted: boolean;
}> = ({ product, onAddToCart, onWishlist, isWishlisted }) => {
  const navigate = useNavigate();

  // Delivery date simulation
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deliveryDate = tomorrow.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="group bg-white border-b border-gray-100 p-4 flex gap-4 sm:gap-6 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Left: Product Image */}
      <div className="w-32 h-32 sm:w-48 sm:h-48 shrink-0 bg-[#f7f7f7] rounded-lg p-2 relative flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-lg text-gray-900 font-medium line-clamp-2 leading-snug mb-1 group-hover:text-[#c45500]">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl sm:text-2xl font-medium text-gray-900 leading-none">
              ₹{(product.price ?? 0).toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-500 line-through">
                M.R.P: ₹{(product.oldPrice ?? 0).toLocaleString()}
              </span>
            )}
            <span className="text-xs text-[#CC0C39] font-medium">
              ({product.discount})
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-700">
              Get it delivered under 1 hour
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-2">
            FREE Delivery by BigMart Gourmet
          </p>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart({ ...product, quantity: 1 });
            }}
            className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full px-4 py-1.5 text-xs font-medium shadow-sm active:scale-95 transition-all"
          >
            Add to Cart
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlist(product.id);
            }}
            className={`p-2 rounded-full transition-colors flex items-center justify-center border ${isWishlisted ? "bg-red-50 text-red-500 border-red-100" : "bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-100"}`}
            aria-label="Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({
  wishlist,
  onToggleWishlist,
  onAddToCart,
  comparisonList,
  onToggleComparison,
  cartCount = 0,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const subCategory = searchParams.get("subCategory") || "";
  const { isVisible } = useScrollDirection();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-low" | "price-high" | "rating"
  >("featured");

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    PRODUCTS.forEach((p) => {
      const matchesSearch = query
        ? p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategory = category ? p.category === category : true;
      const matchesSubCategory = subCategory
        ? p.subCategory === subCategory
        : true;
      if (matchesSearch && matchesCategory && matchesSubCategory) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands).sort();
  }, [query, category, subCategory]);

  const filteredProducts = useMemo(() => {
    let results = PRODUCTS.filter((p) => {
      const matchesSearch = query
        ? p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategory = category ? p.category === category : true;
      const matchesSubCategory = subCategory
        ? p.subCategory === subCategory
        : true;
      const matchesPrice =
        p.price >= minPrice &&
        (maxPrice >= 200000 ? true : p.price <= maxPrice);
      const matchesBrand =
        selectedBrands.length > 0 ? selectedBrands.includes(p.brand) : true;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesPrice &&
        matchesBrand
      );
    });

    if (sortBy === "price-low") results.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") results.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);

    return results;
  }, [
    query,
    category,
    subCategory,
    minPrice,
    maxPrice,
    selectedBrands,
    sortBy,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minPrice > 0 || maxPrice < 200000) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    return count;
  }, [minPrice, maxPrice, selectedBrands]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsInitialLoading(true);
    const timer = setTimeout(() => setIsInitialLoading(false), 400);
    return () => clearTimeout(timer);
  }, [query, category, subCategory]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(200000);
    setSelectedBrands([]);
  };

  const FilterContent = () => (
    <div className="p-4 space-y-8">
      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-3">
          Customer Reviews
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#c45500] group"
            >
              <div className="flex text-[#FFA41C]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < r ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-gray-900 group-hover:text-[#c45500]">
                & Up
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-3">Brands</h3>
        <div className="space-y-2">
          {availableBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded text-[#15803d] border-gray-300"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-gray-900 mb-3">Price</h3>
        <div className="space-y-2 text-sm text-[#007185]">
          <button
            onClick={() => {
              setMinPrice(0);
              setMaxPrice(1000);
            }}
            className="block hover:text-[#c45500] hover:underline"
          >
            Under ₹1,000
          </button>
          <button
            onClick={() => {
              setMinPrice(1000);
              setMaxPrice(5000);
            }}
            className="block hover:text-[#c45500] hover:underline"
          >
            ₹1,000 - ₹5,000
          </button>
          <button
            onClick={() => {
              setMinPrice(5000);
              setMaxPrice(10000);
            }}
            className="block hover:text-[#c45500] hover:underline"
          >
            ₹5,000 - ₹10,000
          </button>
          <button
            onClick={() => {
              setMinPrice(10000);
              setMaxPrice(200000);
            }}
            className="block hover:text-[#c45500] hover:underline"
          >
            Over ₹10,000
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-[#f1f2f4] min-h-screen pb-16 md:pb-0">
      <div className={`sticky top-0 z-50 transition-transform duration-300 w-full flex flex-col ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Mobile Search Header */}
        <div className="bg-[#15803d] text-white pt-3 pb-2 shadow-md flex flex-col gap-3">
          <div className="flex items-center gap-3 px-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div 
            onClick={() => navigate("/search-interface")}
            className="flex-1 bg-white rounded flex items-center px-3 py-1.5 gap-2 shadow-sm relative overflow-hidden group cursor-pointer"
          >
            <Search
              size={18}
              className="text-gray-400 group-focus-within:text-[#15803d] transition-colors"
            />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500 w-full pointer-events-none lg:pointer-events-auto"
              value={query || category || ""}
              readOnly
            />
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="relative p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Results Info Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {filteredProducts.length} results
            </span>{" "}
            for
            <span className="text-[#c45500] font-bold ml-1">
              "{query || category || "items"}"
            </span>
          </div>
        </div>
      </div>
    </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row bg-white min-h-screen w-full">
        {/* Main Results Area */}
        <main className="flex-1 bg-white">
          {/* Results List */}
          <div className="flex flex-col">
            {isInitialLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 border-b border-gray-100 flex gap-6 animate-pulse"
                >
                  <div className="w-48 h-48 bg-gray-100 rounded-lg" />
                  <div className="flex-1 space-y-4 pt-4">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-8 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <ListProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.includes(p.id)}
                  onWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                />
              ))
            ) : (
              <div className="py-24 text-center px-4">
                <SearchX size={64} className="text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  No results for {query || category}
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                  Try clearing some filters or checking your spelling.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#FFD814] px-8 py-2 rounded-full font-medium shadow-sm border border-[#FCD200] hover:bg-[#F7CA00]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>


        </main>
      </div>
    </div>
  );
};

export default SearchResults;
