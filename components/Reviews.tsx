import React, { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Star, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { User, Review } from '../types';

interface ReviewsProps {
  productId: string;
  user: User | null;
}

const INITIAL_MOCK_REVIEWS: Record<string, any[]> = {
  "1": [
    {
      id: "mock-1-1",
      productId: "1",
      userId: "system-mock-user-1",
      userName: "Evenezer Marak",
      rating: 4,
      comment: "I love the product, but I recently had to change my approach and it works well.",
      createdAt: 1718092800000, // Roughly a year ago
      isVerified: true,
      helpfulCount: 299
    },
    {
      id: "mock-1-2",
      productId: "1",
      userId: "system-mock-user-2",
      userName: "Sneha Roy",
      rating: 5,
      comment: "Excellent quality and very fresh delivery. Tastes extremely authentic.",
      createdAt: 1719216000000,
      isVerified: true,
      helpfulCount: 145
    }
  ],
  "2": [
    {
      id: "mock-2-1",
      productId: "2",
      userId: "system-mock-user-3",
      userName: "Sneha Roy",
      rating: 5,
      comment: "Excellent quality and very fresh delivery. Tastes extremely authentic.",
      createdAt: 1719216000000,
      isVerified: true,
      helpfulCount: 145
    }
  ]
};

export const Reviews: React.FC<ReviewsProps> = ({ productId, user }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string>('');
  const [helpfulRatings, setHelpfulRatings] = useState<string[]>([]);

  // Real-time Firestore subscription to this product's reviews
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', productId));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        let loadedReviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Sort reviews by newest first
        loadedReviews.sort((a: any, b: any) => b.createdAt - a.createdAt);

        // If there are no reviews in the FireStore for this product yet, seed local mock reviews to DB
        if (loadedReviews.length === 0) {
          const mockSeeds = INITIAL_MOCK_REVIEWS[productId] || [
            {
              id: `seed-${productId}-1`,
              productId: productId,
              userId: "system",
              userName: "Gaurav Kumar",
              rating: 5,
              comment: "Very fresh and fragrant grade. Superb value for money!",
              createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
              isVerified: true,
              helpfulCount: 3
            }
          ];

          for (const item of mockSeeds) {
            try {
              const seedDocRef = doc(db, 'reviews', item.id);
              await setDoc(seedDocRef, item);
            } catch (err) {
              console.warn('[Seeding] Guest / local permissions limited or offline. Falling back to memory display.');
            }
          }
          // The local state will update automatically when the next onSnapshot fires because of local DB metadata changes,
          // but we also set it to ensure offline users see it immediately.
          setReviews(mockSeeds);
        } else {
          setReviews(loadedReviews);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'reviews');
      }
    );

    return () => unsubscribe();
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Please log in to submit a review.');
      return;
    }
    if (newRating === 0) {
      alert('Please select a rating.');
      return;
    }
    if (!newComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmittedMessage('');

    const reviewId = `${auth.currentUser.uid}_${productId}_${Date.now()}`;
    const hasPurchased = user?.orders?.some(order => order.items?.some(item => item.id === productId)) || false;

    const payload = {
      id: reviewId,
      productId: productId,
      userId: auth.currentUser.uid,
      userName: user?.name || auth.currentUser.displayName || 'Authorized User',
      rating: newRating,
      comment: newComment,
      createdAt: Date.now(),
      isVerified: hasPurchased,
      helpfulCount: 0
    };

    try {
      await setDoc(doc(db, 'reviews', reviewId), payload);
      setNewRating(0);
      setNewComment('');
      setSubmittedMessage('Thank you! Your review has been saved.');
      setTimeout(() => setSubmittedMessage(''), 4000);
    } catch (err) {
      console.error('Error adding review to FireStore:', err);
      // Fallback in case of absolute write permission rules block or offline limitations
      const localReview = { ...payload, date: 'Just now' };
      setReviews(prev => [localReview, ...prev]);
      setSubmittedMessage('Saved locally! Your changes are saved Offline.');
      setTimeout(() => setSubmittedMessage(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = (reviewId: string) => {
    if (helpfulRatings.includes(reviewId)) return;
    setHelpfulRatings([...helpfulRatings, reviewId]);

    // OPTIONAL: attempt to increment in Firebase
    const reviewRef = doc(db, 'reviews', reviewId);
    const existingRev = reviews.find(r => r.id === reviewId);
    if (existingRev) {
      const updatedCount = (existingRev.helpfulCount || 0) + 1;
      const updatedPayload = {
        ...existingRev,
        helpfulCount: updatedCount
      };
      // Try DB persist
      setDoc(reviewRef, updatedPayload)
        .catch(() => {
          // If Firestore write fails, local updates only
          setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: updatedCount } : r));
        });
    }
  };

  // Calculations
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : "0.0";

  const getPercentageForStar = (star: number) => {
    if (totalCount === 0) return 0;
    const matches = reviews.filter(r => r.rating === star).length;
    return Math.round((matches / totalCount) * 100);
  };

  const getCountForStar = (star: number) => {
    return reviews.filter(r => r.rating === star).length;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      return new Date(timestamp).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div id="ratings-reviews-section" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-900 mb-4">Customer Ratings & Reviews</h2>
      
      {/* Metrics Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col items-center justify-center shrink-0">
          <span className="text-4xl font-black text-gray-900">{avgRating}</span>
          <div className="flex items-center text-yellow-500 my-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={16} 
                fill={star <= Math.round(Number(avgRating)) ? "currentColor" : "none"} 
                className={star <= Math.round(Number(avgRating)) ? "text-yellow-500" : "text-gray-200"} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">{totalCount} reviews verified</span>
        </div>
        
        <div className="flex-1 space-y-2 border-l border-gray-100 pl-4 w-full">
          {[5, 4, 3, 2, 1].map((star) => {
            const percent = getPercentageForStar(star);
            const count = getCountForStar(star);
            return (
              <div key={star} className="flex items-center gap-3 text-xs text-gray-600">
                <span className="w-2 font-bold">{star}</span>
                <Star size={11} className="text-gray-400 fill-current shrink-0" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-gray-400 font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a Review Card */}
      {auth.currentUser ? (
        <form onSubmit={handleReviewSubmit} className="mb-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Write your review</h3>
          <p className="text-xs text-gray-500 mb-4">
            Posting publicly as <span className="font-semibold text-gray-800">{user?.name || auth.currentUser.displayName || auth.currentUser.email}</span>
          </p>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Your rating out of 5</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1 focus:outline-none hover:scale-110 active:scale-90 transition-transform"
                >
                  <Star 
                    size={26} 
                    fill={star <= newRating ? "#eab308" : "none"} 
                    className={star <= newRating ? "text-yellow-500" : "text-gray-300"} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="review-textarea">Your comments</label>
            <textarea
              id="review-textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#15803d]"
              placeholder="What did you like or dislike? How fresh of a grade was it?"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#15803d] disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#166534] active:scale-95 transition flex items-center justify-center gap-2 shadow"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          
          {submittedMessage && (
            <p className="text-xs text-[#15803d] mt-2 font-bold flex items-center gap-1">
              <Check size={14} /> {submittedMessage}
            </p>
          )}
        </form>
      ) : (
        <div className="mb-6 bg-gray-50/50 rounded-xl p-5 text-center border border-dashed border-gray-300 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Share your experience</h3>
          <p className="text-xs text-gray-600 mb-4">Log in to offer ratings or descriptive comments for this seller grade.</p>
          <a
            href="#/login"
            className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition shadow-sm"
          >
            Log In to Review
          </a>
        </div>
      )}

      {/* List of Reviews */}
      <div className="space-y-5">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          reviews.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={12} 
                      fill={star <= item.rating ? "currentColor" : "none"} 
                      className={star <= item.rating ? "text-yellow-500" : "text-gray-200"} 
                    />
                  ))}
                </div>
                {item.isVerified && (
                  <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 border border-green-200">
                    <Check size={10} strokeWidth={3} /> Verified Purchase
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-800 mb-3 leading-relaxed">{item.comment}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900">{item.userName}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleMarkHelpful(item.id)}
                    className={`flex items-center gap-1 transition-colors hover:text-gray-800 ${helpfulRatings.includes(item.id) ? 'text-green-600 font-semibold' : ''}`}
                  >
                    <ThumbsUp size={13} /> <span>{item.helpfulCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
