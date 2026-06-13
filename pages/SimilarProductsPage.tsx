import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface SimilarProductsPageProps {
  onAddToCart: (product: Product, isBuyNow?: boolean) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  comparisonList: Product[];
  toggleComparison: (product: Product) => void;
}

const SimilarProductsPage: React.FC<SimilarProductsPageProps> = ({
  onAddToCart,
  wishlist,
  onToggleWishlist,
  comparisonList,
  toggleComparison
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const currentProduct = PRODUCTS.find(p => p.id === id);
  const similarProducts = currentProduct 
    ? PRODUCTS.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    : PRODUCTS; // Fallback to all products if not found

  return (
    <div className="bg-[#f1f2f4] min-h-screen pb-24 font-sans">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="mr-3 p-1">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
             {currentProduct ? `Similar to ${currentProduct.name}` : 'Similar Products'}
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {similarProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                isWishlisted={wishlist.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                isComparing={comparisonList.some(c => c.id === p.id)}
                onToggleComparison={toggleComparison}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No similar products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarProductsPage;
