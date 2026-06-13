import React, { useState, useEffect } from "react";
import { CartItem, User, Order } from "../types";
import { getCentralPincodeDetails } from "../services/pincodeService";
import {
  Lock,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  CreditCard,
  Calendar,
  Building,
  Gift,
  HelpCircle,
  PackageOpen,
  Percent,
  ArrowDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PRODUCTS } from "../constants";

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  onOrderSuccess: (order: Order) => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  cart,
  clearCart,
  user,
  setUser,
  onOrderSuccess,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const directBuyItem = location.state?.directBuyItem as CartItem | undefined;

  const checkoutItems = directBuyItem ? [directBuyItem] : cart;

  const enrichedCheckoutItems = checkoutItems.map((item) => {
    const original = PRODUCTS.find((p) => p.id === item.id);
    if (original) {
      return {
        ...original,
        ...item,
        weightInGrams: original.weightInGrams,
        oldPrice: original.oldPrice ?? item.oldPrice,
      };
    }
    return item;
  });

  const defaultAddress =
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const formattedAddress = React.useMemo(() => {
    if (defaultAddress) {
      return `${defaultAddress.villCity ? defaultAddress.villCity + ", " : ""}${defaultAddress.areaColony ? defaultAddress.areaColony + ", " : ""}${defaultAddress.landmark ? "(Landmark: " + defaultAddress.landmark + "), " : ""}${defaultAddress.district ? defaultAddress.district + ", " : ""}${defaultAddress.state ? defaultAddress.state + " - " : ""}${defaultAddress.pincode ? defaultAddress.pincode + ", " : ""}${defaultAddress.country}`;
    }
    try {
      if (user?.address && user.address.startsWith("{")) {
        const a = JSON.parse(user.address);
        return `${a.villCity ? a.villCity + ", " : ""}${a.areaColony ? a.areaColony + ", " : ""}${a.landmark ? "(Landmark: " + a.landmark + "), " : ""}${a.district ? a.district + ", " : ""}${a.state ? a.state + " - " : ""}${a.pincode ? a.pincode + ", " : ""}${a.country}`;
      }
    } catch (e) {}
    return user?.address || "No address provided";
  }, [user?.address, defaultAddress]);

  const [addrForm, setAddrForm] = useState(() => {
    if (defaultAddress) {
      return {
        name: defaultAddress.name,
        phone: defaultAddress.phone,
        pincode: defaultAddress.pincode,
        villCity: defaultAddress.villCity,
        district: defaultAddress.district,
        state: defaultAddress.state,
        country: defaultAddress.country,
        countryCode: defaultAddress.countryCode,
        areaColony: defaultAddress.areaColony || "",
        landmark: defaultAddress.landmark || "",
        type: defaultAddress.type || "HOME",
      };
    }
    try {
      if (user?.address && user.address.startsWith("{")) {
        const parsed = JSON.parse(user.address);
        return {
          name: user.name || "",
          phone: parsed.phone || "",
          pincode: parsed.pincode || "",
          villCity: parsed.villCity || "",
          district: parsed.district || "",
          state: parsed.state || "",
          country: parsed.country || "India",
          countryCode: parsed.countryCode || "+91",
          areaColony: parsed.areaColony || "",
          landmark: parsed.landmark || "",
          type: parsed.type || "HOME",
        };
      }
    } catch (e) {}
    return {
      name: user?.name || "",
      phone: "",
      pincode: "",
      villCity: "",
      district: "",
      state: "",
      country: "India",
      countryCode: "+91",
      areaColony: "",
      landmark: "",
      type: "HOME",
    };
  });

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    let newState = addrForm.state;
    let newDistrict = addrForm.district;

    if (val.length === 6) {
      const offline = getCentralPincodeDetails(val);
      newState = offline.state;
      newDistrict = offline.district;
    }

    setAddrForm((prev) => ({
      ...prev,
      pincode: val,
      state: newState,
      district: newDistrict,
    }));
  };

  const [step, setStep] = useState(
    user?.address &&
      formattedAddress !== "No address provided" &&
      !location.state?.editAddress
      ? 2
      : 1,
  );
  const [isEditingAddress, setIsEditingAddress] = useState(
    !(
      user?.address &&
      formattedAddress !== "No address provided" &&
      !location.state?.editAddress
    ),
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] =
    useState("gpay");
  const [expandedPayment, setExpandedPayment] = useState("razorpay");
  const [countdown, setCountdown] = useState(29);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );
  const [hasSyncedUser, setHasSyncedUser] = useState(false);

  useEffect(() => {
    if (user && !hasSyncedUser) {
      const activeAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (activeAddress) {
        setAddrForm({
          name: activeAddress.name || user.name || "",
          phone: activeAddress.phone || "",
          pincode: activeAddress.pincode || "",
          villCity: activeAddress.villCity || "",
          district: activeAddress.district || "",
          state: activeAddress.state || "",
          country: activeAddress.country || "India",
          countryCode: activeAddress.countryCode || "+91",
          areaColony: activeAddress.areaColony || "",
          landmark: activeAddress.landmark || "",
          type: activeAddress.type || "HOME",
        });
        setStep(2);
        setIsEditingAddress(false);
        setHasSyncedUser(true);
      } else {
        try {
          if (user.address && user.address.startsWith("{")) {
            const parsed = JSON.parse(user.address);
            setAddrForm({
              name: user.name || "",
              phone: parsed.phone || "",
              pincode: parsed.pincode || "",
              villCity: parsed.villCity || "",
              district: parsed.district || "",
              state: parsed.state || "",
              country: parsed.country || "India",
              countryCode: parsed.countryCode || "+91",
              areaColony: parsed.areaColony || "",
              landmark: parsed.landmark || "",
              type: parsed.type || "HOME",
            });
            setStep(2);
            setIsEditingAddress(false);
            setHasSyncedUser(true);
          } else if (user.address && user.address !== "No address provided") {
            setAddrForm(prev => ({
              ...prev,
              name: user.name || "",
              villCity: user.address || "",
            }));
            setStep(2);
            setIsEditingAddress(false);
            setHasSyncedUser(true);
          }
        } catch (e) {}
      }
    }
  }, [user, hasSyncedUser]);

  const getItemPrice = (item: CartItem) => {
    return item.price * item.quantity;
  };
  const total = enrichedCheckoutItems.reduce(
    (sum, item) => sum + getItemPrice(item),
    0,
  );
  const originalTotal = Math.round(total * 1.15); // dummy original total to show 15% discount
  const savings = originalTotal - total;

  useEffect(() => {
    if (step !== 3) {
      setCountdown(29);
      return;
    }
    if (countdown <= 0) {
      navigate("/cart");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, navigate, step]);

  useEffect(() => {
    // scroll to top on step change
    window.scrollTo(0, 0);
  }, [step]);

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: "OD" + Math.floor(Math.random() * 1000000000000),
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: [...enrichedCheckoutItems],
        total: total,
        status: "Placed",
        createdAt: Date.now(),
      };

      onOrderSuccess(newOrder);
      if (!directBuyItem) {
        clearCart();
      }
      navigate("/order-success");
    }, 1500);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (checkoutItems.length === 0) {
      navigate("/cart");
    }
  }, [user, checkoutItems.length, navigate]);

  const handleBackClick = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      if (isEditingAddress && user?.address && formattedAddress !== "No address provided") {
        setIsEditingAddress(false);
      } else {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (checkoutItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-200 overflow-y-auto sm:py-8 sm:px-4 flex flex-col sm:items-center no-scrollbar pb-10">
      {/* Desktop wrapper */}
      <div className="w-full sm:max-w-md bg-gray-100 min-h-screen sm:min-h-[800px] shadow-2xl relative flex flex-col border border-gray-300">
        {/* Header */}
        {step === 3 ? (
          <div className="bg-white py-3 px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b">
            <div className="flex gap-4 items-center">
              <ArrowLeft
                strokeWidth={2}
                size={22}
                onClick={() => setStep(2)}
                className="cursor-pointer text-gray-800"
              />
              <div className="leading-tight">
                <p className="text-[11px] text-gray-500 font-medium mb-0.5">
                  Step 3 of 3
                </p>
                <h1 className="text-[17px] font-semibold text-gray-900 leading-tight">
                  Payments
                </h1>
              </div>
            </div>
            <div className="bg-gray-100/80 px-2 py-1 rounded text-[11px] flex items-center gap-1 text-gray-600 font-medium border border-gray-200 shadow-sm">
              <Lock size={12} strokeWidth={2} /> 100% Secure
            </div>
          </div>
        ) : (
          <div className="bg-white py-4 px-4 flex items-center gap-4 sticky top-0 z-10">
            <ArrowLeft
              strokeWidth={2.5}
              size={22}
              onClick={handleBackClick}
              className="cursor-pointer text-gray-800"
            />
            <h1 className="text-[17px] font-medium text-gray-900">
              {step === 1 ? "Address" : "Order Summary"}
            </h1>
          </div>
        )}

        {/* Stepper only on Step 1 and 2 */}
        {step < 3 && (
          <div className="bg-white px-10 pb-5 pt-2 border-b flex items-center justify-between relative shadow-sm">
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step > 1 ? "bg-blue-600 text-white border border-blue-600" : "border border-blue-600 text-blue-600 bg-blue-50"}`}
              >
                {step > 1 ? <Check size={12} strokeWidth={3} /> : "1"}
              </div>
              <span
                className={`text-[10px] mt-2 absolute top-6 font-medium ${step >= 1 ? "text-gray-900" : "text-gray-400"}`}
              >
                Address
              </span>
            </div>
            <div
              className={`flex-1 h-[1.5px] mx-1 -mt-4 ${step > 1 ? "bg-blue-600" : "bg-gray-200"}`}
            ></div>
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
              >
                2
              </div>
              <span
                className={`text-[10px] mt-2 absolute top-6 whitespace-nowrap font-medium ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}
              >
                Order Summary
              </span>
            </div>
            <div className="flex-1 h-[1.5px] mx-1 -mt-4 bg-gray-200"></div>
            <div className="flex flex-col items-center z-10">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200">
                3
              </div>
              <span className="text-[10px] mt-2 absolute top-6 font-medium text-gray-400">
                Payment
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-32">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <div className="bg-gray-100 flex flex-col gap-2 pt-2">
              {isEditingAddress ? (
                <div className="bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-4">
                    Add Delivery Address
                  </p>
                  {Object.keys(addressErrors).some((k) => addressErrors[k]) && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-sm shadow-sm animate-pulse-once">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs font-semibold text-red-700">
                            Please fill out all required fields correctly to proceed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={addrForm.pincode}
                          onChange={(e) => {
                            handlePincodeChange(e);
                            setAddressErrors({ ...addressErrors, pincode: "" });
                          }}
                          placeholder="6-digit PIN"
                          maxLength={6}
                          className={`w-full border rounded p-2.5 text-sm outline-none transition-all duration-150 ${
                            addressErrors.pincode
                              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900"
                              : "border-gray-300 focus:border-blue-600"
                          }`}
                        />
                        {addressErrors.pincode && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {addressErrors.pincode}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                          Phone Number *
                        </label>
                        <div className="flex">
                          <span
                            className={`bg-gray-100 border border-r-0 rounded-l px-2.5 py-2.5 text-sm text-gray-600 transition-all duration-150 ${
                              addressErrors.phone ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            {addrForm.countryCode}
                          </span>
                          <input
                            type="tel"
                            value={addrForm.phone}
                            onChange={(e) => {
                              setAddrForm({
                                ...addrForm,
                                phone: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10),
                              });
                              setAddressErrors({ ...addressErrors, phone: "" });
                            }}
                            placeholder="10-digit number"
                            className={`w-full border rounded-r p-2.5 text-sm outline-none flex-1 min-w-0 transition-all duration-150 ${
                              addressErrors.phone
                                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900"
                                : "border-gray-300 focus:border-blue-600"
                            }`}
                          />
                        </div>
                        {addressErrors.phone && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {addressErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                        Flat, House no., Building, Company, Apartment *
                      </label>
                      <input
                        type="text"
                        value={addrForm.villCity}
                        onChange={(e) => {
                          setAddrForm({
                            ...addrForm,
                            villCity: e.target.value,
                          });
                          setAddressErrors({ ...addressErrors, villCity: "" });
                        }}
                        placeholder="House number, apartment name, flat, build etc."
                        className={`w-full border rounded p-2.5 text-sm outline-none transition-all duration-150 ${
                          addressErrors.villCity
                            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900"
                            : "border-gray-300 focus:border-blue-600"
                        }`}
                      />
                      {addressErrors.villCity && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {addressErrors.villCity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                        Area, Colony, Street, Sector, Village *
                      </label>
                      <input
                        type="text"
                        value={addrForm.areaColony}
                        onChange={(e) => {
                          setAddrForm({
                            ...addrForm,
                            areaColony: e.target.value,
                          });
                          setAddressErrors({
                            ...addressErrors,
                            areaColony: "",
                          });
                        }}
                        placeholder="Area name, colony street, local village"
                        className={`w-full border rounded p-2.5 text-sm outline-none transition-all duration-150 ${
                          addressErrors.areaColony
                            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900"
                            : "border-gray-300 focus:border-blue-600"
                        }`}
                      />
                      {addressErrors.areaColony && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {addressErrors.areaColony}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={addrForm.landmark}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, landmark: e.target.value })
                        }
                        placeholder="e.g. Near Apollo Hospital, beside bakery house"
                        className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                        Address Type
                      </label>
                      <select
                        value={addrForm.type}
                        onChange={(e) =>
                          setAddrForm({ ...addrForm, type: e.target.value })
                        }
                        className="w-full h-11 px-2.5 border border-gray-300 bg-white rounded text-sm text-[#0f1111] cursor-pointer focus:border-blue-600 focus:outline-none"
                      >
                        <option value="HOME">
                          Home (7 AM - 9 PM delivery)
                        </option>
                        <option value="OFFICE">
                          Office (10 AM - 6 PM delivery)
                        </option>
                        <option value="COMMERCIAL">Commercial / Other</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                          State *
                        </label>
                        <input
                          type="text"
                          value={addrForm.state}
                          onChange={(e) => {
                            setAddrForm({ ...addrForm, state: e.target.value });
                            setAddressErrors({ ...addressErrors, state: "" });
                          }}
                          placeholder="State"
                          className={`w-full border bg-gray-50 rounded p-2.5 text-sm outline-none transition-all duration-150 ${
                            addressErrors.state
                              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900"
                              : "border-gray-300 focus:border-blue-600"
                          }`}
                        />
                        {addressErrors.state && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {addressErrors.state}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                          District *
                        </label>
                        <input
                          type="text"
                          value={addrForm.district}
                          onChange={(e) => {
                            setAddrForm({
                              ...addrForm,
                              district: e.target.value,
                            });
                            setAddressErrors({
                              ...addressErrors,
                              district: "",
                            });
                          }}
                          placeholder="District"
                          className={`w-full border bg-gray-50 rounded p-2.5 text-sm outline-none transition-all duration-150 ${
                            addressErrors.district
                              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900"
                              : "border-gray-300 focus:border-blue-600"
                          }`}
                        />
                        {addressErrors.district && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {addressErrors.district}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={addrForm.country}
                        style={{ display: "none" }}
                        disabled
                        className="w-full border border-gray-300 bg-gray-100 text-gray-500 rounded p-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      let hasErrors = false;
                      const newErrors: Record<string, string> = {};
                      if (addrForm.pincode.length !== 6) {
                        newErrors.pincode = "Valid 6-digit pincode is required";
                        hasErrors = true;
                      }
                      if (addrForm.phone.length !== 10) {
                        newErrors.phone =
                          "Valid 10-digit phone number is required";
                        hasErrors = true;
                      }
                      if (!addrForm.villCity.trim()) {
                        newErrors.villCity = "Flat, House no., Building is required";
                        hasErrors = true;
                      }
                      if (!addrForm.areaColony?.trim()) {
                        newErrors.areaColony = "Area, Colony, Street, Sector, Village is required";
                        hasErrors = true;
                      }
                      if (!addrForm.state.trim()) {
                        newErrors.state = "State is required";
                        hasErrors = true;
                      }
                      if (!addrForm.district.trim()) {
                        newErrors.district = "District is required";
                        hasErrors = true;
                      }

                      if (!hasErrors) {
                        setIsEditingAddress(false);
                        setStep(2);
                        if (user) {
                          const newAddr = {
                            id: Date.now().toString(),
                            type: addrForm.type || "HOME",
                            isDefault: true,
                            ...addrForm,
                          };
                          // If replacing or adding, append and set as default
                          const newAddresses = (user.addresses || []).map(
                            (a) => ({ ...a, isDefault: false }),
                          );
                          newAddresses.push(newAddr);
                          const updatedUser = {
                            ...user,
                            address: JSON.stringify(addrForm),
                            addresses: newAddresses,
                          };
                          setUser(updatedUser);
                        }
                      } else {
                        setAddressErrors(newErrors);
                      }
                    }}
                    className="mt-6 bg-[#ffc200] text-black font-semibold text-[15px] w-full py-3 rounded shadow-sm hover:bg-[#f0b500] transition"
                  >
                    Save Address and Continue
                  </button>
                </div>
              ) : (
                <>
                  {user && user.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-4 p-4 bg-white shadow-sm border-b">
                      <p className="text-[14px] font-bold text-gray-800 mb-2">Select a delivery address from your saved list:</p>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {user.addresses.map((addr) => {
                          const isSelected = 
                            addrForm.pincode === addr.pincode && 
                            addrForm.villCity === addr.villCity && 
                            addrForm.areaColony === addr.areaColony;
                          return (
                            <div 
                              key={addr.id} 
                              onClick={() => {
                                setAddrForm({
                                  name: addr.name || user.name || "",
                                  phone: addr.phone || "",
                                  pincode: addr.pincode || "",
                                  villCity: addr.villCity || "",
                                  district: addr.district || "",
                                  state: addr.state || "",
                                  country: addr.country || "India",
                                  countryCode: addr.countryCode || "+91",
                                  areaColony: addr.areaColony || "",
                                  landmark: addr.landmark || "",
                                  type: addr.type || "HOME",
                                });
                              }}
                              className={`p-3 border rounded-[6px] cursor-pointer flex items-start gap-3 transition-colors text-left ${
                                isSelected 
                                  ? "border-blue-500 bg-blue-50/40 shadow-sm" 
                                  : "border-gray-200 hover:bg-gray-50/50 bg-white"
                              }`}
                            >
                              <input 
                                type="radio" 
                                checked={isSelected}
                                onChange={() => {}} // click handled by parent div
                                className="mt-1 accent-blue-600 pointer-events-none"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="font-bold text-gray-900 text-[14px] truncate">{addr.name}</p>
                                  <span className="text-[9px] bg-gray-100 text-gray-600 font-extrabold px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider shrink-0">
                                    {addr.type || "HOME"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-800 font-semibold mb-1">Phone: {addr.countryCode} {addr.phone}</p>
                                <p className="text-[11px] text-gray-600 leading-relaxed truncate">
                                  {addr.villCity}{addr.areaColony ? `, ${addr.areaColony}` : ""}
                                </p>
                                <p className="text-[11px] text-gray-600 leading-relaxed truncate">
                                  {addr.district}, {addr.state} - {addr.pincode}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          if (addrForm.pincode && addrForm.villCity) {
                            setStep(2);
                          } else {
                            const first = user.addresses?.[0];
                            if (first) {
                              setAddrForm({
                                name: first.name || user.name || "",
                                phone: first.phone || "",
                                pincode: first.pincode || "",
                                villCity: first.villCity || "",
                                district: first.district || "",
                                state: first.state || "",
                                country: first.country || "India",
                                countryCode: first.countryCode || "+91",
                                areaColony: first.areaColony || "",
                                landmark: first.landmark || "",
                                type: first.type || "HOME",
                              });
                              setStep(2);
                            }
                          }
                        }}
                        className="w-full bg-[#ffc200] text-black font-semibold text-[15px] py-3 rounded shadow-sm hover:bg-[#f0b500] transition active:scale-[0.99]"
                      >
                        Deliver to Selected Address
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-4 items-start flex justify-between border-b shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                      <div className="pl-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide">
                            {addrForm.type || "HOME"}
                          </span>
                        </div>
                        <p className="text-base font-medium mb-1 text-gray-900 flex items-center gap-3">
                          {user ? user.name : "Guest User"}{" "}
                          <span className="text-sm font-bold text-gray-800">
                            {addrForm.phone
                              ? `${addrForm.countryCode} ${addrForm.phone}`
                              : ""}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-[280px]">
                          {formattedAddress}
                        </p>

                        <button
                          onClick={() => setStep(2)}
                          className="mt-5 bg-[#ffc200] text-black font-semibold text-[15px] w-full max-w-[250px] py-3 rounded shadow-sm hover:bg-[#f0b500]"
                        >
                          Deliver Here
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-4 shadow-sm">
                    <button
                      onClick={() => {
                        setAddrForm({
                          name: user?.name || "",
                          phone: "",
                          pincode: "",
                          villCity: "",
                          district: "",
                          state: "",
                          country: "India",
                          countryCode: "+91",
                          areaColony: "",
                          landmark: "",
                          type: "HOME",
                        });
                        setIsEditingAddress(true);
                      }}
                      className="text-blue-600 font-medium text-sm flex items-center gap-2 w-full active:bg-blue-50 py-2 rounded transition-colors"
                    >
                      + Add a new address
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: SUMMARY */}
          {step === 2 && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="bg-white p-4 flex justify-between items-start border-b shadow-sm">
                <div className="pr-4">
                  <p className="text-xs font-bold text-gray-900 mb-2">
                    Deliver to:
                  </p>
                  <p className="text-[17px] font-medium mb-1 text-gray-900">
                    {user ? user.name : "Guest User"}
                  </p>
                  <p className="text-[13px] text-gray-600 leading-[1.4] mb-2">
                    {formattedAddress}
                  </p>
                  <p className="text-[13px] text-gray-800 mt-1">
                    {addrForm.phone
                      ? `Phone: ${addrForm.countryCode} ${addrForm.phone}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="border border-blue-600 text-blue-600 font-medium px-4 py-1.5 rounded-sm text-sm shrink-0 hover:bg-blue-50"
                >
                  Change
                </button>
              </div>

              {enrichedCheckoutItems.map((item, idx) => (
                <div key={idx} className="bg-white p-4 border-b shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-[84px] shrink-0 flex flex-col items-center">
                      <div className="w-[84px] h-[84px] bg-white border border-gray-100 rounded-sm p-1.5 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={item.image}
                          className="w-full h-full object-contain mix-blend-multiply"
                          alt={item.name}
                        />
                      </div>
                      <div className="mt-3 border border-gray-300 bg-gray-50 rounded-sm px-2 py-1 flex items-center justify-between text-xs min-w-[70px] font-medium text-gray-700 w-full hover:bg-gray-100 cursor-pointer">
                        <span>
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <p className="text-[15px] text-gray-900 line-clamp-1 leading-tight mb-1">
                        {item.name}
                      </p>
                      <p className="text-[13px] text-gray-400 mt-0.5 line-clamp-1 truncate">
                        16 Inch, White, 1.95 Kg
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-green-700 font-bold text-[13px] flex items-center tracking-tight">
                          <ArrowDown size={14} strokeWidth={2.5} />
                          11%
                        </span>
                        <span className="text-gray-400 line-through text-sm">
                          ₹{Math.round((item.price ?? 0) * 1.15).toLocaleString()}
                        </span>
                        <span className="text-[19px] font-semibold text-gray-900 leading-none">
                          ₹{(item.price ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 text-[13px] text-gray-900">
                    Get it delivered under{" "}
                    <span className="font-semibold">1 hour</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: PAYMENTS */}
          {step === 3 && (
            <div className="flex flex-col bg-gray-100 min-h-full">
              <div className="bg-[#f5f8ff] p-4 flex items-center justify-between">
                <span className="text-blue-600 flex items-center gap-1 font-medium text-[15px]">
                  Total Amount <ChevronDown size={18} />
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{(total ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="mt-1 text-gray-900 border-t border-gray-200">
                {/* Razorpay */}
                <div className="bg-white border-b border-gray-200">
                  <div
                    className="p-[14px] flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedPayment(
                        expandedPayment === "razorpay" ? "" : "razorpay",
                      )
                    }
                  >
                    <div className="flex flex-start gap-[14px]">
                      <CreditCard
                        size={24}
                        className="text-gray-600 shrink-0 stroke-[1.5]"
                      />
                      <div>
                        <p
                          className={`font-medium text-[15px] ${expandedPayment === "razorpay" ? "text-black" : "text-gray-800"}`}
                        >
                          Razorpay
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Cards, UPI, NetBanking, Wallets
                        </p>
                      </div>
                    </div>
                    {expandedPayment === "razorpay" ? (
                      <ChevronUp
                        size={22}
                        className="text-gray-500 shrink-0"
                        strokeWidth={2}
                      />
                    ) : (
                      <ChevronDown
                        size={22}
                        className="text-gray-500 shrink-0"
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  {expandedPayment === "razorpay" && (
                    <div className="pl-[54px] pr-4 pb-4 pt-1">
                      <p className="text-sm text-gray-600 mb-4">
                        You will be redirected to Razorpay to complete your
                        payment.
                      </p>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full bg-[#ffc200] text-black font-semibold text-[17px] py-[14px] rounded-[4px] shadow-sm leading-none"
                      >
                        {isProcessing
                          ? "Processing..."
                          : `Pay ₹${(total ?? 0).toLocaleString()}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="py-8 text-center bg-gray-100 mb-[50px]">
                <p className="text-gray-400 font-medium text-[15px]">
                  Wait! Reserved for {countdown}s
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar for Step 2 */}
        {step === 2 && (
          <div className="fixed sm:sticky bottom-0 left-0 right-0 bg-white z-[99] shadow-[0_-8px_15px_rgba(0,0,0,0.08)] w-full mt-auto">
            <div className="p-3 px-4 flex items-center justify-between bg-white border-t border-gray-100 h-[68px]">
              <div>
                <p className="text-gray-400 line-through text-[13px] font-medium mb-[2px]">
                  ₹{(originalTotal ?? 0).toLocaleString()}
                </p>
                <p className="text-xl font-bold flex items-center gap-1.5 text-gray-900 leading-none">
                  ₹{(total ?? 0).toLocaleString()}{" "}
                  <HelpCircle
                    size={12}
                    className="text-gray-400 mb-2"
                    strokeWidth={2.5}
                  />
                </p>
              </div>
              <button
                onClick={() => setStep(3)}
                className="bg-[#ffc200] hover:bg-[#f0b500] text-black font-semibold px-8 py-[13px] rounded-sm text-[16px] min-w-[160px] shadow-sm leading-none transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
