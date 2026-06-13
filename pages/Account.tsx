
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Heart, MapPin, CreditCard, Settings, HelpCircle, 
  ChevronRight, LogOut, Wallet, User as UserIcon, ShieldCheck, 
  Bell, Ticket, Gift, Headphones, MessageSquare, Star, Info, FileText, Lock, Cookie, RotateCcw, Truck, Mail
} from 'lucide-react';
import { User } from '../types';

interface AccountProps {
  user: User | null;
  onLogout: () => void;
}

const Account: React.FC<AccountProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-[#15803d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserIcon size={40} className="text-[#15803d]" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 uppercase tracking-tight">Your Profile</h2>
        <p className="text-gray-500 mb-10 text-sm">Log in to view your orders, billing address, and personalized offers.</p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-[#fb641b] text-white py-4 rounded-[2px] font-bold uppercase shadow active:scale-95 transition-all text-sm tracking-wide"
        >
          Login / Signup
        </button>
      </div>
    );
  }

  const gridOptions = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="text-[#15803d]" size={22} />, path: '/profile/edit' },
    { id: 'orders', label: 'My Orders', icon: <Package className="text-[#15803d]" size={22} />, path: '/orders' },
    { id: 'wishlist', label: 'My Wishlist', icon: <Heart className="text-[#15803d]" size={22} />, path: '/cart?tab=wishlist' },
    { id: 'help', label: 'Help Center', icon: <Headphones className="text-[#15803d]" size={22} />, path: '/help' },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-10 bg-[#f1f2f4] min-h-screen">
      {/* Profile Header */}
      <div className="bg-white px-4 py-4 mb-2 flex flex-col items-start justify-start text-left">
        <h1 className="text-xl font-bold text-gray-900">{user.name || 'Guest User'}</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email || ''}</p>
        {user.address && (() => {
          try {
            const addr = user.address.startsWith('{') ? JSON.parse(user.address) : null;
            if (addr) {
              return <p className="text-sm text-gray-500 mt-1">{addr.villCity ? addr.villCity + ' , ' : ''}{addr.pincode ? addr.pincode : ''}{addr.phone ? ', ' + (addr.countryCode || '+91') + ' ' + addr.phone : ''}</p>;
            }
            return <p className="text-sm text-gray-500 mt-1">{user.address}</p>;
          } catch(e) {
            return <p className="text-sm text-gray-500 mt-1">{user.address}</p>;
          }
        })()}
      </div>

      <div className="px-3 pb-10">
        <div className="grid grid-cols-2 gap-2 mb-2">
          {gridOptions.map(option => (
            <Link 
              key={option.id}
              to={option.path}
              className="bg-white p-3 rounded flex items-center gap-3 border border-gray-200 active:bg-gray-50"
            >
              <div className="flex-shrink-0">
                {option.icon}
              </div>
              <span className="text-sm font-medium text-gray-800">{option.label}</span>
            </Link>
          ))}
        </div>

        {/* App Settings */}
        <div className="bg-white rounded mb-2 border border-gray-200 overflow-hidden">
          <Link
            to="/addresses"
            className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-[#15803d]" />
              <span className="text-sm font-medium text-gray-800">My Addresses</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <Link
            to="/privacy"
            className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-800">Privacy Policy</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <Link
            to="/terms"
            className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-800">Terms & Conditions</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <Link
            to="/profile/cancellations"
            className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className="text-[#15803d]" />
              <span className="text-sm font-medium text-gray-800">Cancellations & Refunds</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
