
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlaySquare, LayoutGrid, User, ShoppingCart, Package } from 'lucide-react';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface MobileNavProps {
  cartCount: number;
}

const MobileNav: React.FC<MobileNavProps> = ({ cartCount }) => {
  const location = useLocation();
  const { isVisible } = useScrollDirection();
  const isProductPage = location.pathname.startsWith('/product/');
  const isCheckoutPage = location.pathname.startsWith('/checkout');

  const isHomePage = location.pathname === "/";
  const isSearchPage = location.pathname === "/search" || location.pathname === "/search-interface";
  const shouldHideOnScroll = isHomePage || isSearchPage;

  if (isProductPage || isCheckoutPage) return null;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] h-[60px] pb-1 px-1 flex items-center justify-around md:hidden transition-transform duration-300 ${(shouldHideOnScroll && !isVisible) ? 'translate-y-full' : 'translate-y-0'}`}>
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-[2px] mt-1 w-[25%] transition-colors ${isActive ? 'text-amber-600' : 'text-gray-500'}`
        }
      >
        <Home size={22} strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </NavLink>

      <NavLink 
        to="/categories" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-[2px] mt-1 w-[25%] transition-colors ${isActive ? 'text-amber-600' : 'text-gray-500'}`
        }
      >
        {({ isActive }) => (
          <>
            <LayoutGrid size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>Categories</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/orders" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-[2px] mt-1 w-[25%] transition-colors ${isActive ? 'text-amber-600' : 'text-gray-500'}`
        }
      >
        {({ isActive }) => (
          <>
            <Package size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>Orders</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/account" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-[2px] mt-1 w-[25%] transition-colors ${isActive ? 'text-amber-600' : 'text-gray-500'}`
        }
      >
        <User size={22} strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-tight">Account</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
