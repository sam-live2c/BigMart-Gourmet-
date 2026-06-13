import React from 'react';
import { Beef, Pizza, Soup, Cake } from 'lucide-react';
import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  { 
    id: 'burgers', 
    name: 'Burgers', 
    icon: <Beef className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-amber-600 stroke-[1.6]" />, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' 
  },
  { 
    id: 'pizzas', 
    name: 'Pizzas', 
    icon: <Pizza className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-orange-600 stroke-[1.6]" />, 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' 
  },
  { 
    id: 'appetizers', 
    name: 'Appetizers', 
    icon: <Soup className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-green-600 stroke-[1.6]" />, 
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=200&q=80' 
  },
  { 
    id: 'desserts', 
    name: 'Desserts', 
    icon: <Cake className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] text-pink-600 stroke-[1.6]" />, 
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80' 
  }
];

export const CATEGORY_METADATA: Record<string, {
  budgetFilters: number[];
  brands: string[];
  groups: { name: string; items: string[] }[];
}> = {
  foryou: {
    budgetFilters: [5, 10, 15, 25],
    brands: ['Gourmet Kitchen', 'Artisan Oven', 'Sweet Retreat', 'The Steakhouse'],
    groups: [
      { name: 'Trending', items: ['Artisan Smoked Cheeseburger', 'Truffle-Infused Mushroom Pizza', 'Gourmet Chocolate Lava Cake'] }
    ]
  },
  burgers: {
    budgetFilters: [5, 10, 15],
    brands: ['Gourmet Kitchen', 'Burger Craft'],
    groups: [
      { name: 'Types', items: ['Artisan Smoked Cheeseburger', 'BBQ Pulled Pork Burger'] }
    ]
  },
  pizzas: {
    budgetFilters: [10, 15, 20],
    brands: ['Artisan Oven', 'Bella Italia'],
    groups: [
      { name: 'Types', items: ['Truffle-Infused Mushroom Pizza', 'Classic Pepperoni Pizza'] }
    ]
  },
  appetizers: {
    budgetFilters: [5, 12, 20],
    brands: ['Bites & Wings', 'The Steakhouse', 'Green Life'],
    groups: [
      { name: 'Types', items: ['Crispy Buffalo Chicken Wings', 'Garlic Butter Searing Steak', 'Avocado Green Salad'] }
    ]
  },
  desserts: {
    budgetFilters: [5, 10],
    brands: ['Sweet Retreat', 'Pastry Chef'],
    groups: [
      { name: 'Types', items: ['Gourmet Chocolate Lava Cake'] }
    ]
  }
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Artisan Smoked Cheeseburger',
    category: 'burgers',
    subCategory: 'Gourmet',
    price: 14.99,
    oldPrice: 19.99,
    discount: '25% OFF',
    rating: 4.9,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'Thick beef brisket patty with smoked cheddar, caramelized onions, house truffle aioli, on a toasted brioche bun.',
    brand: 'Gourmet Kitchen',
    highlights: ['Prime Beef Brisket', 'House Truffle Aioli', 'Aged Smoked Cheddar', 'Brioche Bun'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '750 kcal', Protein: '42g', Carbs: '48g' } }],
    isAssured: true,
    stock: 45,
    weightInGrams: 0,
    sellerName: 'Smoked & Co.',
    sellerRating: 4.9,
    returnPolicy: 'Instant Replacement',
    badges: ['BEST SELLER', 'GOURMET'],
    prepTime: '12 mins'
  },
  {
    id: '2',
    name: 'Truffle-Infused Mushroom Pizza',
    category: 'pizzas',
    subCategory: 'Artisan',
    price: 18.99,
    oldPrice: 24.99,
    discount: '24% OFF',
    rating: 4.8,
    reviewsCount: 218,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Wild forest mushrooms, creamy ricotta, fresh mozzarella, truffle oil, and fresh rosemary on a crispy crust.',
    brand: 'Artisan Oven',
    highlights: ['Truffle Oil', 'Wild Mushrooms', 'Hand-Stretched Crust'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '980 kcal', Protein: '32g', Carbs: '120g' } }],
    isAssured: true,
    stock: 30,
    weightInGrams: 0,
    sellerName: 'Bella Italia',
    sellerRating: 4.8,
    returnPolicy: 'Instant Replacement',
    badges: ['VEGETARIAN', 'TRUFFLE-INFUSED'],
    prepTime: '15 mins'
  },
  {
    id: '3',
    name: 'Crispy Buffalo Chicken Wings',
    category: 'appetizers',
    subCategory: 'Sides',
    price: 9.99,
    oldPrice: 12.99,
    discount: '23% OFF',
    rating: 4.7,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Jumbo chicken wings tossed in our signature spicy buffalo sauce, served with celery sticks and house blue cheese dip.',
    brand: 'Bites & Wings',
    highlights: ['Signature Buffalo Sauce', 'Crispy Skin', 'House Blue Cheese Dip'],
    specGroups: [{ title: 'Details', specs: { Spice: 'Hot', Portion: '8 pcs' } }],
    isAssured: true,
    stock: 100,
    weightInGrams: 0,
    sellerName: 'The Wing Joint',
    sellerRating: 4.7,
    returnPolicy: 'Instant Replacement',
    badges: ['SPICY', 'CRISPY'],
    prepTime: '8 mins'
  },
  {
    id: '4',
    name: 'Gourmet Chocolate Lava Cake',
    category: 'desserts',
    subCategory: 'Sweet',
    price: 7.99,
    oldPrice: 9.99,
    discount: '20% OFF',
    rating: 4.9,
    reviewsCount: 421,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Rich Belgian chocolate cake with a warm molten chocolate center, served with a scoop of Madagascar vanilla bean ice cream.',
    brand: 'Sweet Retreat',
    highlights: ['Belgian Chocolate', 'Molten Center', 'Vanilla Bean Ice Cream'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '520 kcal', Protein: '8g', Sugar: '45g' } }],
    isAssured: true,
    stock: 50,
    weightInGrams: 0,
    sellerName: 'Pastry Chef',
    sellerRating: 4.9,
    returnPolicy: 'Instant Replacement',
    badges: ['BEST SELLER', 'WARM & SWEET'],
    prepTime: '10 mins'
  },
  {
    id: '5',
    name: 'Garlic Butter Searing Steak',
    category: 'appetizers',
    subCategory: 'Gourmet',
    price: 24.99,
    oldPrice: 29.99,
    discount: '16% OFF',
    rating: 4.8,
    reviewsCount: 188,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'USDA Prime New York Strip steak pan-seared in rich garlic butter, fresh rosemary, and served with roasted baby potatoes.',
    brand: 'The Steakhouse',
    highlights: ['USDA Prime beef', 'Pan-seared Garlic Butter', 'Baby Potatoes'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '850 kcal', Protein: '62g', Fat: '45g' } }],
    isAssured: true,
    stock: 25,
    weightInGrams: 0,
    sellerName: 'Smoked & Co.',
    sellerRating: 4.9,
    returnPolicy: 'Instant Replacement',
    badges: ['POPULAR', 'PRIME MEAT'],
    prepTime: '18 mins'
  },
  {
    id: '6',
    name: 'Avocado Green Salad',
    category: 'appetizers',
    subCategory: 'Healthy',
    price: 11.99,
    oldPrice: 14.99,
    discount: '20% OFF',
    rating: 4.6,
    reviewsCount: 92,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fresh Haas avocados, organic baby spinach, crisp cucumbers, cherry tomatoes, and shaved parmesan, tossed in lemon vinaigrette.',
    brand: 'Green Life',
    highlights: ['Organic Haas Avocados', 'Baby Spinach', 'Lemon Vinaigrette'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '280 kcal', Protein: '6g', Fiber: '12g' } }],
    isAssured: true,
    stock: 40,
    weightInGrams: 0,
    sellerName: 'Local Farms',
    sellerRating: 4.5,
    returnPolicy: 'Instant Replacement',
    badges: ['VEGETARIAN', 'HEALTHY'],
    prepTime: '6 mins'
  },
  {
    id: '7',
    name: 'Classic Pepperoni Pizza',
    category: 'pizzas',
    subCategory: 'Artisan',
    price: 16.99,
    oldPrice: 21.99,
    discount: '22% OFF',
    rating: 4.9,
    reviewsCount: 388,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Spicy Italian pepperoni, aged mozzarella cheese, and our house-cooked San Marzano tomato marinara sauce.',
    brand: 'Artisan Oven',
    highlights: ['Spicy Italian Pepperoni', 'San Marzano Sauce', 'Aged Mozzarella'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '1120 kcal', Protein: '48g', Carbs: '130g' } }],
    isAssured: true,
    stock: 65,
    weightInGrams: 0,
    sellerName: 'Bella Italia',
    sellerRating: 4.8,
    returnPolicy: 'Instant Replacement',
    badges: ['BEST SELLER', 'CLASSIC'],
    prepTime: '14 mins'
  },
  {
    id: '8',
    name: 'BBQ Pulled Pork Burger',
    category: 'burgers',
    subCategory: 'Gourmet',
    price: 15.49,
    oldPrice: 18.99,
    discount: '18% OFF',
    rating: 4.7,
    reviewsCount: 172,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
    ],
    description: '12-hour slow smoked tender pulled pork shoulder, smothered in hickory tangy BBQ sauce, and topped with crunchy apple slaw.',
    brand: 'Gourmet Kitchen',
    highlights: ['12-Hour Slow Smoked', 'Hickory BBQ Sauce', 'Apple Slaw'],
    specGroups: [{ title: 'Nutrition', specs: { Calories: '810 kcal', Protein: '38g', Fat: '35g' } }],
    isAssured: true,
    stock: 35,
    weightInGrams: 0,
    sellerName: 'Smoked & Co.',
    sellerRating: 4.9,
    returnPolicy: 'Instant Replacement',
    badges: ['SMOKED', 'POPULAR'],
    prepTime: '13 mins'
  }
];
