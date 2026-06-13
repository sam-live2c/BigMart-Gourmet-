import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryBar from '../components/CategoryBar';
import { ProductSkeleton, BannerSkeleton, CategoryRowSkeleton, ProductGridSkeleton } from '../components/Skeleton';
import { PRODUCTS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { CartItem, Product } from '../types';

interface HomeProps {
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (item: CartItem) => void;
  comparisonList: Product[];
  onToggleComparison: (product: Product) => void;
}

const banners = [
  {
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Smoked Gourmet Craft",
    title: "PREMIUM BURGERS",
    description: "Thick double-beef patty with aged cheddar, caramelized onions, and house truffle aioli.",
    link: "/product/1"
  },
  {
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Artisan Pizza Oven",
    title: "TRUFFLE PIZZAS",
    description: "Hand-stretched sourdough pizzas featuring wild forest mushrooms and premium white truffle oil.",
    link: "/product/2"
  },
  {
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Divine Sweet Cravings",
    title: "WARM CHOCO LAVA",
    description: "Rich Belgian chocolate cake with a warm flowing center, served with vanilla bean ice cream.",
    link: "/product/4"
  }
];

const Home: React.FC<HomeProps> = ({ 
  wishlist, 
  onToggleWishlist, 
  onAddToCart,
  comparisonList,
  onToggleComparison
}) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  
  const minSwipeDistance = 50;

  const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleTransitionEnd = () => {
    if (activeIndex >= banners.length + 1) {
      setIsTransitioning(false);
      setActiveIndex(1);
    } else if (activeIndex <= 0) {
      setIsTransitioning(false);
      setActiveIndex(banners.length);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (isTransitioning) {
        setActiveIndex((prev) => prev + 1);
      }
    } else if (isRightSwipe) {
      if (isTransitioning) {
        setActiveIndex((prev) => prev - 1);
      }
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const distance = dragStartX - e.clientX;
    if (distance > minSwipeDistance) {
      if (isTransitioning) {
        setActiveIndex((prev) => prev + 1);
      }
    } else if (distance < -minSwipeDistance) {
      if (isTransitioning) {
        setActiveIndex((prev) => prev - 1);
      }
    }
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning) {
      setActiveIndex(index + 1);
    }
  };

  const activeDotIndex = activeIndex <= 0 
    ? banners.length - 1 
    : activeIndex >= banners.length + 1 
      ? 0 
      : activeIndex - 1;

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(loadingTimer);
  }, []);

  const burgers = PRODUCTS.filter(p => p.category === 'burgers');
  const pizzas = PRODUCTS.filter(p => p.category === 'pizzas');
  const appetizersAndSides = PRODUCTS.filter(p => p.category === 'appetizers' || p.category === 'desserts');
  const forYouProducts = PRODUCTS.filter(p => p.rating >= 4.8);

  if (isLoading) {
    return (
      <div className="pb-24 bg-[#f8fafc] overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto w-full overflow-x-hidden px-4">
          <BannerSkeleton />
          <CategoryRowSkeleton />
          <ProductGridSkeleton isPersonalized={true} count={3} />
          <ProductGridSkeleton 
            title="Hot Burgers" 
            subtitle="Thick, flame-grilled beef brisket and pulled pork patties" 
            count={3} 
          />
          <ProductGridSkeleton 
            title="Artisan Wood-Fired Pizzas" 
            subtitle="Hand-stretched sourdough, slow matured for perfect lightness and chew" 
            count={3} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-[#f8fafc] overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto w-full overflow-x-hidden px-4">
        {/* Main Banner Carousel */}
        <div className="pb-4 -mx-4 sm:mx-0 -mt-4 sm:-mt-4">
          <div className="relative h-56 sm:h-96 w-full overflow-hidden bg-white rounded-none sm:rounded-3xl shadow-md group border border-gray-100">
            <div 
              className={`flex w-full h-full cursor-grab active:cursor-grabbing select-none ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : 'transition-none'}`} 
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedBanners.map((banner, index) => (
                <div key={index} className="relative min-w-full w-full h-full shrink-0 cursor-pointer" onClick={() => navigate(banner.link)}>
                  <img src={banner.image} className="w-full h-full object-cover pointer-events-none" alt={banner.title} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-14 text-white">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-2.5 text-amber-500">{banner.subtitle}</span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none mb-3 max-w-xl">{banner.title}</h1>
                    <p className="text-xs sm:text-lg opacity-90 max-w-sm leading-relaxed mb-6 font-medium text-gray-200">{banner.description}</p>
                    <button className="w-max bg-white hover:bg-neutral-100 text-black px-6 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 pointer-events-none">
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${activeDotIndex === index ? 'bg-white scale-110 px-3' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Categories Bar Component */}
        <CategoryBar />

        {/* Dynamic 'For You' Personalized Recommendation Section */}
        <section id="for-you-section" className="bg-[#15803d]/5 p-4 sm:p-6 mb-8 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border border-[#15803d]/15 text-gray-900 shadow-xs relative overflow-hidden transition-all duration-300">
          {/* Decorative ambient ring */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#15803d]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="bg-[#15803d] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                  ⭐ Personalized
                </span>
                <span className="text-xs text-[#15803d] font-bold">Recommended for You</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 mt-1">Recommended Treats</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Top-rated delicacies handpicked based on your premium food interests</p>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#15803d] font-bold bg-[#15803d]/10 px-3 py-1.5 rounded-full border border-[#15803d]/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
              Refreshed In-App
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forYouProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                isComparing={comparisonList.some(p => p.id === product.id)}
                onToggleComparison={onToggleComparison}
              />
            ))}
          </div>
        </section>

        {/* Section 1: Hot Burgers */}
        <section className="bg-white p-4 sm:p-6 mb-8 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border border-gray-100 text-gray-900 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900">Hot Burgers</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Thick, flame-grilled beef brisket and pulled pork patties</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {burgers.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                isComparing={comparisonList.some(p => p.id === product.id)}
                onToggleComparison={onToggleComparison}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Artisan Stone Pizzas */}
        <section className="bg-white p-4 sm:p-6 mb-8 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border border-gray-100 text-gray-900 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900">Artisan Wood-Fired Pizzas</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Hand-stretched sourdough, slow matured for perfect lightness and chew</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pizzas.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                isComparing={comparisonList.some(p => p.id === product.id)}
                onToggleComparison={onToggleComparison}
              />
            ))}
          </div>
        </section>

        {/* Section 3: Appetizers & Desserts */}
        <section className="bg-white p-4 sm:p-6 mb-8 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border border-gray-100 text-gray-900 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900">Appetizers & Sweet Treat</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Fries, crispy buffalo wings, healthy salads, and desserts</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appetizersAndSides.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                isComparing={comparisonList.some(p => p.id === product.id)}
                onToggleComparison={onToggleComparison}
              />
            ))}
          </div>
        </section>



      </div>
    </div>
  );
};

export default Home;
