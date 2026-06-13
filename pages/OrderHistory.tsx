
import React, { useState } from 'react';
import { Order, CartItem } from '../types';
import { PRODUCTS } from '../constants';
import { ChevronRight, Search, Settings2, ArrowLeft, Star, CheckCircle2, RefreshCw, X, Filter, MapPin, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface OrderHistoryProps {
  orders: Order[];
  wishlist?: string[];
  onAddToCart?: (item: CartItem) => void;
  onCancelOrder?: (orderId: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, wishlist = [], onAddToCart, onCancelOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelStatusFilters, setCancelStatusFilters] = useState<string[]>([]);
  const [cancelReason, setCancelReason] = useState('Order created by mistake');
  
  const navigate = useNavigate();

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? [] : [status]
    );
  };

  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = a.createdAt || 0;
      const bTime = b.createdAt || 0;
      if (aTime && bTime) {
        return bTime - aTime;
      }
      // Fallback: parse date strings
      const getTime = (dateStr: string) => {
        try {
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        } catch {
          return 0;
        }
      };
      return getTime(b.date) - getTime(a.date);
    });
  }, [orders]);

  const filteredOrders = sortedOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    let matchesStatus = true;
    if (statusFilters.length > 0) {
      if (statusFilters.includes('on_the_way') && ['Placed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(order.status)) {
        matchesStatus = true;
      } else if (statusFilters.includes(order.status)) {
        matchesStatus = true;
      } else {
        matchesStatus = false;
      }
    }
    
    // Time filter
    let matchesTime = true;
    if (timeFilter) {
      const orderDate = new Date(order.date);
      const now = new Date();
      if (!isNaN(orderDate.getTime())) {
        if (timeFilter === 'last_30_days') {
          matchesTime = (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === '2026') {
          matchesTime = orderDate.getFullYear() === 2026;
        } else if (timeFilter === '2025') {
          matchesTime = orderDate.getFullYear() === 2025;
        } else if (timeFilter === '2024') {
          matchesTime = orderDate.getFullYear() === 2024;
        } else if (timeFilter === 'older') {
          matchesTime = orderDate.getFullYear() < 2024;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-10 bg-[#f1f2f4] min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-200">
        <ArrowLeft size={24} className="text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-lg font-medium text-gray-900">My Orders</h1>
      </div>

      <div className="p-2 sm:p-4 mb-2">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative border border-gray-300 rounded-md bg-white overflow-hidden flex items-center px-3">
             <Search size={18} className="text-gray-400" />
             <input 
               type="text" 
               placeholder="Search your order here"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="flex-1 py-3 px-2 text-sm outline-none text-gray-800 placeholder-gray-500"
             />
          </div>
          <button 
            onClick={() => setShowFilters(true)}
            className="bg-white border border-gray-300 rounded-md px-4 flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <Filter size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters {(statusFilters.length > 0 || timeFilter) ? <span className="ml-1 w-2 h-2 rounded-full bg-[#fb641b] inline-block" /> : null}</span>
          </button>
        </div>

        {/* Horizontal Status Filters (YouTube style) */}
        <div className="mt-4 flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 pb-1 px-1">
          {['On the way', 'Delivered', 'Cancelled', 'Returned'].map(status => {
             const statusId = status === 'On the way' ? 'on_the_way' : status;
             const isSelected = statusFilters.includes(statusId);
             return (
               <button
                 key={status}
                 onClick={() => toggleStatusFilter(statusId)}
                 className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${isSelected ? 'bg-gray-800 text-white border-gray-800 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm'}`}
               >
                 {status}
               </button>
             );
          })}
        </div>
      </div>

      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[200]" onClick={() => setShowFilters(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[210] shadow-xl flex flex-col transform transition-transform animate-in slide-in-from-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
               <h2 className="text-lg font-medium text-gray-900 uppercase">Filters</h2>
               <button onClick={() => setShowFilters(false)}><X size={24} className="text-gray-600" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              <div>
                <h3 className="font-medium text-[13px] text-gray-800 uppercase mb-3 tracking-wider">Order Status</h3>
                <div className="space-y-3">
                  {[
                    { id: 'on_the_way', label: 'On the way' },
                    { id: 'Delivered', label: 'Delivered' },
                    { id: 'Cancelled', label: 'Cancelled' },
                    { id: 'Returned', label: 'Returned' }
                  ].map(status => (
                    <label key={status.id} className="flex flex-row items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={statusFilters.includes(status.id)}
                        onChange={() => toggleStatusFilter(status.id)}
                        className="w-4 h-4 text-[#2874f0] bg-white border-gray-300 rounded-full focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#2874f0]" 
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200"></div>
              
              <div>
                <h3 className="font-medium text-[13px] text-gray-800 uppercase mb-3 tracking-wider">Order Time</h3>
                <div className="space-y-3">
                  {[
                    { id: 'last_30_days', label: 'Last 30 days' },
                    { id: '2026', label: '2026' },
                    { id: '2025', label: '2025' },
                    { id: '2024', label: '2024' },
                    { id: 'older', label: 'Older' }
                  ].map(time => (
                    <label key={time.id} className="flex flex-row items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={timeFilter === time.id}
                        onChange={() => setTimeFilter(timeFilter === time.id ? null : time.id)}
                        className="w-4 h-4 text-[#2874f0] bg-white border-gray-300 rounded-full focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#2874f0]" 
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-4 pt-3 pb-6 sm:pb-3 border-t border-gray-200 flex justify-between gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] bg-gray-50">
               <button 
                 onClick={() => { setStatusFilters([]); setTimeFilter(null); }}
                 className="flex-1 px-4 py-2 bg-transparent text-[#2874f0] font-semibold text-sm text-center uppercase"
               >
                 Clear Filters
               </button>
               <button 
                 onClick={() => setShowFilters(false)}
                 className="flex-1 bg-[#fb641b] hover:bg-[#ff5500] text-white px-4 py-2 font-semibold text-sm text-center uppercase rounded shadow-sm transition-colors"
               >
                 Apply
               </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 relative">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isFailed = order.status === 'Cancelled';
            const isRefunded = order.status === 'Returned';
            
            let statusText = order.status;
            let statusColor = "text-green-600";
            if (isFailed) { statusText = "Cancelled"; statusColor = "text-[#ff6161]"; }
            else if (isRefunded) { statusText = "Returned"; statusColor = "text-gray-900"; }
            else if (order.status === 'Processing') { statusText = "Placed"; }
            
            const journeySteps = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
            // Treat 'Processing' same as 'Placed' for the progress index
            const normalizedStatus = order.status === 'Processing' ? 'Placed' : (order.status === 'Cancelled' || order.status === 'Returned' ? 'Placed' : order.status);
            const currentStepIdx = journeySteps.indexOf(normalizedStatus);
            // Default to Placed if status not found
            const activeStep = currentStepIdx >= 0 ? currentStepIdx : 0;

            return (
              <div key={order.id} className="bg-white px-4 py-5 shadow-sm sm:rounded-lg border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigate(`/tracking/${order.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                     <p className="text-xs text-gray-500 font-medium mb-0.5">Order ID: {order.id}</p>
                     <h3 className={`font-semibold text-sm ${statusColor}`}>{statusText} on {order.date}</h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/tracking/${order.id}`);
                       }}
                       className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-[13px] font-medium shadow-xs hover:border-gray-450 transition duration-150 cursor-pointer leading-none"
                     >
                       Track Order
                     </button>
                     <p className="text-base font-extrabold text-gray-900 leading-none mr-1">₹{(order.total ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                {!isFailed && !isRefunded && (
                  <div className="mb-6 mt-2 relative px-2">
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
                     <div 
                       className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full transition-all duration-500"
                       style={{ width: `${(activeStep / (journeySteps.length - 1)) * 100}%` }}
                     />
                     <div className="relative flex justify-between">
                       {journeySteps.map((step, stepIdx) => {
                         const isCompleted = stepIdx <= activeStep;
                         return (
                           <div key={step} className="flex items-center justify-center relative">
                             <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full z-10 ${isCompleted ? 'bg-green-500 ring-4 ring-white' : 'bg-gray-200 ring-4 ring-white'}`} />
                             <span className={`absolute -bottom-6 text-[9px] sm:text-[10px] whitespace-nowrap text-center ${isCompleted ? 'text-gray-900 font-semibold' : 'text-gray-400 font-medium'}`}>
                               {step}
                             </span>
                           </div>
                         );
                       })}
                     </div>
                  </div>
                )}
                
                <div className="space-y-3 mt-8">
                  {order.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${item.id}`);
                      }}
                      className="flex gap-4 p-2 -mx-2 rounded-lg hover:bg-gray-100/50 active:bg-gray-200/45 transition cursor-pointer"
                    >
                       <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-gray-100 rounded bg-white p-1">
                         <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                       </div>
                       <div className="flex-1 min-w-0 flex items-center">
                          <div>
                            <p className="text-sm text-gray-800 line-clamp-2 hover:text-green-700 hover:underline transition-all font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.weightInGrams !== undefined ? (
                                <span>
                                  Pack: {((item.kgQuantity ?? 0) > 0) ? `${item.kgQuantity} kg ` : ""}{((item.gmQuantity ?? 0) > 0) ? `${item.gmQuantity * 100} g` : ""}
                                </span>
                              ) : (
                                `Qty: ${item.quantity}`
                              )}
                            </p>
                          </div>
                       </div>
                       <div className="shrink-0 flex items-center">
                          <ChevronRight size={18} className="text-gray-300" />
                       </div>
                    </div>
                  ))}
                </div>

                {isFailed && (
                   <div className="bg-[#fff7e6] text-gray-800 text-sm mt-4 p-3 rounded border border-orange-100">
                     This order has been cancelled. If any amount was deducted, it will be refunded to your original payment method.
                   </div>
                )}
                
                {isRefunded && (
                   <div className="bg-gray-50 border border-gray-200 mt-4 p-2.5 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">Refund of ₹{(order.total ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] font-bold border border-gray-300 px-1 rounded text-gray-600">UPI</div>
                   </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3 flex-wrap">
                  {(order.status === 'Processing' || order.status === 'Placed') && onCancelOrder && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCancelModalOrder(order); }}
                      className="px-4 py-2 border border-red-200 text-red-600 font-medium text-sm rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) {
                        const availableItems = order.items.filter(item => PRODUCTS.some(p => p.id === item.id));
                        if (availableItems.length === 0) {
                          alert('Sorry, none of the items in this order are currently available.');
                          return;
                        }
                        availableItems.forEach(item => onAddToCart(item));
                        if (availableItems.length < order.items.length) {
                           alert(`Added ${availableItems.length} available items to cart. Some items are no longer available.`);
                        }
                        navigate('/cart');
                      }
                    }}
                    className="flex items-center gap-1.5 px-6 py-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <RefreshCw size={16} className="text-gray-600" />
                    Reorder
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white py-20 text-center px-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No orders found</h3>
            <button onClick={() => navigate('/')} className="mt-4 bg-[#15803d] text-white px-8 py-2.5 rounded font-medium shadow-md">Shop Now</button>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Cancel Order</h2>
              <button 
                onClick={() => setCancelModalOrder(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors animate-in"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            
            <div className="px-5 py-5 space-y-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-800 leading-normal">
                Are you sure you want to cancel this order? 
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">Reason for cancellation (optional)</label>
                <select 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] bg-white p-2 text-sm text-gray-800 transition outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
                >
                  <option value="Order created by mistake">Order created by mistake</option>
                  <option value="Estimated delivery time is too long">Estimated delivery time is too long</option>
                  <option value="Item price/cost is too high">Item price/cost is too high</option>
                  <option value="Found cheaper alternative">Found cheaper alternative</option>
                  <option value="Change shipping address or payment">Change shipping address or payment</option>
                  <option value="Other reasons">Other reasons</option>
                </select>
              </div>

              <div className="bg-[#fcf8e3] text-[#8a6d3b] text-xs p-3.5 rounded border border-[#faebcc] leading-relaxed">
                <span className="font-bold">Refund Information:</span> Once cancelled, refunds for prepaid orders are instantly processed and credited back to your original payment method under our 1-hour fast cancellation service.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50">
              <button 
                onClick={() => setCancelModalOrder(null)}
                className="px-4 h-9 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-xs rounded shadow-sm transition"
              >
                Go Back
              </button>
              <button 
                onClick={() => {
                  if (onCancelOrder) {
                    onCancelOrder(cancelModalOrder.id);
                  }
                  setCancelModalOrder(null);
                }}
                className="px-4 h-9 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow-sm transition"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
