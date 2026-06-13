
import React, { useState, useEffect } from 'react';
import { CartItem, Product, User, Order } from '../types';
import { PRODUCTS } from '../constants';
import QuantitySelector from '../components/QuantitySelector';
import { Trash2, ShieldCheck, Heart, ChevronRight, X, Star, Info, Zap, Download, ShoppingBag } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
  user?: User | null;
  onOrderSuccess?: (order: Order) => void;
}

const Cart: React.FC<CartProps> = ({ cart, setCart, wishlist = [], onToggleWishlist, user, onOrderSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>('cart');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!user) {
    return (
      <div className="bg-[#f1f3f6] min-h-screen py-16 px-4 font-sans flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-sm shadow-md max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-[#15803d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-[#15803d]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login to view cart</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            You must be logged in to view items in your cart, manage your wishlist, and place orders.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full bg-[#fb641b] text-white h-12 rounded-[2px] font-bold text-sm shadow hover:bg-[#e1520e] transition duration-150 cursor-pointer uppercase tracking-wider"
            >
              Log In to My Account
            </button>
            <div className="text-xs text-gray-400 font-bold uppercase py-1">Or</div>
            <button 
              onClick={() => navigate('/signup')} 
              className="w-full bg-white border border-gray-300 text-[#15803d] h-12 rounded-[2px] font-bold text-sm hover:bg-gray-50 transition duration-150 cursor-pointer uppercase tracking-wider"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Map the local cart list to ensure every item has all correct details from constants (like weightInGrams)
  const enrichedCart = cart.map(item => {
    const original = PRODUCTS.find(p => p.id === item.id);
    if (original) {
      return {
        ...original,
        ...item,
        weightInGrams: original.weightInGrams,
        oldPrice: original.oldPrice ?? item.oldPrice
      };
    }
    return item;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'wishlist' || tab === 'cart') {
      setActiveTab(tab);
    }
  }, [location.search]);

  const wishlistedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  const handleInstantBuy = (item: CartItem) => {
    navigate("/checkout", { state: { directBuyItem: item } });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(id);
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
    setTimeout(() => setIsUpdating(null), 300);
  };

  const updateKgQuantity = (id: string, kgQty: number) => {
    setIsUpdating(id);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const currentGm = item.gmQuantity ?? 0;
        let finalGm = currentGm;
        if (kgQty === 0 && currentGm === 0) {
          finalGm = 1; // set to 100gm minimum to prevent 0g item
        }
        return { ...item, kgQuantity: kgQty, gmQuantity: finalGm };
      }
      return item;
    }));
    setTimeout(() => setIsUpdating(null), 300);
  };

  const updateGmQuantity = (id: string, gmQty: number) => {
    setIsUpdating(id);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const currentKg = item.kgQuantity ?? 0;
        let finalKg = currentKg;
        if (gmQty === 0 && currentKg === 0) {
          return { ...item, gmQuantity: 1, kgQuantity: 0 }; // set to 100gm minimum to prevent 0g item
        }
        return { ...item, gmQuantity: gmQty, kgQuantity: finalKg };
      }
      return item;
    }));
    setTimeout(() => setIsUpdating(null), 300);
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const moveToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    if (onToggleWishlist) onToggleWishlist(product.id);
    setActiveTab('cart');
  };

  const getItemPrice = (item: CartItem) => {
    return item.price * item.quantity;
  }
  
  const getItemOldPrice = (item: CartItem) => {
    const p = item.oldPrice || item.price;
    return p * item.quantity;
  }

  const subtotal = enrichedCart.reduce((sum, item) => sum + getItemOldPrice(item), 0);
  const currentTotal = enrichedCart.reduce((sum, item) => sum + getItemPrice(item), 0);
  const totalSavings = subtotal - currentTotal;
  const delivery = currentTotal > 500 ? 0 : 40;
  const finalAmount = currentTotal + delivery;

  if (isLoading) {
    return (
      <div className="bg-[#f1f2f4] min-h-screen pb-24 md:pb-8 font-sans">
        <div className="max-w-7xl mx-auto md:py-6">
          <div className="flex flex-col lg:flex-row md:gap-4 md:mt-4 p-4 md:p-0">
            <div className="flex-1 space-y-2 md:space-y-4">
              {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white md:rounded-xl shadow-sm overflow-hidden border p-4 flex gap-4 animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded shrink-0"></div>
                    <div className="flex-1 flex flex-col pt-1 space-y-3">
                       <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                       <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                       <div className="h-6 bg-gray-200 rounded w-1/4 mt-2"></div>
                    </div>
                 </div>
              ))}
            </div>
            <div className="w-full lg:w-80 md:px-0 mt-4 md:mt-0 hidden lg:block">
               <div className="bg-white border p-4 md:rounded-xl shadow-sm animate-pulse h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f2f4] min-h-screen pb-24 md:pb-8 font-sans">
      <div className="max-w-7xl mx-auto md:py-6">
        
        {/* Mobile Header Match */}
        <div className="bg-white px-4 py-3 md:rounded-t-lg md:border md:border-b-0 shadow-sm z-10 sticky top-0 md:static">
          <h1 className="text-xl font-medium text-gray-900 mb-4">My Cart</h1>
          
          <div className="flex gap-2 mb-4">
             <button 
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'cart' ? 'bg-[#15803d] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>
                BigMart Gourmet ({cart.length})
             </button>
             <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'wishlist' ? 'bg-[#15803d] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>
                Wishlist ({wishlist.length})
             </button>
          </div>

          <div className="flex justify-between items-start pt-2 border-t border-gray-100">
             <div>
                <p className="text-sm font-medium text-gray-900 mb-0.5">Deliver to: <span className="font-bold">{user ? user.name : 'Guest User'}</span></p>
                <p className="text-xs text-gray-500 truncate max-w-[240px]">{user?.address ? (user.address.startsWith('{') ? `${JSON.parse(user.address).villCity}, ${JSON.parse(user.address).pincode}` : user.address) : 'Provide an address for delivery'}</p>
             </div>
             <button onClick={() => {
                if (user) {
                  navigate('/addresses');
                } else {
                  navigate('/login');
                }
             }} className="px-4 py-1.5 border border-[#15803d]/30 rounded text-[#15803d] font-bold text-sm hover:bg-[#15803d]/5 transition duration-150">Change</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row md:gap-4 md:mt-4">
          <div className="flex-1 space-y-2 md:space-y-4">
            {activeTab === 'cart' ? (
              cart.length === 0 ? (
                 <div className="bg-white border md:rounded-xl p-12 text-center shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                   <p className="text-sm text-gray-500 mt-2 mb-8">Add something to your cart to see it here.</p>
                   <Link to="/" className="inline-block bg-[#fb641b] text-white px-8 py-3 rounded-[2px] font-bold shadow hover:bg-[#e1520e] transition uppercase tracking-wide text-xs">Start Shopping</Link>
                 </div>
              ) : (
                 enrichedCart.map(item => (
                    <div key={item.id} className="bg-white md:rounded-xl shadow-sm overflow-hidden border-y md:border-x md:border-gray-200">
                      <div className={`p-4 flex gap-4 transition-all ${isUpdating === item.id ? 'opacity-50' : ''}`}>
                         
                         {/* Left Image */}
                         <div className="w-24 shrink-0 flex flex-col gap-3 relative">
                            <Link to={`/product/${item.id}`} className="relative border border-gray-200 rounded p-1 block cursor-pointer">
                               <img src={item.image} className="w-full aspect-[4/3] object-contain mix-blend-multiply" alt="" />
                            </Link>
                         </div>
                         
                         {/* Right Info */}
                         <div className="flex-1 flex flex-col pt-1">
                            <Link to={`/product/${item.id}`} className="hover:text-[#c40000] cursor-pointer">
                               <h3 className="text-sm text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                            </Link>
                            <p className="text-xs text-gray-500 truncate mb-1.5">{item.category}</p>
                            
                            <div className="text-base font-bold text-gray-900 leading-tight">
                              `₹${(item.price ?? 0).toLocaleString()}`
                            </div>

                            <div className="mt-3">
                              <div className="w-28">
                                  <QuantitySelector size="sm" quantity={item.quantity} onQuantityChange={(qty) => updateQuantity(item.id, qty)} min={1} max={10} />
                                </div>
                            </div>
                         </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex border-t border-gray-200 bg-white">
                        <button onClick={() => removeItem(item.id)} className="flex-1 flex justify-center items-center gap-1.5 py-3 text-sm font-medium text-gray-600 border-r border-gray-200 hover:bg-gray-50">
                           <Trash2 size={16} className="text-gray-400" /> Remove
                        </button>
                        <button onClick={() => { if(onToggleWishlist) onToggleWishlist(item.id); removeItem(item.id); }} className="flex-1 flex justify-center items-center gap-1.5 py-3 text-sm font-medium text-gray-800 border-r border-gray-200 hover:bg-gray-50">
                           <Download size={16} className="text-gray-400" /> Save for later
                        </button>
                        <button onClick={() => handleInstantBuy(item)} className="flex-1 flex justify-center items-center gap-1.5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                           <Zap size={16} className="text-gray-400" /> Buy this now
                        </button>
                      </div>
                    </div>
                 ))
              )
            ) : (
              wishlistedProducts.length === 0 ? (
                 <div className="bg-white border md:rounded-xl p-12 text-center shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                   <p className="text-sm text-gray-500 mt-2 mb-8">Add items you love here to easily find them later.</p>
                   <Link to="/" className="inline-block bg-[#15803d] text-white px-8 py-3 rounded-[2px] font-bold shadow hover:bg-green-700 transition uppercase tracking-wide text-xs">Start Shopping</Link>
                 </div>
              ) : (
                 wishlistedProducts.map(item => (
                    <div key={item.id} className="bg-white md:rounded-xl shadow-sm overflow-hidden border-y md:border-x md:border-gray-200">
                      <div className="p-4 flex gap-4 transition-all">
                         
                         {/* Left Image */}
                         <div className="w-24 shrink-0 flex flex-col gap-3 relative">
                            <Link to={`/product/${item.id}`} className="relative border border-gray-200 rounded p-1 block cursor-pointer">
                               <img src={item.image} className="w-full aspect-[4/3] object-contain mix-blend-multiply" alt="" />
                            </Link>
                         </div>
                         
                         {/* Right Info */}
                         <div className="flex-1 flex flex-col pt-1">
                            <Link to={`/product/${item.id}`} className="hover:text-[#c40000] cursor-pointer">
                               <h3 className="text-sm text-gray-800 line-clamp-1 mb-1">{item.name}</h3>
                            </Link>
                            <p className="text-xs text-gray-500 truncate">{item.category}</p>
                            
                            <div className="text-lg font-bold text-gray-900 leading-tight">
                              `₹${(item.price ?? 0).toLocaleString()}`
                            </div>
                         </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex border-t border-gray-200 bg-white">
                        <button onClick={() => { if(onToggleWishlist) onToggleWishlist(item.id); }} className="flex-1 flex justify-center items-center gap-1.5 py-3 text-sm font-medium text-gray-600 border-r border-gray-200 hover:bg-gray-50">
                           <Trash2 size={16} className="text-gray-400" /> Remove
                        </button>
                        <button onClick={() => moveToCart(item)} className="flex-1 flex justify-center items-center gap-1.5 py-3 text-sm font-bold text-[#15803d] hover:bg-green-50 transition">
                           <ShoppingBag size={16} className="text-[#15803d]" /> Move to Cart
                        </button>
                      </div>
                    </div>
                 ))
              )
            )}
          </div>

          {/* Price Details Sidebar */}
          {cart.length > 0 && (
            <div className="w-full lg:w-80 md:px-0">
              <div className="bg-white border-y md:border md:rounded-xl shadow-sm md:sticky md:top-36">
                <div className="p-4 border-b font-medium text-gray-600 uppercase">Price Details</div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between text-sm text-gray-800">
                    <span>Price ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                    <span>₹{(subtotal ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{(totalSavings ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Delivery Charges</span>
                    <span className="flex items-center gap-1"><span className="text-gray-400 line-through">₹40</span> FREE</span>
                  </div>
                  <div className="border-t border-dashed pt-4 flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">₹{(finalAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="text-green-600 font-medium text-xs">
                     You will save ₹{(totalSavings ?? 0).toLocaleString()} on this order
                  </div>
                </div>
                <div className="p-4 bg-gray-50 md:rounded-b-xl border-t flex items-start gap-2">
                   <ShieldCheck size={28} className="text-gray-500 shrink-0" />
                   <p className="text-xs text-gray-600 mt-1">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky Bottom Bar for Mobile cart to match styling */}
      {cart.length > 0 && (
        <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-[120] md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
           <div className="flex flex-col">
              <span className="text-xs text-gray-500 line-through">₹{(subtotal ?? 0).toLocaleString()}</span>
              <div className="flex items-center gap-1">
                 <span className="text-lg font-bold text-gray-900">₹{(finalAmount ?? 0).toLocaleString()}</span>
                 <Info size={14} className="text-gray-400" />
              </div>
           </div>
           <button onClick={() => navigate('/checkout')} className="bg-[#fb641b] text-white px-6 py-3 min-w-[160px] rounded-sm font-bold text-sm flex items-center justify-center hover:bg-[#e1520e] uppercase tracking-wide shadow-sm transition">
              Place Order
           </button>
        </div>
      )}

    </div>
  );
};

export default Cart;
