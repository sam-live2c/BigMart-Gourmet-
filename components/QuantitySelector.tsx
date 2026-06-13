import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  formatOption?: (val: number) => React.ReactNode;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  size = 'md',
  label,
  formatOption
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const options = [];
  for (let i = min; i <= max; i++) {
    options.push(i);
  }

  const heights = {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10'
  };

  const textSizes = {
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15
  };
  
  const minWidths = {
    sm: 'min-w-[112px]',
    md: 'min-w-[125px]',
    lg: 'min-w-[135px]'
  };

  const displayValue = formatOption ? formatOption : (val: number) => val;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen && 
        buttonRef.current && 
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = (e: Event) => {
       if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
           setIsOpen(false);
       }
    };
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let top = rect.bottom + window.scrollY;
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const expectedHeight = Math.min(options.length * 36 + 10, 200); 
      
      if (spaceBelow < expectedHeight && rect.top > expectedHeight) {
         top = rect.top + window.scrollY - expectedHeight - 10;
      } else {
         top = top + 4; // slight margin
      }
      
      setDropdownStyle({
        top: top + 'px',
        left: (rect.left + window.scrollX) + 'px',
        width: Math.max(rect.width, 100) + 'px',
      });
    }
    setIsOpen(!isOpen);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <>
      <div 
        ref={buttonRef}
        className={`inline-flex items-center w-full justify-between border border-gray-300 rounded-lg bg-gray-50/50 shadow-sm overflow-hidden select-none ${heights[size]} ${minWidths[size]}`}
        id="quantity-stepper-container"
      >
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= min}
          className="flex items-center justify-center shrink-0 w-7 h-full transition bg-white border-r border-gray-200 hover:bg-gray-100 active:scale-90 text-gray-700 disabled:opacity-35 disabled:bg-transparent disabled:pointer-events-none"
          id="quantity-stepper-decrement"
          title="Decrease"
        >
          <Minus size={iconSizes[size]} strokeWidth={3} />
        </button>

        {/* Center Display / Toggle Trigger */}
        <div 
          onClick={toggleDropdown}
          className={`flex-1 flex items-center justify-center px-1 h-full cursor-pointer hover:bg-white transition text-center min-w-[34px] ${textSizes[size]}`}
          id="quantity-stepper-display"
          title="Click to select value"
        >
          {label && <span className="text-gray-500 font-normal mr-0.5">{label}:</span>}
          <span className="text-gray-900 font-bold whitespace-nowrap">{displayValue(quantity)}</span>
          <ChevronDown size={10} className="text-gray-400 ml-0.5 shrink-0" />
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= max}
          className="flex items-center justify-center shrink-0 w-7 h-full transition bg-white border-l border-gray-200 hover:bg-gray-100 active:scale-90 text-gray-700 disabled:opacity-35 disabled:bg-transparent disabled:pointer-events-none"
          id="quantity-stepper-increment"
          title="Increase"
        >
          <Plus size={iconSizes[size]} strokeWidth={3} />
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[220px] overflow-y-auto py-1 shadow-[0_4px_12px_rgba(0,0,0,0.15)] no-scrollbar"
        >
          {options.map(n => (
            <div 
              key={n} 
              onClick={() => {
                onQuantityChange(n);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-center text-sm hover:bg-[#F0F2F2] whitespace-nowrap ${n === quantity ? 'bg-[#ffd814] font-semibold text-gray-900' : 'text-gray-700'}`}
            >
              {displayValue(n)}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default QuantitySelector;
