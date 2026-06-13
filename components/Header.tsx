import React, { useState } from "react";
import {
  Search,
  User as UserIcon,
  ShoppingCart,
  Bell,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User } from "../types";
import { useScrollDirection } from "../hooks/useScrollDirection";

interface HeaderProps {
  cartCount: number;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, cartCount }) => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isSearchPage = location.pathname === "/search" || location.pathname === "/search-interface";
  const shouldHideOnScroll = isHomePage || isSearchPage;
  const { isVisible, isScrolled } = useScrollDirection();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const query = encodeURIComponent(searchInput.trim());
      navigate(`/search?q=${query}`);
      setSearchInput("");
    }
  };

  const showHeader = location.pathname === "/";

  if (!showHeader) return null;

  return (
    <div className={`flex flex-col w-full sticky top-0 z-[110] transition-transform duration-300 ${(shouldHideOnScroll && !isVisible) ? '-translate-y-full' : 'translate-y-0'}`}>
      <header
        className={`w-full transition-all duration-300 ${
          isScrolled ? "bg-neutral-900 shadow-lg py-1" : "bg-neutral-900 py-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Link
              to="/"
              className="flex flex-col items-start leading-none transition-transform active:scale-95"
            >
              <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
                BigMart <span className="text-amber-500">Gourmet</span>
              </span>
              <span className="text-[9px] text-white/70 font-bold tracking-widest uppercase mt-0.5">
                CRUCIAL CRAVINGS
              </span>
            </Link>
          </div>

          {/* Center: Desktop Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div
              onClick={() => navigate('/search-interface')}
              className="relative flex items-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 cursor-pointer group transition-all"
            >
              <input
                type="text"
                placeholder="Search for delicious burgers, pizzas, desserts..."
                className="flex-1 h-11 px-5 bg-transparent text-gray-900 text-sm font-semibold outline-none placeholder-gray-400 pointer-events-none"
                readOnly
              />
              <button
                className="h-11 px-5 bg-[#f3f3f3] text-[#222] hover:bg-gray-200 border-l border-gray-100 transition-colors flex items-center justify-center shrink-0 pointer-events-none"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-1 sm:gap-4 text-white shrink-0">
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 md:hidden hover:bg-white/10 rounded-full transition-all flex items-center justify-center bg-white/5 border border-white/10"
              aria-label="Notifications"
            >
              <Bell size={22} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => navigate("/search-interface")}
              className="p-2 md:hidden hover:bg-white/10 rounded-full transition-all flex items-center justify-center bg-white/5 border border-white/10 ml-1 sm:ml-0"
              aria-label="Open search"
            >
              <Search size={22} />
            </button>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/notifications")}
                className="hover:scale-105 transition-transform flex items-center"
                aria-label="Notifications cursor-pointer"
              >
                <Bell size={20} />
              </button>

              {!user ? (
                <Link
                  to="/login"
                  className="bg-amber-500 text-neutral-900 px-8 py-1.5 rounded font-black text-sm hover:bg-amber-600 shadow-sm transition-all border border-amber-500"
                >
                  Login
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="flex items-center gap-1 font-bold text-sm hover:underline"
                >
                  <UserIcon size={18} /> {user.name.split(" ")[0]}
                </Link>
              )}

              <Link
                to="/cart"
                className="flex items-center gap-2 font-bold text-sm hover:scale-105 transition-transform relative"
              >
                <ShoppingCart size={20} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-neutral-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-amber-500 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
