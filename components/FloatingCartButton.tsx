import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  cartCount: number;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ cartCount }) => {
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';
  const isCheckoutPage = location.pathname.startsWith('/checkout');

  // Paths where the "View Cart" floating button should not be shown:
  // - Profile: /account, /profile/*, /payments
  // - My Orders: /orders, /tracking/*
  // - My Wishlist: under /cart (already hidden by isCartPage)
  // - Help Center: /help, /contact
  // - My Addresses: /addresses
  // - Privacy Policy: /privacy
  // - Terms & Conditions: /terms
  // - Cancellations & Refunds: /profile/cancellations, /returns
  // - Auth Pages: /login, /signup
  const hiddenPrefixes = [
    '/account',
    '/profile',
    '/orders',
    '/tracking',
    '/help',
    '/contact',
    '/addresses',
    '/payments',
    '/privacy',
    '/terms',
    '/returns',
    '/login',
    '/signup',
  ];

  const shouldHideByRoute = hiddenPrefixes.some(prefix => 
    location.pathname === prefix || location.pathname.startsWith(prefix + '/')
  );

  if (cartCount <= 0 || isCartPage || isCheckoutPage || shouldHideByRoute) {
    return null;
  }

  // Sits elegant above the 60px mobile nav bar (bottom-20) on mobile screens, 
  // and in the bottom-right corner (bottom-6) on larger desktop screens.
  // On product detail page, we position it higher to prevent overlap with the sticky ordering footer.
  const isProductPage = location.pathname.startsWith('/product/');
  const bottomClass = isProductPage ? 'bottom-[104px]' : 'bottom-20';

  return (
    <Link
      to="/cart"
      id="floating-cart-btn"
      aria-label={`View your shopping cart with ${cartCount} items`}
      className={`fixed ${bottomClass} right-4 md:bottom-6 md:right-6 z-[120] bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-900 flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.5)] border border-amber-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300`}
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart size={18} className="stroke-[2.5]" />
        <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-amber-500 shadow-md">
          {cartCount}
        </span>
      </div>
      <span className="font-extrabold pr-0.5 tracking-wide">View Cart</span>
    </Link>
  );
};

export default FloatingCartButton;
