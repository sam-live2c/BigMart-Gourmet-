// Offline mapping database of Indian PIN code prefixes (3-digit and 2-digit)
const pincodePrefix3Mapping: Record<string, { state: string; district: string }> = {
  // Goa
  "403": { state: "Goa", district: "North Goa" },
  // Sikkim
  "737": { state: "Sikkim", district: "Gangtok" },
  // Chandigarh
  "160": { state: "Chandigarh", district: "Chandigarh" },
  // Andaman and Nicobar
  "744": { state: "Andaman and Nicobar Islands", district: "Port Blair" },
  // Puducherry
  "605": { state: "Puducherry", district: "Puducherry" },
  // Lakshadweep
  "682": { state: "Lakshadweep", district: "Kavaratti" },
  // Dadra & Nagar Haveli, Daman & Diu
  "396": { state: "Dadra and Nagar Haveli and Daman and Diu", district: "Daman" },
  // Northeast States (Arunachal, Manipur, Meghalaya, Mizoram, Nagaland, Tripura)
  "791": { state: "Arunachal Pradesh", district: "Itanagar" },
  "792": { state: "Arunachal Pradesh", district: "Along" },
  "793": { state: "Meghalaya", district: "Shillong" },
  "794": { state: "Meghalaya", district: "Tura" },
  "795": { state: "Manipur", district: "Imphal" },
  "796": { state: "Mizoram", district: "Aizawl" },
  "797": { state: "Nagaland", district: "Kohima" },
  "799": { state: "Tripura", district: "Agartala" },
  // Ladakh
  "194": { state: "Ladakh", district: "Leh" },
  // Uttarakhand
  "248": { state: "Uttarakhand", district: "Dehradun" },
  "249": { state: "Uttarakhand", district: "Tehri Garhwal" },
  "263": { state: "Uttarakhand", district: "Nainital" },
  "262": { state: "Uttarakhand", district: "Pithoragarh" },
  // Himachal sub-zones
  "171": { state: "Himachal Pradesh", district: "Shimla" },
  "172": { state: "Punjab", district: "Mohali" },
  "173": { state: "Himachal Pradesh", district: "Solan" },
  "174": { state: "Himachal Pradesh", district: "Bilaspur" },
  "175": { state: "Himachal Pradesh", district: "Mandi" },
  "176": { state: "Himachal Pradesh", district: "Kangra" },
  "177": { state: "Himachal Pradesh", district: "Hamirpur" },
};

const pincodePrefix2Mapping: Record<string, { state: string; district: string }> = {
  // Delhi
  "11": { state: "Delhi", district: "New Delhi" },
  // Haryana
  "12": { state: "Haryana", district: "Faridabad" },
  "13": { state: "Haryana", district: "Ambala" },
  // Punjab
  "14": { state: "Punjab", district: "Amritsar" },
  "15": { state: "Punjab", district: "Bathinda" },
  "16": { state: "Punjab", district: "Chandigarh" },
  // Himachal Pradesh
  "17": { state: "Himachal Pradesh", district: "Shimla" },
  // Jammu & Kashmir
  "18": { state: "Jammu & Kashmir", district: "Jammu" },
  "19": { state: "Jammu & Kashmir", district: "Srinagar" },
  // Uttar Pradesh
  "20": { state: "Uttar Pradesh", district: "Ghaziabad" },
  "21": { state: "Uttar Pradesh", district: "Kanpur" },
  "22": { state: "Uttar Pradesh", district: "Lucknow" },
  "23": { state: "Uttar Pradesh", district: "Allahabad" },
  "24": { state: "Uttar Pradesh", district: "Bareilly" },
  "25": { state: "Uttar Pradesh", district: "Meerut" },
  "26": { state: "Uttar Pradesh", district: "Jhansi" },
  "27": { state: "Uttar Pradesh", district: "Gorakhpur" },
  "28": { state: "Uttar Pradesh", district: "Varanasi" },
  // Rajasthan
  "30": { state: "Rajasthan", district: "Jaipur" },
  "31": { state: "Rajasthan", district: "Udaipur" },
  "32": { state: "Rajasthan", district: "Kota" },
  "33": { state: "Rajasthan", district: "Bikaner" },
  "34": { state: "Rajasthan", district: "Jodhpur" },
  // Gujarat
  "36": { state: "Gujarat", district: "Rajkot" },
  "37": { state: "Gujarat", district: "Jamnagar" },
  "38": { state: "Gujarat", district: "Ahmedabad" },
  "39": { state: "Gujarat", district: "Surat" },
  // Maharashtra
  "40": { state: "Maharashtra", district: "Mumbai" },
  "41": { state: "Maharashtra", district: "Pune" },
  "42": { state: "Maharashtra", district: "Nashik" },
  "43": { state: "Maharashtra", district: "Aurangabad" },
  "44": { state: "Maharashtra", district: "Nagpur" },
  // Madhya Pradesh
  "45": { state: "Madhya Pradesh", district: "Indore" },
  "46": { state: "Madhya Pradesh", district: "Bhopal" },
  "47": { state: "Madhya Pradesh", district: "Gwalior" },
  "48": { state: "Madhya Pradesh", district: "Jabalpur" },
  // Chhattisgarh
  "49": { state: "Chhattisgarh", district: "Raipur" },
  // Telangana
  "50": { state: "Telangana", district: "Hyderabad" },
  // Andhra Pradesh
  "51": { state: "Andhra Pradesh", district: "Kurnool" },
  "52": { state: "Andhra Pradesh", district: "Vijayawada" },
  "53": { state: "Andhra Pradesh", district: "Visakhapatnam" },
  // Karnataka
  "56": { state: "Karnataka", district: "Bangalore" },
  "57": { state: "Karnataka", district: "Tumkur" },
  "58": { state: "Karnataka", district: "Hubli" },
  "59": { state: "Karnataka", district: "Belgaum" },
  // Tamil Nadu
  "60": { state: "Tamil Nadu", district: "Chennai" },
  "61": { state: "Tamil Nadu", district: "Tanjore" },
  "62": { state: "Tamil Nadu", district: "Madurai" },
  "63": { state: "Tamil Nadu", district: "Vellore" },
  "64": { state: "Tamil Nadu", district: "Coimbatore" },
  // Kerala
  "67": { state: "Kerala", district: "Ernakulam" },
  "68": { state: "Kerala", district: "Kottayam" },
  "69": { state: "Kerala", district: "Trivandrum" },
  // West Bengal
  "70": { state: "West Bengal", district: "Kolkata" },
  "71": { state: "West Bengal", district: "Howrah" },
  "72": { state: "West Bengal", district: "Kharagpur" },
  "73": { state: "West Bengal", district: "Siliguri" },
  "74": { state: "West Bengal", district: "Asansol" },
  // Odisha
  "75": { state: "Odisha", district: "Bhubaneswar" },
  "76": { state: "Odisha", district: "Sambalpur" },
  "77": { state: "Odisha", district: "Cuttack" },
  // Assam
  "78": { state: "Assam", district: "Guwahati" },
  // Northeast (Fallback general)
  "79": { state: "Meghalaya", district: "Shillong" },
  // Bihar
  "80": { state: "Bihar", district: "Patna" },
  // Jharkhand
  "81": { state: "Jharkhand", district: "Ranchi" },
  "82": { state: "Jharkhand", district: "Dhanbad" },
  // Bihar Sub-zones
  "83": { state: "Bihar", district: "Muzaffarpur" },
  "84": { state: "Bihar", district: "Bhagalpur" },
  "85": { state: "Bihar", district: "Gaya" },
};

