import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PRODUCTS } from "../constants";
import QuantitySelector from "../components/QuantitySelector";
import {
  Star,
  ShoppingCart,
  Heart,
  ChevronRight,
  Share2,
  MapPin,
  Store,
  ChevronUp,
  RefreshCcw,
  CreditCard,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Check,
  Truck,
  Play,
  ShoppingBag,
  X,
} from "lucide-react";
import { CartItem, Review, Product, User, Order } from "../types";
import ProductCard from "../components/ProductCard";
import Reviews from "../components/Reviews";
import { ProductDetailSkeleton } from "../components/Skeleton";

interface ProductDetailProps {
  onAddToCart: (item: CartItem, silent?: boolean) => void;
  toggleComparison: (product: Product) => void;
  comparisonList: Product[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  cartCount?: number;
  user?: User | null;
  onOrderSuccess?: (order: Order) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  onAddToCart,
  toggleComparison,
  comparisonList,
  wishlist,
  onToggleWishlist,
  cartCount = 0,
  user,
  onOrderSuccess,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = PRODUCTS.find((p) => p.id === id);
  const [selectedImg, setSelectedImg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [deliveryDate, setDeliveryDate] = useState('');

  const handleCheckPincode = () => {
    if (pincode.length !== 6) {
      alert("Please enter a valid 6 digit pincode");
      return;
    }
    setPincodeStatus('checking');
    setTimeout(() => {
      // Mock logic: 100xxx and 500xxx are unavailable for demo
      if (pincode.startsWith('100') || pincode.startsWith('500')) {
        setPincodeStatus('unavailable');
      } else {
        setPincodeStatus('available');
        setDeliveryDate('under 1 hour');
      }
    }, 800);
  };

  const sliderRef = React.useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (product && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on our store!`,
          url: window.location.href,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const [reviews, setReviews] = useState<Review[]>([]);
  const isWishlisted = id ? wishlist.includes(id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    const mockReviews: Review[] = [
      {
        id: "1",
        productId: id!,
        userName: "Evenezer Marak",
        rating: 4,
        comment: "I love the product, but I recently had to change my approach and it works well.",
        date: "1 year ago",
        isVerified: true,
        helpfulCount: 299,
      },
      {
        id: "2",
        productId: id!,
        userName: "Sneha Roy",
        rating: 5,
        comment: "Excellent quality and very good battery backup. Display is crisp.",
        date: "11 months ago",
        isVerified: true,
        helpfulCount: 145,
      },
    ];
    setReviews(mockReviews);

    // Initial Loading State
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [id]);

  if (!product)
    return <div className="p-20 text-center font-bold">Product not found</div>;

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  const handleAddToCart = () => {
    if (product) {
      onAddToCart({ ...product, quantity });
      navigate("/cart");
    }
  };
  const handleBuyNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate("/checkout", { state: { directBuyItem: { ...product, quantity } } });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }
    if (newRating === 0) {
      alert('Please select a rating.');
      return;
    }
    if (!newComment.trim()) {
      return;
    }

    const hasPurchased = user?.orders?.some(order => order.items.some(item => item.id === id)) || false;

    const newReview: Review = {
      id: Date.now().toString(),
      productId: id!,
      userName: user.name || 'Anonymous',
      rating: newRating,
      comment: newComment,
      date: 'Just now',
      isVerified: hasPurchased,
      helpfulCount: 0,
    };

    setReviews([newReview, ...reviews]);
    setNewRating(0);
    setNewComment('');
    setReviewSubmitted(true);

    setTimeout(() => {
      setReviewSubmitted(false);
    }, 3000);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : (product.rating ? product.rating.toFixed(1) : "0.0");
  const numReviews = reviews.length;

  return (
    <div className="bg-[#f1f2f4] min-h-screen pb-32 md:pb-0 font-sans">
      {/* Search Header for Mobile Match (Optional, but helps match screenshot) */}
      <div className="md:hidden sticky top-0 z-50 bg-white flex items-center justify-between p-3 gap-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronRight size={24} className="rotate-180 text-gray-700" />
        </button>
        <div 
          onClick={() => navigate('/search-interface')}
          className="flex-1 bg-gray-100 rounded border border-gray-200 flex items-center px-3 py-2 gap-2 cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search for products"
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 pointer-events-none"
            readOnly
          />
        </div>
        <button onClick={() => navigate("/cart")} className="relative p-1">
          <ShoppingCart size={24} className="text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-2.5 md:gap-4 md:py-6 md:px-4">
        {/* Left Mobile Image Section */}
        <div className="bg-white w-full md:w-5/12 relative aspect-[4/3] md:aspect-square flex flex-col pt-4">
          {/* Actions Grid */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-gray-100 text-gray-400"
            >
              <Heart
                size={20}
                fill={isWishlisted ? "#ff4343" : "none"}
                className={isWishlisted ? "text-[#ff4343]" : ""}
              />
            </button>
            <button onClick={handleShare} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-gray-100 text-gray-600">
              <Share2 size={20} />
            </button>
          </div>

          <div className="flex-1 w-full overflow-hidden mt-4 relative">
            <div 
              ref={sliderRef}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
              style={{ scrollBehavior: 'smooth' }}
              onScroll={(e) => {
                const el = e.currentTarget;
                const index = Math.round(el.scrollLeft / el.clientWidth);
                if (index !== selectedImg) {
                  setSelectedImg(index);
                }
              }}
            >
              {product.images.map((img, i) => (
                <div key={i} className="flex-none w-full h-full snap-center flex items-center justify-center px-8 md:px-16">
                  <img
                    src={img}
                    className="w-full max-h-full object-contain mix-blend-multiply pointer-events-none"
                    alt={`${product.name} ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="h-8 flex justify-center items-center gap-1.5 pb-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedImg(i);
                  if (sliderRef.current) {
                    sliderRef.current.scrollTo({ left: sliderRef.current.clientWidth * i, behavior: 'smooth' });
                  }
                }}
                className={`h-1.5 rounded-full transition-all ${i === selectedImg ? "w-4 bg-[#15803d]" : "w-1.5 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>

        {/* Right Content Column */}
        <div className="w-full md:w-7/12 flex flex-col gap-2.5 md:gap-4">
          {/* Main Info Card */}
          <div className="bg-white p-4 flex flex-col">
            <h1 className="text-[17px] font-sans font-medium text-gray-900 leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Price block */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[22px] font-bold text-gray-900">
                ₹{(product.price ?? 0).toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-[14px] text-gray-400 line-through">
                  ₹{(product.oldPrice ?? 0).toLocaleString()}
                </span>
              )}
              {product.discount && (
                <span className="text-[14px] font-bold text-green-600">
                  {product.discount}
                </span>
              )}
            </div>

            {/* Variant selections placeholder */}
            {product.category === "Laptops" && (
              <>
                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-800 mb-2">
                    Processor:{" "}
                    <span className="font-normal text-gray-600 text-sm">
                      Ryzen 7 | 7445HS
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
                      Ryzen 7 Hexa Core | 7435HS
                    </button>
                    <button className="border-2 border-[#15803d] rounded-md px-3 py-1.5 text-xs font-medium text-gray-800 bg-blue-50/30">
                      Ryzen 7 | 7445HS
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-800 mb-2">
                    Variant:{" "}
                    <span className="font-normal text-gray-600 text-sm">
                      512 GB, 15.6 Inch
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button className="border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700 w-32">
                      1 TB, 15.6 Inch
                    </button>
                    <button className="border-2 border-[#15803d] rounded-md px-3 py-1.5 text-xs font-medium text-gray-800 bg-blue-50/30 w-32">
                      512 GB, 15.6 Inch
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Quantity Selector */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-800">Quantity</h3>
              <div className="w-32">
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} min={1} max={10} size="md" />
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="bg-white p-4 flex flex-col gap-3">
            <h2 className="text-base font-semibold text-gray-950 tracking-tight">
              Delivery details
            </h2>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2.5 items-center">
                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50/30 px-3 py-1.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <MapPin size={18} className="text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setPincodeStatus('idle');
                    }}
                    placeholder="Enter delivery pincode"
                    className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400 py-1"
                  />
                </div>
                <button 
                  onClick={handleCheckPincode}
                  disabled={pincodeStatus === 'checking' || pincode.length !== 6}
                  className="bg-black text-white hover:bg-neutral-900 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 font-bold px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm shrink-0"
                >
                  {pincodeStatus === 'checking' ? 'Checking' : 'Check'}
                </button>
              </div>

              {pincodeStatus === 'available' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#15803d] bg-green-50/50 px-3 py-2 rounded-xl border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse" />
                  <span>Superfast delivery available under 1 hour!</span>
                </div>
              )}
              {pincodeStatus === 'unavailable' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50/50 px-3 py-2 rounded-xl border border-red-100">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Delivery not available for this pincode.</span>
                </div>
              )}

              <div className="flex gap-3 items-center mt-1">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Truck size={16} className="text-gray-650" />
                </div>
                <p className="text-sm font-medium text-gray-800">
                  <span className="text-gray-450 font-normal">Get it delivered</span> under 1 hour
                </p>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          <div className="bg-white p-4 pb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Similar Products
              </h2>
              <button onClick={() => navigate(`/similar-products/${product.id}`)} className="bg-gray-800 text-white rounded-full p-1 cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-smooth">
              {PRODUCTS.filter(
                (p) => p.category === product.category && p.id !== product.id,
              )
                .slice(0, 4)
                .map((p) => (
                  <div key={p.id} className="w-[180px] sm:w-[220px] shrink-0">
                    <ProductCard
                      product={p}
                      isCompact={true}
                      isWishlisted={wishlist.includes(p.id)}
                      onToggleWishlist={onToggleWishlist}
                      onAddToCart={onAddToCart}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Product Highlights */}
          <div className="bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Product highlights
              </h2>
              <button className="bg-gray-100 rounded-lg p-1 text-gray-600">
                <ChevronUp size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {product.highlights.map((h, i) => (
                <div key={i} className="flex gap-3 items-center bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-[#15803d]/10 flex items-center justify-center shrink-0 text-[#15803d]">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-snug">{h}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <Reviews productId={product.id} user={user} />
        </div>
      </div>

      {/* Sticky Bottom Bar Match */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 px-4 pt-3 pb-5 flex items-center gap-3 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:hidden">
        <button
          onClick={handleAddToCart}
          className="flex-1 h-12 bg-white border border-gray-300 rounded-xl text-gray-950 font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all duration-150 shadow-sm"
        >
          <ShoppingCart size={18} className="stroke-[2]" />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 h-12 bg-[#ffc200] hover:bg-amber-400 text-gray-950 font-black text-[15px] flex items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(255,194,0,0.2)] active:scale-95 transition-all duration-150 uppercase tracking-wider"
        >
          Order at ₹{((product.price ?? 0) * quantity).toLocaleString()}
        </button>
      </div>

      {/* Desktop Actions overlay */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.15)] rounded-2xl p-2 border border-gray-100 items-center gap-2 z-50 scale-in animate-in fade-in duration-200">
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-2 font-bold px-5 py-3 text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-50 uppercase tracking-widest text-xs transition duration-150 active:scale-95"
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex items-center gap-2 font-black px-8 py-3 bg-[#ffc200] hover:bg-amber-400 text-gray-950 rounded-xl hover:shadow-[0_4px_14px_rgba(255,194,0,0.25)] uppercase tracking-wider text-xs transition duration-150 active:scale-95"
        >
          Buy Now
        </button>
      </div>

      {/* Account Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in" id="flipkart-auth-modal-backdrop">
          <div className="bg-white rounded-[4px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row min-h-[380px]" id="flipkart-auth-modal-container">
            {/* Left Banner Section (Flipkart Blue style) */}
            <div className="bg-[#2874f0] md:w-[40%] p-6 sm:p-8 flex flex-col justify-between text-white relative">
              <div>
                <h3 className="font-bold text-2xl mb-3 tracking-tight">Login</h3>
                <p className="text-[#dbf0ff] text-sm leading-relaxed">
                  Get access to your Orders, Cart, Wishlist and personalized recommendations
                </p>
              </div>
              
              {/* Subtle illustration/icon */}
              <div className="hidden md:flex justify-center items-center opacity-15 mt-8">
                <ShoppingBag size={110} strokeWidth={1} />
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 md:hidden text-white/80 hover:text-white transition cursor-pointer p-1"
                id="close-mobile-auth-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Right Form Fields / Buttons Section */}
            <div className="md:w-[60%] p-6 sm:p-8 flex flex-col justify-between bg-white relative">
              {/* Desktop Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 hidden md:block text-gray-400 hover:text-[#2874f0] transition cursor-pointer p-1"
                id="close-desktop-auth-btn"
              >
                <X size={20} />
              </button>

              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-6">
                  <h4 className="text-gray-900 font-semibold text-base mb-1">Account Required</h4>
                  <p className="text-xs text-gray-500 leading-normal">
                    Please sign up or log in to place an order and track your delivery live.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      navigate('/login');
                    }}
                    className="w-full bg-[#fb641b] hover:bg-[#e05315] text-white font-semibold text-sm py-3 rounded-[2px] shadow-[0_1px_2px_0_rgba(0,0,0,0.15)] transition duration-150 uppercase tracking-wide cursor-pointer text-center outline-none"
                    id="flipkart-login-action-btn"
                  >
                    Log In to Account
                  </button>
                </div>
              </div>

              {/* Footer Links with Flipkart Signup style */}
              <div className="mt-8 border-t border-gray-100 pt-5 text-center">
                <div className="text-xs font-semibold text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-1.5">
                  <span>New to BigMart?</span>
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      navigate('/signup');
                    }}
                    className="text-[#2874f0] hover:underline uppercase tracking-wide text-[11px] font-bold cursor-pointer bg-none border-none p-0 outline-none"
                    id="flipkart-signup-link"
                  >
                    Create an account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
