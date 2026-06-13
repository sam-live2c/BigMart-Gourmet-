
import React from 'react';

export interface SpecificationGroup {
  title: string;
  specs: Record<string, string>;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  helpfulCount: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  description: string;
  brand: string;
  brandLogo?: string;
  specGroups: SpecificationGroup[];
  highlights: string[];
  isAssured?: boolean;
  stock: number;
  weightInGrams: number;
  sellerName: string;
  sellerRating: number;
  returnPolicy: string;
  badges?: string[];
  prepTime?: string;
}

export interface CartItem extends Product {
  quantity: number;
  kgQuantity?: number;
  gmQuantity?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode | string;
  image: string;
}

export interface Address {
  id: string;
  type: string;
  name: string;
  phone: string;
  pincode: string;
  villCity: string;
  state: string;
  district: string;
  country: string;
  countryCode: string;
  isDefault: boolean;
  areaColony?: string;
  landmark?: string;
}

export interface User {
  name: string;
  email: string;
  address: string;
  addresses?: Address[];
  orders: Order[];
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
  createdAt?: number;
}
