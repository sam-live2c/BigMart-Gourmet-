
import React, { useEffect } from 'react';
import { Info, ShieldCheck, Truck, RotateCcw, Ruler, Lock, FileText, Cookie } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface StaticInfoProps {
  title: string;
  type: 'about' | 'legal' | 'shipping' | 'returns' | 'size' | 'privacy' | 'terms' | 'cookies';
}

const StaticInfo: React.FC<StaticInfoProps> = ({ title, type }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  if (type === 'privacy') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white text-[#0F1111]" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="mb-8">
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight mb-2">Privacy Notice</h1>
          <p className="text-[13px] text-[#565959]">Last updated: June 11, 2026</p>
        </div>

        <div className="space-y-6 text-[15px] leading-relaxed">
          <p>
            We know that you care how information about you is used and shared, and we appreciate your trust that we will do so carefully and sensibly. This Privacy Notice describes how BigMart Gourmet collects and processes your personal information through BigMart Gourmet websites, devices, products, services, gourmet food ordering platform, and applications that reference this Privacy Notice (together "BigMart Gourmet Services").
          </p>

          <div>
            <h2 className="text-[17px] font-bold mb-2">What Personal Information About Customers Does BigMart Gourmet Collect?</h2>
            <p className="mb-3">We collect your personal information in order to provide and continually improve our gourmet chef and food delivery products and services. Here are the types of personal information we collect:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Information You Give Us:</strong> We receive and store any information you provide in relation to BigMart Gourmet Services. You can choose not to provide certain information, but then you might not be able to take advantage of many of our BigMart Gourmet Services.</li>
              <li><strong>Automatic Information:</strong> We automatically collect and store certain types of information about your use of BigMart Gourmet Services, including information about your interaction with gourmet menu items, cuisines, and services available through BigMart Gourmet Services. Like many websites, we use "cookies" and other unique identifiers.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[17px] font-bold mb-2">For What Purposes Does BigMart Gourmet Use Your Personal Information?</h2>
            <p className="mb-3">We use your personal information to operate, provide, develop, and improve the food ordering and product delivery services that we offer our customers. These purposes include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Purchase and delivery of products and services.</strong> We use your personal information to take and handle gourmet orders, deliver food and beverage items, process secure payments, and communicate with you about orders, gourmet choices, and promotional offers.</li>
              <li><strong>Provide, troubleshoot, and improve BigMart Gourmet Services.</strong> We use your personal information to provide food ordering and delivery functionality, analyze performance, fix errors, and improve the usability and effectiveness of the BigMart Gourmet Services.</li>
              <li><strong>Recommendations and personalization.</strong> We use your personal information to recommend cuisines, chef specials, products, and services that might be of interest to you, identify your preferences, and personalize your experience with BigMart Gourmet Services.</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-[17px] font-bold mb-2">Does BigMart Gourmet Share Your Personal Information?</h2>
            <p>
              Information about our customers is an important part of our business, and we are not in the business of selling our customers' personal info or culinary preferences to others. We share customers' personal information only as described below and with subsidiaries BigMart Gourmet controls that either are subject to this Privacy Notice or follow practices at least as protective as those described in this Privacy Notice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'terms') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white text-[#0F1111]" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="mb-8">
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight mb-2">Conditions of Use</h1>
          <p className="text-[13px] text-[#565959]">Last updated: June 11, 2026</p>
        </div>

        <div className="space-y-6 text-[15px] leading-relaxed">
          <p>
            Welcome to BigMart Gourmet. BigMart Gourmet and/or its affiliates provide website features and other culinary products and services to you when you visit or order at BigMart Gourmet, use BigMart Gourmet cooking/ordering services, use BigMart Gourmet applications for mobile, or use software provided by BigMart Gourmet in connection with any of the foregoing (collectively, "BigMart Gourmet Services"). BigMart Gourmet provides the BigMart Gourmet Services subject to the following Conditions of Use.
          </p>

          <p className="font-bold text-[17px]">
            By using BigMart Gourmet Services, you agree to these conditions. Please read them carefully.
          </p>

          <p>
            We offer a wide range of BigMart Gourmet Services, and sometimes additional terms may apply. When you use a BigMart Gourmet Service (for example, Your Profile, Gift Cards, or Order Tracking) you also will be subject to the guidelines, terms and agreements applicable to that BigMart Gourmet Service ("Service Terms"). If these Conditions of Use are inconsistent with the Service Terms, those Service Terms will control.
          </p>

          <div>
            <h2 className="text-[17px] font-bold mb-2">PRIVACY</h2>
            <p>
              Please review our <Link to="/privacy" className="text-[#007185] hover:text-[#c40000] hover:underline">Privacy Notice</Link>, which also governs your use of BigMart Gourmet Services, to understand our practices.
            </p>
          </div>

          <div>
            <h2 className="text-[17px] font-bold mb-2">ELECTRONIC COMMUNICATIONS</h2>
            <p>
              When you use BigMart Gourmet Services, or send e-mails, text messages, and other communications from your desktop or mobile device to us, you may be communicating with us electronically. You consent to receive communications from us electronically, such as e-mails, texts, mobile push notices, or notices and messages on this site or through the other BigMart Gourmet Services.
            </p>
          </div>

          <div>
            <h2 className="text-[17px] font-bold mb-2">COPYRIGHT</h2>
            <p>
              All content included in or made available through any BigMart Gourmet Service, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software is the property of BigMart Gourmet or its content suppliers and protected by India and international copyright laws.
            </p>
          </div>
          
          <div>
            <h2 className="text-[17px] font-bold mb-2">YOUR ACCOUNT</h2>
            <p>
              You may need your own BigMart Gourmet account to use certain BigMart Gourmet Services, and you may be required to be logged in to the account and have a valid payment method associated with it. If there is a problem charging your selected payment method, we may charge any other valid payment method associated with your account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account, and you agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (type) {
      case 'about': return <Info size={32} className="text-[#15803d]" />;
      case 'legal': return <ShieldCheck size={32} className="text-gray-800" />;
      case 'shipping': return <Truck size={32} className="text-blue-500" />;
      case 'returns': return <RotateCcw size={32} className="text-red-500" />;
      case 'size': return <Ruler size={32} className="text-blue-500" />;
      case 'privacy': return <Lock size={32} className="text-emerald-500" />;
      case 'terms': return <FileText size={32} className="text-indigo-500" />;
      case 'cookies': return <Cookie size={32} className="text-amber-500" />;
    }
  };

  const getIntro = () => {
    switch (type) {
      case 'privacy': return "We take your privacy seriously. This policy describes how BigMart Gourmet collects, uses, and protects your personal information.";
      case 'terms': return "These Terms & Conditions govern your use of our platform and services. By using BigMart Gourmet, you agree to comply with these terms.";
      case 'cookies': return "This Cookie Policy explains how we use cookies and similar technologies to recognize you when you visit our website.";
      default: return "Welcome to BigMart Gourmet, India's premier food ordering and gourmet culinary destination. Our mission is to provide an unparalleled gourmet dining experience.";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-12 animate-fade-in">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          {getIcon()}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 uppercase tracking-tighter text-center italic">{title}</h1>
        <div className="mt-2 w-20 h-1.5 bg-[#15803d] rounded-full"></div>
      </div>

      <div className="bg-white border rounded-3xl p-8 sm:p-12 shadow-sm prose prose-orange max-w-none animate-in fade-in duration-500">
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-widest border-b pb-2">Overview</h2>
          <p className="text-gray-600 leading-relaxed font-medium">
            {getIntro()}
          </p>
        </section>

        {type === 'size' ? (
          <section className="mb-10">
            <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-widest border-b pb-2">Apparel Size Guide</h2>
            <div className="overflow-x-auto border rounded-xl mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="p-4 border-r">Size (INT)</th>
                    <th className="p-4 border-r">Chest (Inches)</th>
                    <th className="p-4">Waist (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold text-gray-700">
                  <tr><td className="p-4 border-r">S</td><td className="p-4 border-r">36 - 38</td><td className="p-4">30 - 32</td></tr>
                  <tr><td className="p-4 border-r">M</td><td className="p-4 border-r">38 - 40</td><td className="p-4">32 - 34</td></tr>
                  <tr><td className="p-4 border-r">L</td><td className="p-4 border-r">40 - 42</td><td className="p-4">34 - 36</td></tr>
                  <tr><td className="p-4 border-r">XL</td><td className="p-4 border-r">42 - 44</td><td className="p-4">36 - 38</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 italic">* Measurements may vary slightly by brand.</p>
          </section>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-widest border-b pb-2">Core Principles</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-bold mb-2 uppercase text-[10px] text-[#15803d] tracking-widest">Trust & Safety</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">We prioritize our users' data security above all else, ensuring transparency and reliability in every single interaction.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-bold mb-2 uppercase text-[10px] text-[#15803d] tracking-widest">Innovation</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">We continuously leverage cutting-edge AI and logistics tech to make shopping faster, smarter, and safer for Indians.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-widest border-b pb-2">Commitment</h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                Our operations strictly adhere to the latest E-commerce guidelines issued by the Government of India. We believe in an open, fair, and competitive marketplace.
              </p>
              <div className="space-y-4">
                 {[
                   "Secure 256-bit SSL encrypted transactions.",
                   "Transparent pricing with no hidden charges.",
                   "Environmentally conscious packaging initiatives.",
                   "Zero-tolerance policy for counterfeit goods."
                 ].map((text, i) => (
                   <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#15803d] rounded-full mt-1.5"></div>
                      <p className="text-sm font-bold text-gray-600">{text}</p>
                   </div>
                 ))}
              </div>
            </section>
          </>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center">
           <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-4">Still have questions?</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button onClick={() => navigate('/help')} className="bg-white border-2 border-blue-100 text-gray-800 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/50 transition-all shadow-sm">View Full FAQ</button>
             <button onClick={() => navigate('/contact')} className="bg-[#15803d] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#166534] transition-all">Contact Us</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StaticInfo;