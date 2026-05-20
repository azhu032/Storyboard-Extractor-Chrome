import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  key?: React.Key;
}

export default function Tooltip({ content, children, delay = 250, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, showAbove: false });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // If there is less than 80px space below, display tooltip above
    const above = windowHeight - rect.bottom < 80;
    
    // Center alignment horizontally
    const leftVal = rect.left + rect.width / 2;
    // Sit above or below
    const topVal = above ? rect.top - 6 : rect.bottom + 6;

    setCoords({
      top: topVal,
      left: leftVal,
      showAbove: above
    });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Re-calculate position on window scroll/resize if tooltip is currently visible
  useEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => {
      calculatePosition();
    };

    // Use capturing (capture: true) to capture scroll events from ANY scrollable container on the page
    window.addEventListener('scroll', handleUpdate, { capture: true, passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate, { capture: true });
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className || ''}`}
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && content && (
            <motion.div
              key="tooltip"
              initial={{ 
                opacity: 0, 
                scale: 0.95, 
                x: '-50%', 
                y: coords.showAbove ? '-90%' : '-10%' 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: '-50%', 
                y: coords.showAbove ? '-100%' : '0%' 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95, 
                x: '-50%', 
                y: coords.showAbove ? '-95%' : '-5%' 
              }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                pointerEvents: 'none',
                transformOrigin: coords.showAbove ? 'bottom center' : 'top center',
              }}
              className="z-[99999] pointer-events-none px-2.5 py-1.5 bg-zinc-900/95 dark:bg-zinc-800/95 text-white text-[10px] font-semibold rounded-lg shadow-2xl whitespace-nowrap border border-white/10 backdrop-blur-md"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
