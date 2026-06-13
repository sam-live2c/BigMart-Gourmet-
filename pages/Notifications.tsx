import React, { useState } from 'react';
import { Bell, Package, Tag, Info, ChevronRight, CheckCircle2, Trash2, BellOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  type: 'order' | 'offer' | 'info';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const navigate = useNavigate();

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="text-gray-600" size={24} />;
      case 'offer': return <Tag className="text-gray-600" size={24} />;
      default: return <Info className="text-gray-600" size={24} />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center p-4 gap-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="text-gray-800" size={24} />
          </button>
          <h1 className="text-xl font-medium text-gray-900">
            Notifications
          </h1>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="mt-1">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className={`text-base font-medium leading-tight ${!notification.isRead ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap pt-0.5">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {notification.message}
                </p>
                {notification.image && (
                  <div className="mt-3 w-20 h-20 border rounded overflow-hidden">
                    <img src={notification.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex flex-col items-center justify-center mb-6">
              <Bell className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No new notifications</h3>
            <p className="text-sm text-gray-600 mb-6">You're all caught up! Check back later for updates.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-white border border-gray-300 text-gray-800 font-medium px-6 py-2.5 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffc200] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;