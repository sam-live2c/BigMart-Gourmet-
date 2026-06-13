import React, { useState, useEffect } from "react";
import { User, Address } from "../types";
import { getCentralPincodeDetails } from "../services/pincodeService";
import {
  MapPin,
  Plus,
  CreditCard,
  Trash2,
  Edit2,
  ShieldCheck,
  User as UserIcon,
  Camera,
  Save,
  ArrowLeft,
  ChevronRight,
  Zap,
  RotateCcw,
  FileText,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileSubPagesProps {
  type: "addresses" | "payments" | "edit" | "cancellations";
  user: User | null;
  setUser?: (user: User | null) => void;
}

const ProfileSubPages: React.FC<ProfileSubPagesProps> = ({
  type,
  user,
  setUser,
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Profile Edit States
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [showOTP, setShowOTP] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  const [nameInput, setNameInput] = useState(user?.name || "");

  const [addrForm, setAddrForm] = useState(() => {
    try {
      if (user?.address && user.address.startsWith("{")) {
        const parsed = JSON.parse(user.address);
        return {
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

  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (user && !hasSynced) {
      setEmailInput(user.email || "");
      setNameInput(user.name || "");
      setHasSynced(true);
      try {
        if (user.address && user.address.startsWith("{")) {
          const parsed = JSON.parse(user.address);
          setAddrForm({
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
        } else if (user.address) {
          setAddrForm(prev => ({
            ...prev,
            villCity: user.address || "",
          }));
        }
      } catch (e) {
        if (user.address) {
          setAddrForm(prev => ({
            ...prev,
            villCity: user.address,
          }));
        }
      }
    }
  }, [user, hasSynced]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-5 text-center">
        <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserIcon size={40} className="text-cyan-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 uppercase tracking-tight">Your Account Settings</h2>
        <p className="text-gray-500 mb-8 text-sm">Please sign in to view or manage your personal details, addresses, and account options.</p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-[#f0c14b] border-[1px] border-[#a88734] hover:bg-[#f5d782] text-gray-900 py-2.5 rounded-[4px] font-medium shadow active:scale-95 transition-all text-sm tracking-wide"
        >
          Sign In with Google / Email
        </button>
      </div>
    );
  }

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

  const handleSave = () => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    if (!nameInput.trim()) {
      newErrors.name = "Name cannot be empty.";
      hasErrors = true;
    }
    if (addrForm.pincode.length !== 6) {
      newErrors.pincode = "Valid 6-digit pincode is required";
      hasErrors = true;
    }
    if (addrForm.phone.length !== 10) {
      newErrors.phone = "Valid 10-digit phone number is required";
      hasErrors = true;
    }
    if (!addrForm.villCity.trim()) {
      newErrors.villCity = "City/Village is required";
      hasErrors = true;
    }
    if (!addrForm.areaColony?.trim()) {
      newErrors.areaColony = "Area/Colony/Street is required";
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

    if (hasErrors) {
      setAddressErrors(newErrors);
      return;
    }

    if (user?.email && emailInput !== user.email && !emailVerified) {
      alert("Please verify your new email address before saving.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = {
        ...user!,
        name: nameInput,
        email: emailInput,
        address: JSON.stringify(addrForm),
      };
      if (setUser) {
        setUser(updatedUser as User);
      }
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const handleSendOTP = () => {
    if (!emailInput) return;
    setIsSendingOTP(true);
    setTimeout(() => {
      setIsSendingOTP(false);
      setShowOTP(true);
    }, 800);
  };

  const handleVerifyOTP = () => {
    if (otpInput.length < 4) return;
    setIsVerifyingOTP(true);
    setTimeout(() => {
      setIsVerifyingOTP(false);
      setShowOTP(false);
      setEmailVerified(true);
    }, 800);
  };

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

  const getPresentAddressObj = (): Address | null => {
    if (!user || !user.address) return null;
    try {
      if (user.address.startsWith("{")) {
        const parsed = JSON.parse(user.address);
        return {
          id: "present",
          name: user.name || "Present Address Owner",
          phone: parsed.phone || "",
          pincode: parsed.pincode || "",
          villCity: parsed.villCity || "",
          district: parsed.district || "",
          state: parsed.state || "",
          country: parsed.country || "India",
          countryCode: parsed.countryCode || "+91",
          areaColony: parsed.areaColony || "",
          landmark: parsed.landmark || "",
          type: "HOME",
          isDefault: false
        };
      } else {
        return {
          id: "present",
          name: user.name || "Present Address Owner",
          phone: "",
          pincode: "",
          villCity: user.address,
          district: "",
          state: "",
          country: "India",
          countryCode: "+91",
          areaColony: "",
          landmark: "",
          type: "HOME",
          isDefault: false
        };
      }
    } catch (e) {
      return null;
    }
  };

  const [listAddrForm, setListAddrForm] = useState({
    name: "",
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
  const [listAddressErrors, setListAddressErrors] = useState<
    Record<string, string>
  >({});

  const handleListPincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    let newState = listAddrForm.state;
    let newDistrict = listAddrForm.district;

    if (val.length === 6) {
      const offline = getCentralPincodeDetails(val);
      newState = offline.state;
      newDistrict = offline.district;
    }

    setListAddrForm((prev) => ({
      ...prev,
      pincode: val,
      state: newState,
      district: newDistrict,
    }));
  };

  const handleSaveListAddress = () => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    if (!listAddrForm.name.trim()) {
      newErrors.name = "Full name is required";
      hasErrors = true;
    }
    if (listAddrForm.pincode.length !== 6) {
      newErrors.pincode = "Valid 6-digit pincode is required";
      hasErrors = true;
    }
    if (listAddrForm.phone.length !== 10) {
      newErrors.phone = "Valid 10-digit phone number is required";
      hasErrors = true;
    }
    if (!listAddrForm.villCity.trim()) {
      newErrors.villCity = "City/Village is required";
      hasErrors = true;
    }
    if (!listAddrForm.areaColony?.trim()) {
      newErrors.areaColony = "Area/Colony/Street is required";
      hasErrors = true;
    }
    if (!listAddrForm.state.trim()) {
      newErrors.state = "State is required";
      hasErrors = true;
    }
    if (!listAddrForm.district.trim()) {
      newErrors.district = "District is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setListAddressErrors(newErrors);
      return;
    }

    if (editingAddressId === "present") {
      if (user && setUser) {
        const updatedUser = {
          ...user,
          address: JSON.stringify({
            phone: listAddrForm.phone,
            pincode: listAddrForm.pincode,
            villCity: listAddrForm.villCity,
            district: listAddrForm.district,
            state: listAddrForm.state,
            country: listAddrForm.country,
            countryCode: listAddrForm.countryCode,
            areaColony: listAddrForm.areaColony,
            landmark: listAddrForm.landmark,
            type: listAddrForm.type,
          }),
        };
        setUser(updatedUser);
        setShowAddressForm(false);
        setEditingAddressId(null);
      }
      return;
    }

    if (user && setUser) {
      const timestampId = Date.now().toString();
      const newAddr = {
        id: editingAddressId || timestampId,
        ...listAddrForm,
        isDefault: (user.addresses || []).length === 0 ? true : false,
      };

      let newAddresses = [...(user.addresses || [])];
      if (editingAddressId) {
        newAddresses = newAddresses.map((a) =>
          a.id === editingAddressId
            ? { ...newAddr, isDefault: a.isDefault }
            : a,
        );
      } else {
        newAddresses.push(newAddr);
      }

      const updatedUser = {
        ...user,
        addresses: newAddresses,
      };

      setUser(updatedUser);
      setShowAddressForm(false);
      setEditingAddressId(null);
    }
  };

  const setAsDefaultListAddress = (id: string) => {
    if (user && setUser) {
      const newAddresses = (user.addresses || []).map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      setUser({ ...user, addresses: newAddresses });
    }
  };

  const removeListAddress = (id: string) => {
    setAddressToDeleteId(id);
  };

  const confirmRemoveAddress = () => {
    if (!addressToDeleteId || !user || !setUser) return;
    const id = addressToDeleteId;
    if (id === "present") {
      setUser({
        ...user,
        address: "",
      });
    } else {
      let newAddresses = (user.addresses || []).filter((a) => a.id !== id);
      if (newAddresses.length > 0 && !newAddresses.find((a) => a.isDefault)) {
        newAddresses[0].isDefault = true;
      }
      setUser({ ...user, addresses: newAddresses });
    }
    setAddressToDeleteId(null);
  };

  const targetAddressToConfirm = () => {
    if (!addressToDeleteId || !user) return null;
    if (addressToDeleteId === "present") {
      return getPresentAddressObj();
    }
    return (user.addresses || []).find((a) => a.id === addressToDeleteId) || null;
  };

  const openEditForm = (id: string) => {
    if (id === "present") {
      const presentAddrObj = getPresentAddressObj();
      if (presentAddrObj) {
        setListAddrForm({
          name: presentAddrObj.name,
          phone: presentAddrObj.phone,
          pincode: presentAddrObj.pincode,
          villCity: presentAddrObj.villCity,
          district: presentAddrObj.district,
          state: presentAddrObj.state,
          country: presentAddrObj.country,
          countryCode: presentAddrObj.countryCode,
          areaColony: presentAddrObj.areaColony || "",
          landmark: presentAddrObj.landmark || "",
          type: presentAddrObj.type || "HOME",
        });
        setEditingAddressId(id);
        setShowAddressForm(true);
        setListAddressErrors({});
      }
      return;
    }

    const addr = (user?.addresses || []).find((a) => a.id === id);
    if (addr) {
      setListAddrForm({
        name: addr.name,
        phone: addr.phone,
        pincode: addr.pincode,
        villCity: addr.villCity,
        district: addr.district,
        state: addr.state,
        country: addr.country,
        countryCode: addr.countryCode,
        areaColony: addr.areaColony || "",
        landmark: addr.landmark || "",
        type: addr.type || "HOME",
      });
      setEditingAddressId(id);
      setShowAddressForm(true);
      setListAddressErrors({});
    }
  };

  const openNewAddrForm = () => {
    setListAddrForm({
      name: "",
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
    setEditingAddressId(null);
    setShowAddressForm(true);
    setListAddressErrors({});
  };

  const renderAddresses = () => {
    if (showAddressForm) {
      return (
        <div className="bg-white">
          <div className="mb-6 flex items-center">
            <h1 className="text-2xl sm:text-[28px] font-normal text-gray-900 leading-tight">
              {editingAddressId ? "Update your address" : "Add a new address"}
            </h1>
          </div>
          <form
            className="max-w-xl space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveListAddress();
            }}
          >
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Country/Region
              </label>
              <input
                type="text"
                disabled
                readOnly
                value={listAddrForm.country}
                className="w-full h-8 px-2 border border-[#888c8c] rounded-[3px] bg-[#f0f2f2] text-sm text-[#0f1111] shadow-[0_1px_2px_rgba(15,17,17,0.15)_inset] cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Full name
              </label>
              <input
                type="text"
                value={listAddrForm.name}
                onChange={(e) => {
                  setListAddrForm({ ...listAddrForm, name: e.target.value });
                  setListAddressErrors({ ...listAddressErrors, name: "" });
                }}
                className={`w-full border ${listAddressErrors.name ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
              />
              {listAddressErrors.name && (
                <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                  <span className="text-[14px]">!</span>{" "}
                  {listAddressErrors.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Mobile number
              </label>
              <div className="flex">
                <span className="bg-gray-100 border border-[#888c8c] border-r-0 px-2.5 py-1 text-[13px] text-gray-600 rounded-l-[3px] flex items-center">
                  {listAddrForm.countryCode}
                </span>
                <input
                  type="tel"
                  value={listAddrForm.phone}
                  onChange={(e) => {
                    setListAddrForm({
                      ...listAddrForm,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    });
                    setListAddressErrors({ ...listAddressErrors, phone: "" });
                  }}
                  className={`w-full border ${listAddressErrors.phone ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-r-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
                  placeholder="10-digit mobile number without prefixes"
                />
              </div>
              {listAddressErrors.phone && (
                <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                  <span className="text-[14px]">!</span>{" "}
                  {listAddressErrors.phone}
                </div>
              )}
              <p className="text-[11px] text-[#565959] mt-0.5 leading-tight">
                May be used to assist delivery
              </p>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={listAddrForm.pincode}
                onChange={(e) => {
                  handleListPincodeChange(e);
                  setListAddressErrors({ ...listAddressErrors, pincode: "" });
                }}
                className={`w-full border ${listAddressErrors.pincode ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
                placeholder="6 digits [0-9] PIN code"
              />
              {listAddressErrors.pincode && (
                <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                  <span className="text-[14px]">!</span>{" "}
                  {listAddressErrors.pincode}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Flat, House no., Building, Company, Apartment *
              </label>
              <input
                type="text"
                value={listAddrForm.villCity}
                onChange={(e) => {
                  setListAddrForm({
                    ...listAddrForm,
                    villCity: e.target.value,
                  });
                  setListAddressErrors({ ...listAddressErrors, villCity: "" });
                }}
                className={`w-full border ${listAddressErrors.villCity ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
                placeholder="House number, Flat name, etc."
              />
              {listAddressErrors.villCity && (
                <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                  <span className="text-[14px]">!</span>{" "}
                  {listAddressErrors.villCity}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Area, Colony, Street, Sector, Village *
              </label>
              <input
                type="text"
                value={listAddrForm.areaColony}
                onChange={(e) => {
                  setListAddrForm({
                    ...listAddrForm,
                    areaColony: e.target.value,
                  });
                  setListAddressErrors({
                    ...listAddressErrors,
                    areaColony: "",
                  });
                }}
                className={`w-full border ${listAddressErrors.areaColony ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
                placeholder="Area, colony status, street name, main sector"
              />
              {listAddressErrors.areaColony && (
                <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                  <span className="text-[14px]">!</span>{" "}
                  {listAddressErrors.areaColony}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={listAddrForm.landmark}
                onChange={(e) =>
                  setListAddrForm({ ...listAddrForm, landmark: e.target.value })
                }
                className="w-full border border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)] rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow"
                placeholder="e.g. Near Apollo Hospital, beside bakery house"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                Address Type
              </label>
              <select
                value={listAddrForm.type}
                onChange={(e) =>
                  setListAddrForm({ ...listAddrForm, type: e.target.value })
                }
                className="w-full h-8 px-2 border border-[#888c8c] rounded-[3px] bg-white text-sm text-[#0f1111] shadow-[0_1px_2px_rgba(15,17,17,0.15)_inset] cursor-pointer focus:border-[#007185] focus:outline-none"
              >
                <option value="HOME">Home (7 AM - 9 PM delivery)</option>
                <option value="OFFICE">Office (10 AM - 6 PM delivery)</option>
                <option value="COMMERCIAL">Commercial / Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                  Town/City
                </label>
                <input
                  type="text"
                  value={listAddrForm.district}
                  onChange={(e) => {
                    setListAddrForm({
                      ...listAddrForm,
                      district: e.target.value,
                    });
                    setListAddressErrors({
                      ...listAddressErrors,
                      district: "",
                    });
                  }}
                  className={`w-full border ${listAddressErrors.district ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
                />
                {listAddressErrors.district && (
                  <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                    <span className="text-[14px]">!</span>{" "}
                    {listAddressErrors.district}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#0f1111] mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={listAddrForm.state}
                  onChange={(e) => {
                    setListAddrForm({ ...listAddrForm, state: e.target.value });
                    setListAddressErrors({ ...listAddressErrors, state: "" });
                  }}
                  className={`w-full border ${listAddressErrors.state ? "border-[#cc0c39] focus:shadow-[0_0_0_3px_rgba(204,12,57,0.3)]" : "border-[#888c8c] focus:border-[#007185] focus:shadow-[0_0_0_3px_rgba(0,113,133,0.3)]"} rounded-[3px] px-2 py-1 text-[13px] outline-none transition-shadow`}
                />
                {listAddressErrors.state && (
                  <div className="text-[#cc0c39] text-xs mt-1 flex items-center gap-1">
                    <span className="text-[14px]">!</span>{" "}
                    {listAddressErrors.state}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex gap-4">
              <button
                type="submit"
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] py-2 px-4 shadow-sm text-[13px] font-medium leading-none cursor-pointer"
              >
                {editingAddressId ? "Save changes" : "Add address"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] py-2 px-4 shadow-sm text-[13px] font-medium leading-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }

    const presentAddrObj = getPresentAddressObj();
    const addressesToRender = presentAddrObj ? [presentAddrObj, ...(user.addresses || [])] : (user.addresses || []);

    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-[28px] font-normal text-gray-900 leading-tight mb-6">
          Your Addresses
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={openNewAddrForm}
            className="border-2 border-dashed border-[#c8c8c8] hover:border-[#a2a6ac] hover:bg-[#f6f6f6] rounded-[8px] h-[260px] flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <Plus size={48} className="text-[#c8c8c8] mb-2" />
            <h2 className="text-xl font-bold text-[#565959]">Add address</h2>
          </div>

          {addressesToRender.map((addr) => (
            <div
              key={addr.id}
              className="border border-[#cccccc] hover:border-[#a2a6ac] rounded-[8px] bg-white h-[260px] relative flex flex-col"
            >
              {addr.id === "present" ? (
                <div className="border-b border-amber-300 bg-amber-50/50 px-4 py-2 rounded-t-[8px]">
                  <span className="text-xs font-bold text-amber-700 block uppercase tracking-wider">
                    Present Address:
                  </span>
                  <div className="bg-amber-500 h-[3px] absolute top-[-1px] left-[-1px] right-[-1px] rounded-t-[8px]"></div>
                </div>
              ) : addr.isDefault ? (
                <div className="border-b border-[#cccccc] px-4 py-2">
                  <span className="text-sm font-bold text-[#565959] block">
                    Default:
                  </span>
                  <div className="bg-[#c44133] h-[3px] absolute top-[-1px] left-[-1px] right-[-1px] rounded-t-[8px]"></div>
                </div>
              ) : null}

              <div
                className="p-4 flex-1 overflow-hidden"
                style={{ paddingTop: (addr.isDefault || addr.id === "present") ? "12px" : "16px" }}
              >
                <div className="flex items-center gap-2 mb-1.5 justify-between">
                  <h3 className="font-bold text-[15px] leading-tight text-[#0f1111] line-clamp-1">
                    {addr.name}
                  </h3>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200 uppercase shrink-0">
                    {addr.id === "present" ? "PRESENT" : (addr.type || "HOME")}
                  </span>
                </div>
                <p className="text-[14px] text-[#0f1111] leading-snug line-clamp-1">
                  {addr.villCity}
                </p>
                {addr.areaColony && (
                  <p className="text-[13px] text-gray-700 leading-snug line-clamp-1">
                    {addr.areaColony}
                  </p>
                )}
                {addr.landmark && (
                  <p className="text-[13px] text-gray-500 italic leading-snug line-clamp-1">
                    Landmark: {addr.landmark}
                  </p>
                )}
                {(addr.district || addr.state || addr.pincode) && (
                  <p className="text-[14px] text-[#0f1111] leading-snug line-clamp-1">
                    {addr.district ? addr.district + ", " : ""}{addr.state ? addr.state + " " : ""}{addr.pincode || ""}
                  </p>
                )}
                <p className="text-[14px] text-[#0f1111] leading-snug">
                  {addr.country}
                </p>
                {addr.phone && (
                  <p className="text-[14px] text-[#0f1111] leading-snug mt-1 text-gray-600">
                    Phone: {addr.phone}
                  </p>
                )}
              </div>

              <div className="p-4 pt-0 mt-auto flex items-center gap-3 text-[14px] text-[#007185]">
                <button
                  onClick={() => openEditForm(addr.id)}
                  className="hover:text-[#c40000] hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <span className="text-[#cccccc]">|</span>
                <button
                  onClick={() => removeListAddress(addr.id)}
                  className="hover:text-[#c40000] hover:underline cursor-pointer"
                >
                  Remove
                </button>
                {addr.id !== "present" && !addr.isDefault && (
                  <>
                    <span className="text-[#cccccc]">|</span>
                    <button
                      onClick={() => setAsDefaultListAddress(addr.id)}
                      className="hover:text-[#c40000] hover:underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            My Wallet & Cards
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Securely stored payment methods
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Visual */}
        <div className="bg-gradient-to-br from-[#1a1a3a] to-[#15803d] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <CreditCard size={32} strokeWidth={1.5} />
            <span className="text-[10px] font-black tracking-[0.2em] italic opacity-60 uppercase">
              Platinum Swift
            </span>
          </div>
          <div>
            <p className="text-xl tracking-[0.3em] font-black mb-6">
              •••• •••• •••• 4242
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">
                  Valid Thru
                </p>
                <p className="text-xs font-bold uppercase">12 / 28</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">
                  Card Holder
                </p>
                <p className="text-xs font-bold uppercase truncate max-w-[120px]">
                  {user.name}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* UPI Shortcut */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#15803d] transition-colors">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="text-[#15803d]" />
          </div>
          <h3 className="font-bold text-gray-800">Add New Card</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
            Visa, Mastercard, RuPay
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 flex items-center gap-4">
        <ShieldCheck size={24} className="text-[#15803d] shrink-0" />
        <div className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
          BigMart Gourmet Payments is 100% PCI-DSS compliant. Your security is our
          highest priority.
        </div>
      </div>
    </div>
  );

  const renderCancellations = () => {
    return (
      <div className="space-y-6 text-left">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="text-[#15803d]" size={22} />
            Cancellations & Refunds Policy
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Understand how orders are cancelled and refunds are processed for
            our superfast under 1-hour delivery service.
          </p>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-150 space-y-2">
            <div className="flex items-center gap-2 text-[#15803d] font-bold text-sm">
              <RotateCcw size={18} />
              <span>1. How to Cancel?</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Since we fulfill orders within{" "}
              <span className="font-semibold text-gray-900">1 hour</span>, you
              can cancel your order directly from the order history page before
              our executive picks up the items from our partner store. For
              instant grocery and fresh produce orders, we recommend cancelling
              within{" "}
              <span className="font-semibold text-gray-900">5 minutes</span> of
              placing it.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-150 space-y-2">
            <div className="flex items-center gap-2 text-[#15803d] font-bold text-sm">
              <Zap size={18} />
              <span>2. Superfast Refunds</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              We leverage an instant digital ledger settlement. The moment your
              order is cancelled, we initiate the refund back to your original
              source account (UPI, Debit/Credit Card, or NetBanking). Refund
              status updates are instantly logged on your user profile.
            </p>
          </div>
        </div>

        {/* Timelines Document Table */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-3 bg-gray-50 border-b flex items-center gap-2 font-semibold">
            <FileText size={16} className="text-gray-500" />
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Refund Method and Timelines
            </h3>
          </div>
          <div className="divide-y text-xs text-gray-600">
            <div className="p-3 flex justify-between items-center bg-green-50/30">
              <div>
                <span className="font-bold text-gray-900 block">
                  UPI (GPay / PhonePe / Paytm)
                </span>
                <span className="text-[11px] text-gray-500">
                  Instant direct transfer back to linked bank account
                </span>
              </div>
              <span className="text-[#15803d] font-bold text-right shrink-0">
                Instant (Within 1 Hour)
              </span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900 block">
                  Credit & Debit Cards
                </span>
                <span className="text-[11px] text-gray-500">
                  Reversal via payment gateway (Razorpay / Stripe)
                </span>
              </div>
              <span className="text-gray-900 font-semibold text-right shrink-0">
                1 - 24 Hours
              </span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900 block">
                  NetBanking
                </span>
                <span className="text-[11px] text-gray-500">
                  Bank automated clearing house protocol
                </span>
              </div>
              <span className="text-gray-900 font-semibold text-right shrink-0">
                1 - 2 Business Days
              </span>
            </div>
          </div>
        </div>

        {/* Returns and Freshness Guarantee */}
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-150 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
            <HelpCircle size={18} />
            <span>Need Help? Our 100% Freshness Reassurance</span>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            In case you missed the cancellation window but found any item has
            freshness or quality deficits upon delivery, we provide a{" "}
            <span className="font-semibold">
              no-questions-asked refund or replacement within 24 hours
            </span>
            . Please reach out to our Customer Success executive via email or
            visit the Help center for an lightning-fast resolution!
          </p>
        </div>
      </div>
    );
  };

  const renderEdit = () => (
    <div className="max-w-xl mx-auto">
      <form className="space-y-5">
        <div className="space-y-1">
          <label className="text-[13px] font-bold text-gray-900">Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setAddressErrors({ ...addressErrors, name: "" });
            }}
            className={`w-full border ${addressErrors.name ? "border-red-500" : "border-gray-400"} rounded-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
          />
          {addressErrors.name && (
            <p className="text-red-500 text-[10px] mt-1">
              {addressErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-4 border border-gray-200 rounded-[3px] p-4 bg-gray-50/50">
          <label className="text-[14px] font-bold text-gray-900 block border-b border-gray-200 pb-2 mb-3">
            Address
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-gray-900">
                Pincode *
              </label>
              <input
                type="text"
                value={addrForm.pincode}
                onChange={(e) => {
                  handlePincodeChange(e);
                  setAddressErrors({ ...addressErrors, pincode: "" });
                }}
                maxLength={6}
                className={`w-full border ${addressErrors.pincode ? "border-red-500" : "border-gray-400"} rounded-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
              />
              {addressErrors.pincode && (
                <p className="text-red-500 text-[10px] mt-1">
                  {addressErrors.pincode}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-gray-900">
                Phone number *
              </label>
              <div className="flex">
                <span
                  className={`bg-gray-100 border ${addressErrors.phone ? "border-red-500" : "border-gray-400"} border-r-0 px-3 py-1.5 text-sm text-gray-600 rounded-l-[3px]`}
                >
                  {addrForm.countryCode}
                </span>
                <input
                  type="tel"
                  value={addrForm.phone}
                  onChange={(e) => {
                    setAddrForm({
                      ...addrForm,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    });
                    setAddressErrors({ ...addressErrors, phone: "" });
                  }}
                  className={`w-full min-w-0 border ${addressErrors.phone ? "border-red-500" : "border-gray-400"} rounded-r-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
                />
              </div>
              {addressErrors.phone && (
                <p className="text-red-500 text-[10px] mt-1">
                  {addressErrors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-900">
              Flat, House no., Building, Company, Apartment *
            </label>
            <input
              type="text"
              value={addrForm.villCity}
              onChange={(e) => {
                setAddrForm({ ...addrForm, villCity: e.target.value });
                setAddressErrors({ ...addressErrors, villCity: "" });
              }}
              className={`w-full border ${addressErrors.villCity ? "border-red-500" : "border-gray-400"} rounded-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
              placeholder="House number, Flat name, etc."
            />
            {addressErrors.villCity && (
              <p className="text-red-500 text-[10px] mt-1">
                {addressErrors.villCity}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-900">
              Area, Colony, Street, Sector, Village *
            </label>
            <input
              type="text"
              value={addrForm.areaColony}
              onChange={(e) => {
                setAddrForm({ ...addrForm, areaColony: e.target.value });
                setAddressErrors({ ...addressErrors, areaColony: "" });
              }}
              className={`w-full border ${addressErrors.areaColony ? "border-red-500" : "border-gray-400"} rounded-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
              placeholder="Area, colony status, street name, main sector"
            />
            {addressErrors.areaColony && (
              <p className="text-red-500 text-[10px] mt-1">
                {addressErrors.areaColony}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-900">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={addrForm.landmark}
              onChange={(e) =>
                setAddrForm({ ...addrForm, landmark: e.target.value })
              }
              className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition"
              placeholder="e.g. Near Apollo Hospital, beside bakery house"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-900">
              Address Type
            </label>
            <select
              value={addrForm.type}
              onChange={(e) =>
                setAddrForm({ ...addrForm, type: e.target.value })
              }
              className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] cursor-pointer"
            >
              <option value="HOME">Home (7 AM - 9 PM delivery)</option>
              <option value="OFFICE">Office (10 AM - 6 PM delivery)</option>
              <option value="COMMERCIAL">Commercial / Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-gray-900">
                State *
              </label>
              <input
                type="text"
                value={addrForm.state}
                onChange={(e) => {
                  setAddrForm({ ...addrForm, state: e.target.value });
                  setAddressErrors({ ...addressErrors, state: "" });
                }}
                className={`w-full border ${addressErrors.state ? "border-red-500" : "border-gray-400"} rounded-[3px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
              />
              {addressErrors.state && (
                <p className="text-red-500 text-[10px] mt-1">
                  {addressErrors.state}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-gray-900">
                District *
              </label>
              <input
                type="text"
                value={addrForm.district}
                onChange={(e) => {
                  setAddrForm({ ...addrForm, district: e.target.value });
                  setAddressErrors({ ...addressErrors, district: "" });
                }}
                className={`w-full border ${addressErrors.district ? "border-red-500" : "border-gray-400"} rounded-[3px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition`}
              />
              {addressErrors.district && (
                <p className="text-red-500 text-[10px] mt-1">
                  {addressErrors.district}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-900">
              Country
            </label>
            <input
              type="text"
              disabled
              readOnly
              value={addrForm.country}
              className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/addresses")}
            className="text-[13px] text-cyan-700 hover:text-cyan-800 hover:underline flex items-center gap-1 font-medium pt-1"
          >
            <Plus size={14} /> Add more addresses
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-[13px] font-bold text-gray-900">Email</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailVerified(false);
                setShowOTP(false);
              }}
              className="flex-1 border border-gray-400 rounded-[3px] px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition"
            />
            {emailInput !== user.email && !emailVerified && !showOTP && (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isSendingOTP}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-4 py-1.5 rounded-[3px] text-sm whitespace-nowrap transition disabled:opacity-50 sm:w-auto w-full text-center"
              >
                {isSendingOTP ? "Sending..." : "Verify Email"}
              </button>
            )}
            {emailVerified && (
              <span className="inline-flex items-center justify-center gap-1 text-green-700 text-sm font-medium bg-green-50 px-3 py-1.5 border border-green-200 rounded-[3px] sm:w-auto w-full">
                <ShieldCheck size={16} /> Verified
              </span>
            )}
          </div>

          {showOTP && !emailVerified && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-[3px] animate-in slide-in-from-top-2 fade-in duration-200">
              <label className="text-[13px] font-bold text-gray-900 block mb-2">
                Enter OTP sent to {emailInput}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="flex-1 max-w-[160px] border border-gray-400 rounded-[3px] px-3 py-1.5 text-sm text-center tracking-widest focus:outline-none focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(0,168,225,0.3)] transition"
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isVerifyingOTP || otpInput.length < 4}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 border border-[#fcd200] px-4 rounded-[3px] text-sm font-medium transition disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
                >
                  {isVerifyingOTP ? "Verifying..." : "Confirm OTP"}
                </button>
              </div>
            </div>
          )}

          {emailVerified && emailInput !== user.email && (
            <p className="text-xs text-green-600 font-medium mt-1">
              Email verify successful. Please save changes.
            </p>
          )}
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              isSaved ||
              (emailInput !== user.email && !emailVerified)
            }
            className={`h-9 px-6 rounded-[8px] font-normal text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSaved
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 border border-[#fcd200]"
            }`}
          >
            {isSaving
              ? "Saving..."
              : isSaved
                ? "Saved Changes"
                : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/account")}
          className="flex items-center gap-1.5 text-[15px] font-bold text-gray-800 hover:text-[#c40000] hover:underline"
          style={{ verticalAlign: "middle" }}
        >
          <ArrowLeft size={18} />
          {type === "edit"
            ? "Profile settings"
            : type === "cancellations"
              ? "Cancellations & Refunds"
              : `Profile / ${type}`}
        </button>
      </div>

      <div
        className={`bg-white border rounded-[8px] p-5 sm:p-8 shadow-sm min-h-[500px] animate-in fade-in duration-500 mx-auto ${type === "addresses" && !showAddressForm ? "max-w-5xl" : "max-w-2xl"}`}
      >
        {type === "addresses" && renderAddresses()}
        {type === "payments" && renderPayments()}
        {type === "edit" && renderEdit()}
        {type === "cancellations" && renderCancellations()}
      </div>

      {addressToDeleteId && (() => {
        const addr = targetAddressToConfirm();
        if (!addr) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-200" id="amazon-delete-modal-backdrop">
            <div className="bg-white rounded-[8px] border border-[#cccccc] shadow-2xl max-w-[420px] w-full overflow-hidden animate-in zoom-in-95 duration-200" id="amazon-delete-modal-container">
              {/* Header */}
              <div className="bg-[#f0f2f2] border-b border-[#cccccc] px-6 py-4 flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#0f1111] flex items-center gap-2">
                  <AlertTriangle className="text-[#c41100] h-5 w-5 shrink-0" />
                  <span>Confirm Removal</span>
                </h3>
                <button
                  onClick={() => setAddressToDeleteId(null)}
                  className="text-[#565959] hover:text-[#0f1111] leading-none text-xl p-1 cursor-pointer"
                  id="close-delete-modal"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <p className="text-[14px] text-[#0f1111] leading-normal font-medium">
                  Are you sure you want to remove this address?
                </p>

                {/* Address Card Preview */}
                <div className="bg-amber-50/30 border border-amber-200 rounded-lg p-3.5 space-y-1 text-[13px] text-[#0f1111]">
                  <div className="flex items-center justify-between font-bold mb-1 border-b border-amber-200/50 pb-1">
                    <span>{addr.name}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                      {addr.id === "present" ? "Present" : (addr.type || "HOME")}
                    </span>
                  </div>
                  <p className="line-clamp-1">{addr.villCity}</p>
                  {addr.areaColony && <p className="line-clamp-1 text-gray-600">{addr.areaColony}</p>}
                  {addr.landmark && <p className="italic text-gray-500">Landmark: {addr.landmark}</p>}
                  {(addr.district || addr.state || addr.pincode) && (
                    <p>
                      {addr.district ? `${addr.district}, ` : ""}{addr.state ? `${addr.state} ` : ""}{addr.pincode || ""}
                    </p>
                  )}
                  {addr.phone && <p className="text-gray-600 font-medium font-mono text-xs">Phone: {addr.phone}</p>}
                </div>
              </div>

              {/* Footer (Amazon Style Action Buttons) */}
              <div className="bg-[#fcfcfc] border-t border-[#f0f2f2] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setAddressToDeleteId(null)}
                  className="bg-white hover:bg-[#f7fafa] text-[#0f1111] border border-[#d5d9d9] hover:border-[#a2a6ac] rounded-[8px] py-1.5 px-4 text-[13px] font-normal cursor-pointer transition shadow-[0_1px_2px_rgba(15,17,17,0.15)] outline-none"
                  id="cancel-delete-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveAddress}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] hover:border-[#f5be00] rounded-[8px] py-1.5 px-5 text-[13px] font-normal cursor-pointer transition shadow-[0_1px_2px_rgba(15,17,17,0.15)] outline-none"
                  id="confirm-delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProfileSubPages;
