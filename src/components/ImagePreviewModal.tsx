import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Copy, Check, X, Maximize } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface ImagePreviewModalProps {
  image: string | null;
  onClose: () => void;
  lang: Language;
}

export default function ImagePreviewModal({ image, onClose, lang }: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  // Initialize view: fit to screen or original
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      img.src = image;
    }
  }, [image]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.05), 10);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Center zoom relative to mouse position
    const mouseX = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

    setZoom(newZoom);
    setPan({
      x: (e.clientX - rect.left - rect.width / 2) - mouseX * newZoom,
      y: (e.clientY - rect.top - rect.height / 2) - mouseY * newZoom
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking buttons, don't start pan
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan(prev => ({
      x: prev.x + (e.clientX - lastMousePos.x),
      y: prev.y + (e.clientY - lastMousePos.y)
    }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `storyboard-item-${Date.now()}.png`;
    link.click();
  };

  const resetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/70 dark:bg-black/80 backdrop-blur-md overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={onClose}
      >
        {/* Interaction Layer */}
        <div 
          ref={containerRef}
          className="flex-1 w-full flex items-center justify-center relative cursor-move"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: pan.x,
              y: pan.y,
              scaleX: zoom,
              scaleY: zoom
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
            src={image}
            alt="preview"
            className="max-w-none shadow-[0_40px_100px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-lg pointer-events-none"
            style={{ 
              width: imgDims.w ? `${imgDims.w}px` : 'auto',
              height: imgDims.h ? `${imgDims.h}px` : 'auto'
            }}
          />
        </div>

        {/* Footer Actions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-20 flex items-center justify-center gap-4 px-8 pb-4 shrink-0 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={resetView}
            className="p-3 bg-white dark:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full shadow-lg pointer-events-auto transition-all border border-gray-100 dark:border-white/5 active:scale-95"
          >
            <Maximize size={20} />
          </button>

          <div className="h-10 w-[1px] bg-gray-200 dark:bg-white/10 mx-2" />

          <button 
            onClick={handleDownload}
            className="px-8 h-12 bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full text-[14px] font-bold shadow-xl shadow-blue-500/20 pointer-events-auto flex items-center gap-2 active:scale-95 transition-all"
          >
            <Download size={18} />
            {t.download}
          </button>

          <button 
            onClick={handleCopy}
            className={`px-8 h-12 rounded-full text-[14px] font-bold shadow-xl pointer-events-auto flex items-center gap-2 active:scale-95 transition-all border w-[180px] justify-center ${
              isCopied 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'bg-white dark:bg-white/10 text-[#1d1d1f] dark:text-white border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/20'
            }`}
          >
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
            {isCopied ? t.copied : t.copy}
          </button>
        </motion.div>

        {/* Top Close Button */}
        <div className="absolute top-8 right-8 pointer-events-none">
          <button 
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all pointer-events-auto active:scale-95"
          >
            <X size={24} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
