import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 10);

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY + 5 && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 5 || currentScrollY <= 50) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;

      // Show navigation when scrolling stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // 1.5 seconds after stopping scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return { isVisible, isScrolled };
}