/**
 * Instantly returns standard state and district based on PIN code prefix zones offline.
 */
export function getOfflinePincode(pincode: string): { state: string; district: string } {
  if (!pincode || pincode.length < 2) {
    return { state: "", district: "" };
  }
  
  const cleanPincode = pincode.replace(/\D/g, "");
  
  // Try 3-digit prefix first
  if (cleanPincode.length >= 3) {
    const prefix3 = cleanPincode.slice(0, 3);
    if (pincodePrefix3Mapping[prefix3]) {
      return pincodePrefix3Mapping[prefix3];
    }
  }

  // Try 2-digit prefix next
  const prefix2 = cleanPincode.slice(0, 2);
  if (pincodePrefix2Mapping[prefix2]) {
    return pincodePrefix2Mapping[prefix2];
  }

  // General 1st zone fallbacks as final guardrail
  const prefix1 = cleanPincode.slice(0, 1);
  const fallbacks: Record<string, { state: string; district: string }> = {
    "1": { state: "Delhi", district: "New Delhi" },
    "2": { state: "Uttar Pradesh", district: "Lucknow" },
    "3": { state: "Gujarat", district: "Ahmedabad" },
    "4": { state: "Maharashtra", district: "Mumbai" },
    "5": { state: "Karnataka", district: "Bangalore" },
    "6": { state: "Tamil Nadu", district: "Chennai" },
    "7": { state: "West Bengal", district: "Kolkata" },
    "8": { state: "Bihar", district: "Patna" },
  };

  return fallbacks[prefix1] || { state: "State Name", district: "District Name" };
}

/**
 * Dynamically queries the free Govt of India Post Office API to fetch precise state, district, and local name.
 */
export async function fetchPincodeFromAPI(
  pincode: string
): Promise<{ state: string; district: string; villCity?: string } | null> {
  const cleanPincode = pincode.replace(/\D/g, "");
  if (cleanPincode.length !== 6) return null;

  try {
    // We add a short timeout so user experience stays fast and responsive
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    if (
      data &&
      data[0] &&
      data[0].Status === "Success" &&
      data[0].PostOffice &&
      data[0].PostOffice.length > 0
    ) {
      const office = data[0].PostOffice[0];
      return {
        state: office.State || "",
        district: office.District || "",
        villCity: office.Name || "",
      };
    }
  } catch (error) {
    console.warn("[pincodeHelper] API fetch failed or timed out. Falling back to offline DB. error:", error);
  }
  return null;
}
