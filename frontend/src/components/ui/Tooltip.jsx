import { useState, useRef, useEffect } from 'react';

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrows = {
  top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent',
  left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent',
  right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent',
};

const Tooltip = ({
  content,
  children,
  position = 'top',
  className = '',
  delay = 0,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50
            ${positions[position]}
            ${className}
          `.trim()}
          role="tooltip"
        >
          <div className="bg-gray-700 text-white text-sm rounded py-1 px-2 max-w-xs">
            {content}
          </div>
          <div
            className={`
              absolute border-[6px]
              ${arrows[position]}
            `.trim()}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip; 