
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Twitter, Facebook, Instagram } from 'lucide-react';

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-4">Get In Touch</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">We'd love to hear from you. Whether you have a question about products, shipping, or anything else, our team is ready to answer all your questions.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white border rounded-3xl p-8 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Contact Information</h2>
             
             <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Call Us</p>
                      <p className="text-sm font-bold text-gray-800">+91 33 2212 0000</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-blue-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <Mail size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Support</p>
                      <p className="text-sm font-bold text-gray-800">support@bigmart.in</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Headquarters</p>
                      <p className="text-sm font-bold text-gray-800 leading-relaxed">Park Street Mansion, 18 Park Street, Kolkata, WB - 700016</p>
                   </div>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Follow Us</p>
                <div className="flex gap-4">
                   <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#15803d] hover:text-white transition-all text-gray-400">
                      <Facebook size={18} />
                   </button>
                   <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all text-gray-400">
                      <Twitter size={18} />
                   </button>
                   <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all text-gray-400">
                      <Instagram size={18} />
                   </button>
                </div>
             </div>
          </div>

          <div className="bg-[#1a1a3a] text-white rounded-3xl p-8 flex items-center justify-between group cursor-pointer overflow-hidden">
             <div>
                <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-2">Live Support</p>
                <h3 className="text-lg font-bold">Start Live Chat</h3>
             </div>
             <MessageCircle size={32} className="text-[#15803d] group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-300">
               <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Send size={40} />
               </div>
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Message Sent!</h2>
               <p className="text-gray-500 text-sm mb-8">Thank you for reaching out. We'll get back to you within 24 hours.</p>
               <button onClick={() => setSent(false)} className="text-[#15803d] font-bold text-sm uppercase tracking-widest underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                     <input type="text" placeholder="e.g. Rahul Sharma" required className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                     <input type="email" placeholder="rahul@example.com" required className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Subject</label>
                  <select className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm">
                     <option>Order Inquiry</option>
                     <option>Return/Exchange Request</option>
                     <option>Feedback/Suggestions</option>
                     <option>Other</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Message</label>
                  <textarea rows={5} placeholder="How can we help you?" required className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm resize-none"></textarea>
               </div>
               <button type="submit" className="w-full bg-[#15803d] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#166534] transition-all active:scale-95 flex items-center justify-center gap-3">
                  Send Message <Send size={18} />
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;