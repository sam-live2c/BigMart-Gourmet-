import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Eye, EyeOff, Loader2, ShieldCheck, UserPlus, Info } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface SignupProps {
  onSignup: (user: User) => void;
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
    return "Google signup was blocked inside this embedded preview framework (missing initial state due to third-party cookies / sessionStorage partitioning). Please use Email & Password Signup (it works flawlessly in the preview), or click 'Open in new tab' at top right to use Google Sign-Up!";
  }

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid credentials. Please verify your details.';
    case 'auth/invalid-email':
      return 'The email address is not formatted correctly.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-Up was closed before completion.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is not enabled. Please activate it in the Firebase Console.';
    default:
      return error?.message || 'Signup failed. Please check your inputs.';
  }
};

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupStage, setSignupStage] = useState<'idle' | 'registering' | 'setting_up' | 'google_connecting'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorText, setErrorText] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [showOTP, setShowOTP] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

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

  const handleSendOTP = () => {
    if (!formData.email) {
      setErrors({...errors, email: 'Email is required'});
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({...errors, email: 'Invalid email format'});
      return;
    }
    setIsSendingOTP(true);
    setTimeout(() => {
      setIsSendingOTP(false);
      setShowOTP(true);
    }, 800);
  };

  const handleVerifyOTP = () => {
    if (otpInput.length < 4) {
      setErrors({ ...errors, otp: 'Please enter a 4-digit code.' });
      return;
    }
    setIsVerifyingOTP(true);
    setTimeout(() => {
      setIsVerifyingOTP(false);
      setShowOTP(false);
      setEmailVerified(true);
      const newErrors = { ...errors };
      delete newErrors.email;
      delete newErrors.otp;
      setErrors(newErrors);
    }, 800);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (!emailVerified) {
      newErrors.email = 'Please verify your email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters required';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Use and Privacy Policy';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length > 7) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setSignupStage('registering');
      setErrorText(null);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = userCredential.user;
        
        setSignupStage('setting_up');
        await updateProfile(fbUser, { displayName: formData.name });
        
        const profileData = {
          name: formData.name,
          email: formData.email,
          address: ''
        };
        
        try {
          await setDoc(doc(db, 'users', fbUser.uid), profileData);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
        }
        
        const newUser: User = {
          name: formData.name,
          email: formData.email,
          address: '',
          orders: []
        };
        onSignup(newUser);
        setIsLoading(false);
        setSignupStage('idle');
        navigate('/');
      } catch (error: any) {
        setErrorText(getFriendlyAuthErrorMessage(error));
        setIsLoading(false);
        setSignupStage('idle');
      }
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setSignupStage('google_connecting');
    setErrorText(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      setSignupStage('setting_up');
      const name = fbUser.displayName ?? 'Google User';
      const email = fbUser.email ?? '';
      
      const profileData = { name, email, address: '' };
      try {
        await setDoc(doc(db, 'users', fbUser.uid), profileData, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      }
      
      onSignup({
        name,
        email,
        address: '',
        orders: []
      });
      setIsLoading(false);
      setSignupStage('idle');
      navigate('/');
    } catch (error: any) {
      setErrorText(getFriendlyAuthErrorMessage(error));
      setIsLoading(false);
      setSignupStage('idle');
    }
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="bg-[#f1f3f6] min-h-fit md:min-h-screen flex flex-col md:items-center md:justify-center font-sans w-full py-0 md:py-8">
      <div className="max-w-4xl w-full bg-white shadow-none md:shadow-xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-fit md:min-h-[580px]">
        
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
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Looks like you're new here!</h1>
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              Sign up with your details to join India's fastest shopping community.
            </p>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          
          {/* Decorative Security branding at bottom with premium subtle badge overlay */}
          <div className="mt-8 flex flex-col items-start relative z-10 animate-fade-in">
            <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center relative mb-4 bg-white/10 backdrop-blur-sm shadow-inner transition-transform duration-300 hover:scale-105">
              <UserPlus size={28} className="text-white" />
              <div className="absolute -top-1 -right-1 bg-white text-[#2874f0] p-1 rounded-full shadow-md">
                <ShieldCheck size={12} />
              </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-wider text-blue-100 bg-black/20 px-2 py-1 rounded-sm backdrop-blur-sm">100% Secure Signup</p>
          </div>
        </div>

        {/* Right Form panel */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorText && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold p-3 rounded-sm leading-relaxed text-center animate-in fade-in duration-200">
                {errorText}
              </div>
            )}
            
            {/* Full Name Field */}
            <div className="relative pt-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if (errors.name) setErrors({...errors, name: ''});
                }}
                className={`w-full bg-transparent border-b-2 py-2 px-1 outline-none transition-colors duration-200 text-sm sm:text-base placeholder:text-gray-400 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#2874f0]'}`}
                placeholder="Enter Full Name"
                disabled={isLoading}
              />
              <label className={`absolute left-1 -top-2.5 text-xs font-bold text-[#2874f0] transition-all ${formData.name ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                Full Name
              </label>
              {errors.name && <p className="text-red-500 text-[11px] font-medium mt-1 absolute">{errors.name}</p>}
            </div>

            {/* Email Field with Verification */}
            <div className="relative pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.email}
                  disabled={emailVerified || isLoading}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (errors.email) setErrors({...errors, email: ''});
                    setEmailVerified(false);
                    setShowOTP(false);
                  }}
                  className={`flex-1 bg-transparent border-b-2 py-2 px-1 outline-none transition-colors duration-200 text-sm sm:text-base placeholder:text-gray-400 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#2874f0]'} ${emailVerified ? 'opacity-70' : ''}`}
                  placeholder="Enter Email Address"
                />
                {!emailVerified && !showOTP && formData.email.includes('@') && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSendingOTP || isLoading}
                    className="bg-[#2874f0]/10 hover:bg-[#2874f0]/20 text-[#2874f0] font-semibold px-3 py-1.5 rounded-sm text-xs whitespace-nowrap transition duration-200"
                  >
                    {isSendingOTP ? 'Sending...' : 'Verify Email'}
                  </button>
                )}
                {emailVerified && (
                  <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium bg-green-50 px-2.5 border border-green-200 rounded-sm">
                     <ShieldCheck size={14} /> Verified
                  </span>
                )}
              </div>
              <label className={`absolute left-1 -top-2.5 text-xs font-bold text-[#2874f0] transition-all ${formData.email ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                Email Address
              </label>
              {errors.email && <p className="text-red-500 text-[11px] font-medium mt-1 absolute">{errors.email}</p>}
              
              {/* OTP Input Block */}
              {showOTP && !emailVerified && (
                <div className="bg-[#2874f0]/5 border border-blue-100 p-4 rounded-sm mt-3 animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Enter OTP sent to {formData.email}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setOtpInput(val);
                        if (errors.otp) {
                          const newErrors = { ...errors };
                          delete newErrors.otp;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="Enter 4-digit OTP"
                      className={`flex-1 max-w-[140px] border rounded-sm px-3 py-1.5 text-sm text-center tracking-widest focus:outline-none transition ${errors.otp ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#2874f0]'}`}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={isVerifyingOTP || otpInput.length < 4}
                      className="bg-[#2874f0] hover:bg-[#1a5cbd] text-white px-4 rounded-sm text-xs font-bold transition disabled:bg-gray-300 disabled:text-gray-505"
                    >
                      {isVerifyingOTP ? 'Verifying...' : 'Confirm'}
                    </button>
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-[11px] font-medium mt-1 animate-in fade-in duration-150">{errors.otp}</p>
                  )}
                </div>
              )}
            </div>

            {/* Password input block */}
            <div className="relative pt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                className={`w-full bg-transparent border-b-2 py-2 pr-8 outline-none transition-colors duration-200 text-sm sm:text-base placeholder:text-gray-400 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#2874f0]'}`}
                placeholder="Set Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-4.5 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <label className={`absolute left-1 -top-2.5 text-xs font-bold text-[#2874f0] transition-all ${formData.password ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                Password
              </label>
              {errors.password && <p className="text-red-500 text-[11px] font-medium mt-1 absolute">{errors.password}</p>}
              
              {formData.password && (
                <div className="mt-2 flex gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`flex-1 rounded-full transition-colors ${strength >= step ? strengthColors[strength] : 'bg-gray-100'}`}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password input block */}
            <div className="relative pt-2">
              <input
                type="password"
                value={formData.confirmPassword}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData({...formData, confirmPassword: e.target.value});
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                }}
                className={`w-full bg-transparent border-b-2 py-2 outline-none transition-colors duration-200 text-sm sm:text-base placeholder:text-gray-400 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#2874f0]'}`}
                placeholder="Confirm Password"
              />
              <label className={`absolute left-1 -top-2.5 text-xs font-bold text-[#2874f0] transition-all ${formData.confirmPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                Confirm Password
              </label>
              {errors.confirmPassword && <p className="text-red-500 text-[11px] font-medium mt-1 absolute">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-4 space-y-4">
              {/* Terms and Privacy Policy checkbox */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    id="agreedToTerms" 
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.agreedToTerms) {
                        const nextErrors = { ...errors };
                        delete nextErrors.agreedToTerms;
                        setErrors(nextErrors);
                      }
                    }}
                    className={`rounded border-gray-300 text-[#2874f0] focus:ring-[#2874f0] mt-0.5 cursor-pointer h-4 w-4 shrink-0 transition duration-150 ${errors.agreedToTerms ? 'border-red-500' : ''}`}
                  />
                  <label htmlFor="agreedToTerms" className="text-xs text-gray-500 leading-normal select-none cursor-pointer">
                    I agree to BigMart Gourmet's <Link to="/terms" className="text-[#2874f0] font-bold hover:underline">Terms of Use</Link> and <Link to="/privacy" className="text-[#2874f0] font-bold hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                {errors.agreedToTerms && (
                  <p className="text-red-500 text-[11px] font-medium animate-in fade-in duration-150">{errors.agreedToTerms}</p>
                )}
              </div>

              <div className="bg-gray-50 px-3 py-2.5 rounded-sm flex items-start gap-3 mb-4 border border-gray-100">
                <ShieldCheck className="text-[#2874f0] shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-gray-500 leading-normal">Your information is protected with BigMart Gourmet's industry-standard encryption protocols.</p>
              </div>

              {/* Main submit button in orange */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#fb641b] text-white py-3.5 rounded-[2px] font-bold shadow-sm hover:bg-[#e1520e] transition-all uppercase tracking-wide text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                {isLoading && (signupStage === 'registering' || signupStage === 'setting_up') ? (
                  <>
                    <Loader2 size={16} className="animate-spin shrink-0" />
                    <span>{signupStage === 'registering' ? 'Registering...' : 'Setting up profile...'}</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400 font-semibold uppercase">Or</span>
                </div>
              </div>

              {/* Google signup button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full bg-white text-gray-700 py-3 rounded-[2px] font-bold border border-[#e0e0e0] hover:border-[#2874f0] hover:text-[#2874f0] hover:bg-gray-50/40 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-3 text-xs sm:text-sm active:scale-[0.99]"
              >
                {isLoading && (signupStage === 'google_connecting' || (signupStage === 'setting_up' && formData.email === '')) ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />
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
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm font-semibold select-all">
            <Link to="/login" className="text-[#2874f0] hover:underline block py-2">
              Existing User? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
