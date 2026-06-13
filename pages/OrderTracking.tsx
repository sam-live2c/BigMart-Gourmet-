
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Truck, Package, Home, MapPin, CheckCircle2, Clock, ChevronRight, ArrowLeft, ShieldCheck, Phone, Info } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const trackData = [
    { status: 'Order Placed', time: 'Just now', location: 'System', desc: 'Successfully received and confirmed by partner store.', completed: true },
    { status: 'Packed', time: '5 mins ago', location: 'BigMart Gourmet Store', desc: 'Item handpicked, packed and sealed.', completed: true },
    { status: 'Out for Delivery', time: 'On the way', location: 'Delivery Executive', desc: 'Our rider has picked up the order and is speeding to your address.', completed: true },
    { status: 'Delivered', time: 'Under 1 hour', location: 'Home', desc: 'Arriving very soon. Enjoy your fresh order!', completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-gray-900 mb-2">Track your package</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
          <span>Tracking ID: <span className="font-bold text-gray-900">{id || 'OD123456789'}</span></span>
          <span className="hidden sm:inline">|</span>
          <span className="cursor-pointer text-[#007185] hover:text-red-600 hover:underline">View order details</span>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded p-6 mb-6 font-sans">
        <div className="flex flex-col md:flex-row justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
                 <h2 className="text-2xl font-bold text-green-700 mb-1">Out for delivery</h2>
                 <p className="text-gray-700 font-medium">Expected delivered under 1 hour</p>
            </div>
            <div className="mt-4 md:mt-0 max-w-sm">
            </div>
        </div>

        {/* Flat Step Progress Bar - Desktop */}
        <div className="hidden md:block relative px-8 py-10 mb-8 max-w-2xl mx-auto">
             <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gray-200 -translate-y-1/2 rounded-full">
                <div className="h-full bg-green-600 rounded-full w-2/3"></div>
             </div>
             
             <div className="relative flex justify-between z-10 w-full">
                 <div className="flex flex-col items-center">
                     <div className="w-5 h-5 rounded-full bg-green-600 border-[3px] border-white ring-2 ring-green-600 mb-2"></div>
                     <span className="text-xs font-bold text-gray-900 text-center w-24">Ordered<br/><span className="font-normal text-gray-500">Just now</span></span>
                 </div>
                 <div className="flex flex-col items-center">
                     <div className="w-5 h-5 rounded-full bg-green-600 border-[3px] border-white ring-2 ring-green-600 mb-2"></div>
                     <span className="text-xs font-bold text-gray-900 text-center w-24">Packed<br/><span className="font-normal text-gray-500">5 mins ago</span></span>
                 </div>
                 <div className="flex flex-col items-center">
                     <div className="w-5 h-5 rounded-full bg-green-600 border-[3px] border-white ring-2 ring-green-600 mb-2 shadow-[0_0_10px_rgba(22,163,74,0.5)]"></div>
                     <span className="text-xs font-bold text-green-700 text-center w-24">Out for delivery<br/><span className="font-normal text-gray-500">On the way</span></span>
                 </div>
                 <div className="flex flex-col items-center">
                     <div className="w-5 h-5 rounded-full bg-white border border-gray-300 ring-2 ring-transparent mb-2"></div>
                     <span className="text-xs font-medium text-gray-400 text-center w-24">Delivered<br/>Under 1 hour</span>
                 </div>
             </div>
        </div>

        {/* Detailed Tracking History */}
        <div>
           <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Tracking updates</h3>
           <div className="space-y-0 relative border-l-2 border-gray-200 ml-4">
              {trackData.map((step, idx) => (
                <div key={idx} className="relative pl-6 pb-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${step.completed ? 'bg-green-600' : idx === 3 ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'} border-2 border-white`}></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                      <span className="text-sm font-bold text-gray-900 sm:w-28 shrink-0">{step.time.split(',')[0]}<br className="hidden sm:block"/><span className="font-normal text-gray-500">{step.time.split(',')[1]}</span></span>
                      <div>
                          <p className={`text-sm ${step.completed || idx === 3 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>{step.status}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.location}</p>
                      </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-start gap-4">
             <div className="mt-1">
                 <Truck className="text-gray-400" size={24} />
             </div>
             <div>
                <p className="text-sm font-bold text-gray-900">Shipped with BigMart Express Delivery</p>
                <div className="text-sm text-gray-600 mt-1 relative group cursor-pointer inline-flex items-center gap-1">
                    Tracking ID: {id || 'OD123456789'} <Info size={14} className="text-gray-400 group-hover:text-gray-700"/>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-300 shadow-xl p-3 hidden group-hover:block z-20">
                        <p className="text-xs text-gray-800">You can use this tracking ID on the carrier's website for more detailed tracking information.</p>
                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-b border-r border-gray-300 rotate-45 transform"></div>
                    </div>
                </div>
             </div>
         </div>
         <button className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-1.5 px-4 rounded-sm text-sm shadow-sm transition-colors cursor-pointer text-center">
            Contact Carrier
         </button>
      </div>
    </div>
  );
};

export default OrderTracking;