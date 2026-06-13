import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, getDocFromCache, getDocsFromCache } from 'firebase/firestore';
import { Loader2, ShoppingBag, ShieldCheck, Info } from 'lucide-react';

async function fetchWithTimeout<T>(
  serverFn: () => Promise<T>,
  cacheFn: () => Promise<T>,
  timeoutMs = 1200
): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([serverFn(), timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[Firestore Fetch Timeout/Error] Falling back to IndexedDB Cache...', err?.message || err);
    try {
      return await cacheFn();
    } catch (cacheErr: any) {
      console.warn('[Firestore Cache Failure] Fallback query failed:', cacheErr?.message || cacheErr);
      throw err;
    }
  }
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const getFriendlyAuthErrorMessage = (error: any): string => {
  const code = error?.code;
  const message = error?.message || '';
  
  if (
    message.toLowerCase().includes('missing initial state') ||
    message.toLowerCase().includes('storage') ||
    message.toLowerCase().includes('sessionstorage') ||
    message.toLowerCase().includes('unable to process request') ||
    (code === 'auth/internal-error' && message.toLowerCase().includes('request'))
  ) {
    return "Google login was blocked inside this embedded preview framework (missing initial state due to third-party cookies / sessionStorage partitioning). Please use Email & Password Sign-In (under 'Create an account' below), or open the app in a new browser tab using the top-right button to use Google Login safely!";
  }

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another user.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In was closed before completion.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. This account is temporarily locked. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is not enabled. Please activate it in the Firebase Console.';
    default:
      return error?.message || 'Login failed. Please try again.';
  }
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const originalPadding = mainEl.style.paddingBottom;
      const handleResize = () => {
        if (window.innerWidth < 768) {
          mainEl.style.paddingBottom = '60px';
        } else {
          mainEl.style.paddingBottom = originalPadding;
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        mainEl.style.paddingBottom = originalPadding;
      };
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (!validateForm()) {
      return;
    }
    if (isGoogleLoading) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      // Fetch user profile, addresses, and orders concurrently with a fast timeout fallback
      const userRef = doc(db, 'users', fbUser.uid);
      const addressesCol = collection(db, 'users', fbUser.uid, 'addresses');
      const ordersCol = collection(db, 'users', fbUser.uid, 'orders');

      const [docSnap, addressesSnap, ordersSnap] = await Promise.all([
        fetchWithTimeout(() => getDoc(userRef), () => getDocFromCache(userRef), 1200).catch(() => null),
        fetchWithTimeout(() => getDocs(addressesCol), () => getDocsFromCache(addressesCol), 1200).catch(() => null),
        fetchWithTimeout(() => getDocs(ordersCol), () => getDocsFromCache(ordersCol), 1200).catch(() => null)
      ]);
      
      let profileName = fbUser.displayName ?? 'Customer';
      let profileAddress = '';
      if (docSnap && docSnap.exists()) {
        const uData = docSnap.data();
        profileName = uData.name || profileName;
        profileAddress = uData.address || '';
      }
      
      const addressesList = addressesSnap ? addressesSnap.docs.map(d => d.data()) : [];
      const ordersList = ordersSnap ? ordersSnap.docs.map(d => d.data()) : [];

      const loggedUser: User = {
        name: profileName,
        email: fbUser.email ?? email,
        address: profileAddress,
        addresses: addressesList as any[],
        orders: ordersList as any[]
      };

      onLogin(loggedUser);
      setIsLoading(false);
      navigate('/');
    } catch (err: any) {
      setErrorText(getFriendlyAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsGoogleLoading(true);
    setErrorText(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      const userRef = doc(db, 'users', fbUser.uid);
      const addressesCol = collection(db, 'users', fbUser.uid, 'addresses');
      const ordersCol = collection(db, 'users', fbUser.uid, 'orders');

      const [docSnap, addressesSnap, ordersSnap] = await Promise.all([
        fetchWithTimeout(() => getDoc(userRef), () => getDocFromCache(userRef), 1200).catch(() => null),
        fetchWithTimeout(() => getDocs(addressesCol), () => getDocsFromCache(addressesCol), 1200).catch(() => null),
        fetchWithTimeout(() => getDocs(ordersCol), () => getDocsFromCache(ordersCol), 1200).catch(() => null)
      ]);
      
      let profileName = fbUser.displayName ?? 'Google User';
      let profileAddress = '';
      if (docSnap && docSnap.exists()) {
        const uData = docSnap.data();
        profileName = uData.name || profileName;
        profileAddress = uData.address || '';
      }
      
      const addressesList = addressesSnap ? addressesSnap.docs.map(d => d.data()) : [];
      const ordersList = ordersSnap ? ordersSnap.docs.map(d => d.data()) : [];

      onLogin({
        name: profileName,
        email: fbUser.email ?? 'google@example.com',
        address: profileAddress,
        addresses: addressesList as any[],
        orders: ordersList as any[]
      });
      setIsGoogleLoading(false);
      navigate('/');
    } catch (err: any) {
      setErrorText(getFriendlyAuthErrorMessage(err));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f3f6] min-h-fit md:min-h-screen flex flex-col md:items-center md:justify-center font-sans w-full py-0 md:py-8">
      <div className="max-w-4xl w-full bg-white shadow-none md:shadow-xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-fit md:min-h-[520px]">
        
        {/* Flipkart Left/Top Blue Banner with gourmet foods & drinks background styling */}
        <div 
          className="w-full md:w-[35%] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden select-none shrink-0 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(26, 54, 93, 0.9), rgba(40, 116, 240, 0.95)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80')"
          }}
        >
          <div className="relative z-10 transition">
            <span className="text-[10px] bg-white/20 text-white font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 inline-block backdrop-blur-sm">
              BigMart Gourmet
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Login</h1>
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          
          {/* Decorative Shopping Bag logo at bottom with premium subtle badge overlay */}
          <div className="mt-8 flex flex-col items-start relative z-10 animate-fade-in">
            <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center relative mb-4 bg-white/10 backdrop-blur-sm shadow-inner transition-transform duration-300 hover:scale-105">
              <ShoppingBag size={28} className="text-white" />
              <div className="absolute -top-1 -right-1 bg-white text-[#2874f0] p-1 rounded-full shadow-md">
                <ShieldCheck size={12} />
              </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-wider text-blue-100 bg-black/20 px-2 py-1 rounded-sm backdrop-blur-sm">100% Safe Payments</p>
          </div>
        </div>

        {/* Right Form panel */}
        <div className="flex-1 p-6 sm:p-12 flex flex-col justify-between bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorText && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold p-3 rounded-sm leading-relaxed text-center animate-in fade-in duration-200">
                {errorText}
              </div>
            )}
            
            {/* Email Field with Flipkart style bottom border */}
            <div className="relative pt-2">
              <input 
                type="text" 
                className={`w-full bg-transparent border-b-2 py-2 px-1 outline-none transition-colors duration-200 text-sm sm:text-base placeholder:text-gray-400 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#2874f0]'}`} 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    const nextErrors = { ...errors };
                    delete nextErrors.email;
                    setErrors(nextErrors);
                  }
                }}
                placeholder="Enter Email Address"
                disabled={isLoading}
              />
              <label className={`absolute left-1 -top-2.5 text-xs font-bold text-[#2874f0] transition-all ${email ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                Email Address
              </label>
              {errors.email && (
                <p className="text-red-500 text-[11px] font-medium mt-1 animate-in fade-in duration-155">{errors.email}</p>
              )}
            </div>

            {/* Password Field with Flipkart style bottom border */}
            <div className="relative pt-2">
              <div className="flex justify-between items-center absolute right-1 -top-2 font-medium">
                <button 
                  type="button" 
                  onClick={() => {
                    // Navigate to some fallback or just notify forgot password
                    alert("Instructions if any will be sent to " + (email || "your email") + " once requested.");
                  }}
                  className="text-xs text-[#2874f0] font-semibold hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <input 
                type="password" 
                className={`w-full bg-transparent border-b-2 py-2 px-1 outline-none transition-colors duration-200 text-sm sm:text-base placeholder:text-gray-400 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#2874f0]'}`} 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    const nextErrors = { ...errors };
                    delete nextErrors.password;
                    setErrors(nextErrors);
                  }
                }}
                placeholder="Enter Password"
                disabled={isLoading}
              />
              <label className={`absolute left-1 -top-2.5 text-xs font-bold text-[#2874f0] transition-all ${password ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                Password
              </label>
              {errors.password && (
                <p className="text-red-500 text-[11px] font-medium mt-1 animate-in fade-in duration-155">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" className="rounded border-gray-300 text-[#2874f0] focus:ring-[#2874f0]" id="rem" />
              <label htmlFor="rem" className="text-xs font-medium text-gray-500">Keep me signed in</label>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                By continuing, you agree to BigMart Gourmet's <Link to="/terms" className="text-[#2874f0] hover:underline font-bold">Terms of Use</Link> and <Link to="/privacy" className="text-[#2874f0] hover:underline font-bold">Privacy Policy</Link>.
              </p>

              <button 
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-[#fb641b] text-white py-3.5 rounded-[2px] font-bold text-sm shadow hover:bg-[#e1520e] transition-all uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400 font-semibold uppercase">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-white text-gray-700 py-3 rounded-[2px] font-bold border border-[#e0e0e0] hover:border-[#2874f0] hover:text-[#2874f0] hover:bg-gray-50/40 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 text-xs sm:text-sm active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin shrink-0" />
                  <span>Connecting Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs sm:text-sm font-semibold select-all">
            <Link to="/signup" className="text-[#2874f0] hover:underline block py-2">
              New to BigMart? Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
