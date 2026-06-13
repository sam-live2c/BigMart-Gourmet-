
import React from 'react';
import { Mail } from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <Mail size={40} className="text-amber-600" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">Need Help?</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Our support team is available via email to assist you with your orders and questions.
      </p>
      <a 
        href="mailto:support@bigmart.gourmet" 
        className="bg-neutral-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-neutral-800 transition-colors shadow-lg"
      >
        <Mail size={24} />
        Email Support
      </a>
    </div>
  );
};

export default HelpCenter;
