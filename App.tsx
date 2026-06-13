import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import Compare from './pages/Compare';
import SimilarProductsPage from './pages/SimilarProductsPage';
import Notifications from './pages/Notifications';
import Account from './pages/Account';
import HelpCenter from './pages/HelpCenter';
import StaticInfo from './pages/StaticInfo';
import Contact from './pages/Contact';
import ProfileSubPages from './pages/ProfileSubPages';
import FloatingCartButton from './components/FloatingCartButton';
import { CartItem, User, Order, Product, Address } from './types';
import { CheckCircle, ShoppingCart, Heart, X } from 'lucide-react';
import { PRODUCTS } from './constants';

const ComparisonBar = ({ list, onRemove, onClear }: { list: Product[], onRemove: (p: Product) => void, onClear: () => void }) => {
  const navigate = useNavigate();
  if (list.length === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-[150] border-t py-4 px-4 sm:px-8 flex items-center justify-between animate-in slide-in-from-bottom-full duration-300 max-w-full overflow-hidden safe-bottom">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
        {list.map(p => (
          <div key={p.id} className="relative shrink-0 w-10 h-10 sm:w-12 sm:h-12 border rounded bg-white p-1 transition-transform active:scale-90">
            <img src={p.image} className="w-full h-full object-contain" alt="" />
            <button onClick={() => onRemove(p)} className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 shadow-lg"><X size={10} /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 sm:gap-4 ml-4 shrink-0">
        <button onClick={onClear} className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500">Clear</button>
        <button onClick={() => navigate('/compare')} disabled={list.length < 2} className="bg-[#15803d] text-white px-4 sm:px-6 py-2 rounded-lg shadow-lg hover:bg-[#166534] disabled:bg-gray-200 transition-all font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Compare</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'cart' | 'wishlist' } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online! Reconnecting to live services.', 'cart');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('You are offline. Browsing the cached product catalog.', 'wishlist');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // 1. Initial localstorage loads
    const savedCart = localStorage.getItem('bigmart_cart');
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}
    
    const savedUser = localStorage.getItem('bigmart_user');
    if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (e) {}
    
    const savedWishlist = localStorage.getItem('bigmart_wishlist');
    if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}

    // 2. Auth listener
    let unsubUser: (() => void) | null = null;
    let unsubAddresses: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;
    let unsubCart: (() => void) | null = null;
    let unsubWishlist: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      // Cleanup previous sub listeners
      if (unsubUser) unsubUser();
      if (unsubAddresses) unsubAddresses();
      if (unsubOrders) unsubOrders();
      if (unsubCart) unsubCart();
      if (unsubWishlist) unsubWishlist();

      if (fbUser) {
        // Transition guest local storage to Cloud
        if (localStorage.getItem('bigmart_cart')) {
          try {
            const localCart = JSON.parse(localStorage.getItem('bigmart_cart') || '[]');
            if (localCart.length > 0) {
              const batch = writeBatch(db);
              localCart.forEach((item: any) => {
                const itemRef = doc(db, 'users', fbUser.uid, 'cart', item.id);
                // Stripping functions/React elements to keep data pure JSON compatible
                batch.set(itemRef, {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  kgQuantity: item.kgQuantity ?? 0,
                  gmQuantity: item.gmQuantity ?? 1,
                  image: item.image || '',
                  category: item.category || ''
                });
              });
              await batch.commit();
              localStorage.removeItem('bigmart_cart');
            }
          } catch (e) {}
        }
        
        if (localStorage.getItem('bigmart_wishlist')) {
          try {
            const localWish = JSON.parse(localStorage.getItem('bigmart_wishlist') || '[]');
            if (localWish.length > 0) {
              const batch = writeBatch(db);
              localWish.forEach((productId: string) => {
                const itemRef = doc(db, 'users', fbUser.uid, 'wishlist', productId);
                batch.set(itemRef, { productId });
              });
              await batch.commit();
              localStorage.removeItem('bigmart_wishlist');
            }
          } catch (e) {}
        }

        if (localStorage.getItem('bigmart_user')) {
          try {
            const guestUser = JSON.parse(localStorage.getItem('bigmart_user') || 'null');
            if (guestUser) {
              const userRef = doc(db, 'users', fbUser.uid);
              const profileUpdate: any = {};
              if (guestUser.name && guestUser.name !== 'Google User' && guestUser.name !== 'Customer') {
                profileUpdate.name = guestUser.name;
              }
              if (guestUser.email) {
                profileUpdate.email = guestUser.email;
              }
              if (guestUser.address) {
                profileUpdate.address = guestUser.address;
              }
              
              if (Object.keys(profileUpdate).length > 0) {
                await setDoc(userRef, profileUpdate, { merge: true });
              }

              if (guestUser.addresses && guestUser.addresses.length > 0) {
                const batch = writeBatch(db);
                guestUser.addresses.forEach((addr: any) => {
                  const addrIdStr = addr.id ? String(addr.id) : Date.now().toString();
                  const addrRef = doc(db, 'users', fbUser.uid, 'addresses', addrIdStr);
                  batch.set(addrRef, addr);
                });
                await batch.commit();
              }

              if (guestUser.orders && guestUser.orders.length > 0) {
                const batch = writeBatch(db);
                guestUser.orders.forEach((ord: any) => {
                  const ordRef = doc(db, 'users', fbUser.uid, 'orders', ord.id || ('OD' + Date.now().toString()));
                  const orderToSet = JSON.parse(JSON.stringify(ord));
                  batch.set(ordRef, orderToSet);
                });
                await batch.commit();
              }
              
              localStorage.removeItem('bigmart_user');
            }
          } catch (e) {
            console.error("Failed to migrate guest user data during login:", e);
          }
        }

        // Set up Listeners
        const userRef = doc(db, 'users', fbUser.uid);
        
        let profileData: any = null;
        let addressesList: Address[] = [];
        let ordersList: Order[] = [];

        const triggerUserUpdate = (prof: any, addrs: Address[], ords: Order[]) => {
          if (prof) {
            setUser({
              name: prof.name || fbUser.displayName || 'Google User',
              email: fbUser.email || prof.email || '',
              address: prof.address || '',
              addresses: addrs,
              orders: ords
            });
          }
        };

        unsubUser = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            profileData = snap.data();
          } else {
            profileData = {
              name: fbUser.displayName || 'Google User',
              email: fbUser.email || '',
              address: ''
            };
            setDoc(userRef, profileData).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
            });
          }
          triggerUserUpdate(profileData, addressesList, ordersList);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
        });

        unsubAddresses = onSnapshot(collection(db, 'users', fbUser.uid, 'addresses'), (snap) => {
          addressesList = snap.docs.map(d => d.data() as Address);
          triggerUserUpdate(profileData, addressesList, ordersList);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}/addresses`);
        });

        unsubOrders = onSnapshot(collection(db, 'users', fbUser.uid, 'orders'), (snap) => {
          ordersList = snap.docs.map(d => d.data() as Order);
          triggerUserUpdate(profileData, addressesList, ordersList);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}/orders`);
        });

        // Cart Sync Listener
        unsubCart = onSnapshot(collection(db, 'users', fbUser.uid, 'cart'), (snap) => {
          const items = snap.docs.map(d => d.data() as CartItem);
          setCart(items);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}/cart`);
        });

        // Wishlist Sync Listener
        unsubWishlist = onSnapshot(collection(db, 'users', fbUser.uid, 'wishlist'), (snap) => {
          const items = snap.docs.map(d => d.get('productId') as string);
          setWishlist(items);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}/wishlist`);
        });

      } else {
        // Logged out!
        const savedCart = localStorage.getItem('bigmart_cart');
        if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) { setCart([]); }
        else setCart([]);

        const savedUser = localStorage.getItem('bigmart_user');
        if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (e) { setUser(null); }
        else setUser(null);

        const savedWishlist = localStorage.getItem('bigmart_wishlist');
        if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { setWishlist([]); }
        else setWishlist([]);
      }
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {});
    }

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
      if (unsubAddresses) unsubAddresses();
      if (unsubOrders) unsubOrders();
      if (unsubCart) unsubCart();
      if (unsubWishlist) unsubWishlist();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('bigmart_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('bigmart_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bigmart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bigmart_user');
    }
  }, [user]);

  const showToast = (message: string, type: 'cart' | 'wishlist' = 'cart') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = async (item: CartItem, silent: boolean = false) => {
    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      const itemRef = doc(db, 'users', fbUser.uid, 'cart', item.id);
      try {
        const docSnap = await getDoc(itemRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          await setDoc(itemRef, {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: currentData.quantity + (item.quantity ?? 1),
            kgQuantity: (currentData.kgQuantity !== undefined || item.kgQuantity !== undefined) ? ((currentData.kgQuantity || 0) + (item.kgQuantity || 0)) : undefined,
            gmQuantity: (currentData.gmQuantity !== undefined || item.gmQuantity !== undefined) ? ((currentData.gmQuantity || 0) + (item.gmQuantity || 0)) : undefined,
            image: item.image || '',
            category: item.category || ''
          }, { merge: true });
        } else {
          await setDoc(itemRef, {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity ?? 1,
            kgQuantity: item.kgQuantity ?? 0,
            gmQuantity: item.gmQuantity ?? 1,
            image: item.image || '',
            category: item.category || ''
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}/cart/${item.id}`);
      }
    } else {
      setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i => i.id === item.id ? { 
            ...i, 
            quantity: i.quantity + (item.quantity ?? 1),
            kgQuantity: (i.kgQuantity !== undefined || item.kgQuantity !== undefined) ? ((i.kgQuantity || 0) + (item.kgQuantity || 0)) : undefined,
            gmQuantity: (i.gmQuantity !== undefined || item.gmQuantity !== undefined) ? ((i.gmQuantity || 0) + (item.gmQuantity || 0)) : undefined
          } : i);
        }
        return [...prev, {
          ...item,
          kgQuantity: item.kgQuantity ?? 0,
          gmQuantity: item.gmQuantity ?? 1
        }];
      });
    }
    if (!silent) showToast(`${item.name} added to cart!`, 'cart');
  };

  const customSetCart = async (val: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    const computedVal = typeof val === 'function' ? val(cart) : val;
    setCart(computedVal);

    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      try {
        // Case 1: item updated or added
        for (const item of computedVal) {
          const prevItem = cart.find(i => i.id === item.id);
          if (
            !prevItem || 
            prevItem.quantity !== item.quantity || 
            prevItem.kgQuantity !== item.kgQuantity || 
            prevItem.gmQuantity !== item.gmQuantity
          ) {
            const itemRef = doc(db, 'users', fbUser.uid, 'cart', item.id);
            await setDoc(itemRef, {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              kgQuantity: item.kgQuantity !== undefined ? item.kgQuantity : null,
              gmQuantity: item.gmQuantity !== undefined ? item.gmQuantity : null,
              image: item.image || '',
              category: item.category || ''
            }, { merge: true });
          }
        }

        // Case 2: item removed
        for (const prevItem of cart) {
          if (!computedVal.some(i => i.id === prevItem.id)) {
            await deleteDoc(doc(db, 'users', fbUser.uid, 'cart', prevItem.id));
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}/cart`);
      }
    }
  };

  const clearCart = async () => {
    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      try {
        const cartSnap = await getDocs(collection(db, 'users', fbUser.uid, 'cart'));
        const batch = writeBatch(db);
        cartSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${fbUser.uid}/cart`);
      }
    } else {
      setCart([]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error", err);
    }
    setUser(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem('bigmart_user');
    localStorage.removeItem('bigmart_cart');
    localStorage.removeItem('bigmart_wishlist');
  };

  const handleAddOrder = async (order: Order) => {
    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      try {
        // Strip non-primitive specs from orders to comply with Firestore types
        const orderToSet = JSON.parse(JSON.stringify(order));
        await setDoc(doc(db, 'users', fbUser.uid, 'orders', order.id), orderToSet);
        if (user) {
          setUser({ ...user, orders: [order, ...(user.orders || [])] });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}/orders/${order.id}`);
      }
    } else {
      if (user) {
        setUser({ ...user, orders: [order, ...(user.orders || [])] });
      }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      try {
        await updateDoc(doc(db, 'users', fbUser.uid, 'orders', orderId), { status: 'Cancelled' });
        if (user) {
          setUser({
            ...user,
            orders: (user.orders || []).map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o)
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}/orders/${orderId}`);
      }
    } else {
      if (user) {
        setUser({
          ...user,
          orders: (user.orders || []).map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o)
        });
      }
    }
  };

  const customSetUser = async (val: User | null | ((prev: User | null) => User | null)) => {
    const computedVal = typeof val === 'function' ? val(user) : val;
    
    if (!computedVal) {
      if (auth.currentUser) {
        await signOut(auth);
      }
      setUser(null);
      return;
    }

    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          name: computedVal.name,
          email: computedVal.email,
          address: computedVal.address || ''
        }, { merge: true });

        if (computedVal.addresses) {
          const addressesColRef = collection(db, 'users', fbUser.uid, 'addresses');
          const addressesSnap = await getDocs(addressesColRef);
          const existingIds = addressesSnap.docs.map(d => d.id);
          
          const batch = writeBatch(db);
          computedVal.addresses.forEach(addr => {
            const addrRef = doc(db, 'users', fbUser.uid, 'addresses', addr.id);
            batch.set(addrRef, addr);
          });
          
          const currentIds = computedVal.addresses.map(a => a.id);
          existingIds.forEach(id => {
            if (!currentIds.includes(id)) {
              batch.delete(doc(db, 'users', fbUser.uid, 'addresses', id));
            }
          });
          
          await batch.commit();
        }
        
        // Synchronously update local React state for instantaneous responsiveness
        setUser(computedVal);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      }
    } else {
      setUser(computedVal);
    }
  };

  const toggleWishlist = async (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      const exists = wishlist.includes(productId);
      try {
        const wishlistRef = doc(db, 'users', fbUser.uid, 'wishlist', productId);
        if (exists) {
          await deleteDoc(wishlistRef);
        } else {
          await setDoc(wishlistRef, { productId });
          if (product) showToast(`${product.name} added to wishlist!`, 'wishlist');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}/wishlist/${productId}`);
      }
    } else {
      setWishlist(prev => {
        const isRemoving = prev.includes(productId);
        if (!isRemoving) {
          if (product) showToast(`${product.name} added to wishlist!`, 'wishlist');
        }
        return isRemoving ? prev.filter(id => id !== productId) : [...prev, productId];
      });
    }
  };

  const toggleComparison = (product: Product) => {
    setComparisonList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 4) { alert("You can compare up to 4 products at a time."); return prev; }
      return [...prev, product];
    });
  };

  const removeProductFromComparison = (productId: string) => {
    setComparisonList(prev => prev.filter(p => p.id !== productId));
  };

  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen w-full flex flex-col bg-white">
        {isOffline && (
          <div className="bg-amber-600 text-white text-xs py-2.5 px-4 font-extrabold flex items-center justify-center gap-2 z-[160] text-center w-full transition-all duration-300 shadow uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>
            <span>Offline Mode: Browsing Cached Product Catalog</span>
          </div>
        )}
        <Header cartCount={cartTotalQuantity} user={user} onLogout={handleLogout} />
        <main className="flex-1 pb-32 sm:pb-24 w-full bg-[#f8fafc] mt-0 pt-0">
          <Routes>
                <Route path="/" element={<Home wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} comparisonList={comparisonList} onToggleComparison={toggleComparison} />} />
                <Route path="/product/:id" element={<ProductDetail user={user} cartCount={cartTotalQuantity} onAddToCart={addToCart} toggleComparison={toggleComparison} comparisonList={comparisonList} wishlist={wishlist} onToggleWishlist={toggleWishlist} onOrderSuccess={handleAddOrder} />} />
                <Route path="/similar-products/:id" element={<SimilarProductsPage onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} comparisonList={comparisonList} toggleComparison={toggleComparison} />} />
                <Route path="/search" element={<SearchResults cartCount={cartTotalQuantity} wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} comparisonList={comparisonList} onToggleComparison={toggleComparison} />} />
                <Route path="/search-interface" element={<SearchPage />} />
                <Route path="/categories" element={<CategoriesPage cartCount={cartTotalQuantity} />} />
                <Route path="/cart" element={<Cart cart={cart} setCart={customSetCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} user={user} onOrderSuccess={handleAddOrder} />} />
                <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} user={user} setUser={customSetUser} onOrderSuccess={handleAddOrder} />} />
                <Route path="/compare" element={<Compare comparisonList={comparisonList} onRemove={removeProductFromComparison} />} />
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={customSetUser} />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup onSignup={customSetUser} />} />
                <Route path="/orders" element={user ? <OrderHistory orders={user.orders} wishlist={wishlist} onAddToCart={addToCart} onCancelOrder={handleCancelOrder} /> : <Navigate to="/login" />} />
                <Route path="/tracking/:id" element={<OrderTracking />} />
                <Route path="/order-success" element={<div className="min-h-[60vh] bg-white pt-8 px-4"><div className="max-w-2xl mx-auto flex gap-4"><div className="text-green-600 pt-0.5"><CheckCircle size={40} className="fill-green-50" strokeWidth={2} /></div><div><h1 className="text-[22px] font-bold text-green-700 mb-2">Order placed, thank you!</h1><p className="text-[15px] text-gray-800 mb-5">Confirmation will be sent to your email.</p><div className="space-y-4"><Link to="/orders" className="block text-[#007185] hover:text-[#c40000] hover:underline text-[15px]">Review or edit your recent orders</Link><div><Link to="/" className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] text-black text-sm px-4 py-2 mt-2 rounded-[8px] border border-[#fcd200] shadow-sm font-medium">Continue shopping</Link></div></div></div></div></div>} />
                <Route path="/account" element={<Account user={user} onLogout={handleLogout} />} />
                <Route path="/notifications" element={<Notifications />} />
                
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<StaticInfo title="About Us" type="about" />} />
                <Route path="/privacy" element={<StaticInfo title="Privacy Policy" type="privacy" />} />
                <Route path="/terms" element={<StaticInfo title="Terms & Conditions" type="terms" />} />
                <Route path="/cookies" element={<StaticInfo title="Cookie Policy" type="cookies" />} />
                <Route path="/legal" element={<StaticInfo title="Legal Information" type="legal" />} />
                <Route path="/shipping" element={<StaticInfo title="Shipping Information" type="shipping" />} />
                <Route path="/returns" element={<StaticInfo title="Refunds & Cancellations" type="returns" />} />
                
                <Route path="/addresses" element={<ProfileSubPages type="addresses" user={user} setUser={customSetUser} />} />
                <Route path="/payments" element={<ProfileSubPages type="payments" user={user} setUser={customSetUser} />} />
                <Route path="/profile/edit" element={<ProfileSubPages type="edit" user={user} setUser={customSetUser} />} />
                <Route path="/profile/cancellations" element={<ProfileSubPages type="cancellations" user={user} setUser={customSetUser} />} />
              </Routes>
            </main>
            <Footer />
            <ComparisonBar list={comparisonList} onRemove={toggleComparison} onClear={() => setComparisonList([])} />
            <MobileNav cartCount={cartTotalQuantity} />
            <FloatingCartButton cartCount={cartTotalQuantity} />
            {notification && (
              <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-5 fade-in duration-300 w-full max-w-sm px-4">
                <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-white/10">
                  <div className={`${notification.type === 'wishlist' ? 'bg-red-500' : 'bg-green-500'} p-2 rounded-full shrink-0`}>{notification.type === 'wishlist' ? <Heart size={18} fill="currentColor" /> : <ShoppingCart size={18} />}</div>
                  <p className="text-xs font-bold flex-1">{notification.message}</p>
                  <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
              </div>
            )}
      </div>
    </Router>
  );
};

export default App;
