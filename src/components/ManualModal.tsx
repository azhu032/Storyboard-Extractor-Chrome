import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export default function ManualModal({ isOpen, onClose, lang, onLangChange }: ManualModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const lastWheelTime = React.useRef(0);
  const t = TRANSLATIONS[lang];
  const manual = (t as any).manualModal;

  if (!manual) return null;

  const totalPages = manual.pages.length;

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 400) return;

    if (e.deltaY > 50) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
        lastWheelTime.current = now;
      }
    } else if (e.deltaY < -50) {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
        lastWheelTime.current = now;
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[201]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onWheel={handleWheel}
              className="bg-white dark:bg-[#1c1c1e] w-[90%] max-w-2xl h-[500px] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-[#d2d2d7] dark:border-[#333333] flex flex-col overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="h-[60px] border-b border-[#d2d2d7] dark:border-[#333333] flex items-center justify-between px-6 shrink-0 relative">
                <div className="flex items-center gap-3">
                  <HelpCircle size={20} className="text-[#0071e3]" />
                  <h2 className="text-[17px] font-semibold tracking-tight">{manual.title}</h2>
                </div>

                {/* Internal Language Switcher - Top Center */}
                <div className="absolute left-1/2 -translate-x-1/2 flex bg-gray-100 dark:bg-white/5 rounded-full p-1 text-[11px]">
                  {(['zh', 'en', 'jp'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => onLangChange(l)}
                      className={`px-3 py-1 rounded-full transition-all ${
                        lang === l
                          ? 'bg-white dark:bg-white/10 shadow-sm text-[#1d1d1f] dark:text-white font-bold'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                      }`}
                    >
                      {TRANSLATIONS[l].lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${lang}-${currentPage}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 p-8 overflow-y-auto"
                  >
                    <h3 className="text-xl font-bold mb-6 text-[#1d1d1f] dark:text-white">
                      {manual.pages[currentPage].title}
                    </h3>
                    <ul className="space-y-4">
                      {manual.pages[currentPage].content.map((item: string, idx: number) => (
                        <li key={idx} className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer / Pagination */}
              <div className="h-[64px] border-t border-[#d2d2d7] dark:border-[#333333] flex items-center justify-between px-8 shrink-0">
                <div className="flex gap-2">
                  {manual.pages.map((_: any, idx: number) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentPage ? 'w-8 bg-[#0071e3]' : 'w-2 bg-gray-200 dark:bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-[#d2d2d7] dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={16} />
                    {manual.prev}
                  </button>
                  <button
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg shadow-blue-500/10"
                  >
                    {manual.next}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
