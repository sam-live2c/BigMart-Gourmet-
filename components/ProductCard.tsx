import React from "react";
import { Product, CartItem } from "../types";
import { Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  onAddToCart?: (item: CartItem, silent?: boolean) => void;
  isComparing?: boolean;
  onToggleComparison?: (product: Product) => void;
  isCompact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  isCompact = false,
}) => {
  const isOutOfStock = product.stock <= 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({ ...product, quantity: 1 });
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`bg-white rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 border border-gray-100 ${isCompact ? "pb-2.5" : "pb-4"} ${isOutOfStock ? "opacity-75" : ""}`}
      id={`food-card-${product.id}`}
      aria-label={`View details for ${product.name}, price ₹${(product.price ?? 0).toLocaleString()}`}
    >
      {/* Image and Badges Container */}
      <div className={`relative w-full aspect-[4/3] bg-gray-50 overflow-hidden`}>
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
        />

        {/* Top Badges (like BEST SELLER, GOURMET, VEGETARIAN, etc.) */}
        <div className={`absolute ${isCompact ? "top-1.5 left-1.5" : "top-3 left-3"} flex flex-wrap gap-1 z-10`}>
          {product.badges && product.badges.length > 0 ? (
            product.badges.slice(0, isCompact ? 1 : undefined).map((badge, idx) => (
              <span
                key={idx}
                className={`bg-white/95 backdrop-blur-xs text-gray-800 ${isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2.5 py-1"} font-black rounded-[4px] border border-gray-200/50 uppercase tracking-widest shadow-sm`}
              >
                {badge}
              </span>
            ))
          ) : (
            <span className={`bg-white/95 backdrop-blur-xs text-gray-800 ${isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2.5 py-1"} font-black rounded-[4px] border border-gray-200/50 uppercase tracking-widest shadow-sm`}>
              {product.subCategory.toUpperCase()}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={handleWishlistToggle}
            className={`absolute ${isCompact ? "top-1.5 right-1.5 w-7 h-7" : "top-3 right-3 w-8 h-8"} rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-sm z-10`}
            aria-label="Wishlist"
          >
            <Heart
              size={isCompact ? 13 : 16}
              className={`${isWishlisted ? "text-red-500 fill-red-500 animate-pulse" : "text-gray-400"}`}
            />
          </button>
        )}

        {/* Preparation Time Overlay */}
        {product.prepTime && (
          <div className={`absolute ${isCompact ? "bottom-1.5 right-1.5 px-2 py-0.5 text-[8px]" : "bottom-3 right-3 px-2.5 py-1 text-[10px]"} bg-black/65 backdrop-blur-xs text-white font-bold rounded-full flex items-center gap-1 shadow-md`}>
            <Clock size={isCompact ? 9 : 11} className="stroke-[2.5]" />
            <span>{product.prepTime}</span>
          </div>
        )}

        {isOutOfStock && (
          <div
            className="absolute inset-0 bg-white/40 flex items-center justify-center z-20"
            aria-hidden="true"
          >
            <span className={`bg-red-600 text-white ${isCompact ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-1 text-[10px]"} font-black uppercase shadow-sm tracking-wider`}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className={`${isCompact ? "pt-2 px-2.5" : "pt-4 px-4"} flex-1 flex flex-col justify-between`}>
        <div>
          {/* Title and Rating Row */}
          <div className={`flex items-start justify-between gap-1.5 ${isCompact ? "mb-1" : "mb-1.5"}`}>
            <h3 className={`text-gray-900 font-bold ${isCompact ? "text-xs" : "text-base sm:text-lg"} leading-tight tracking-tight line-clamp-1`}>
              {product.name}
            </h3>
            
            <div className={`flex items-center gap-0.5 shrink-0 bg-amber-50 ${isCompact ? "px-1 py-0.5" : "px-2 py-0.5"} rounded-full border border-amber-100`}>
              <Star size={isCompact ? 10 : 13} className="text-amber-500 fill-amber-500" />
              <span className={`text-amber-700 font-extrabold ${isCompact ? "text-[9px]" : "text-xs"}`}>
                {product.rating}
              </span>
            </div>
          </div>

          {/* Description */}
          {!isCompact && (
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom Row - Price and Add to Cart Button */}
        <div className={`flex items-center justify-between gap-1.5 ${isCompact ? "mt-1.5" : "mt-auto"}`}>
          <div className="flex flex-col">
            <span className={`font-black text-gray-900 ${isCompact ? "text-xs sm:text-sm" : "text-xl sm:text-2xl"}`}>
              ₹{(product.price ?? 0).toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className={`text-gray-400 line-through -mt-1 leading-none ${isCompact ? "text-[10px]" : "text-xs"}`}>
                ₹{(product.oldPrice ?? 0).toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`bg-black hover:bg-neutral-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm hover:shadow cursor-pointer select-none ${isCompact ? "text-[10px] px-2 py-1" : "text-xs sm:text-sm px-4 py-2.5"}`}
            id={`add-btn-${product.id}`}
          >
            {isCompact ? "+ Add" : "+ Customize & Add"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
