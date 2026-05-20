import React from 'react';
import { motion } from 'motion/react';

export default function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  if (size === 'sm') {
    return (
      <div className="relative w-7 h-7 flex items-center justify-center overflow-hidden">
        <div className="w-6 h-6 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-gray-200/50 dark:border-white/10 relative overflow-hidden p-0.5 flex flex-col justify-center">
          <div className="grid grid-cols-3 gap-[1.5px] px-0.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="relative w-full aspect-[4/3]">
                {i === 2 ? (
                  <div className="w-full h-full bg-blue-500 rounded-[1px] shadow-[0_1px_3px_rgba(59,130,246,0.5)] z-10 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-white/5 rounded-[1px]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <motion.div 
        className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/5 relative overflow-hidden p-2 flex flex-col justify-center"
        initial={{ y: 20, rotateX: 20, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid grid-cols-3 gap-0.5 px-1.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="relative">
              {i === 2 ? (
                <motion.div 
                  className="w-full aspect-[4/3] bg-blue-500 rounded-sm shadow-[0_4px_12px_rgba(59,130,246,0.4)] z-10 relative overflow-hidden"
                  animate={{ 
                    y: [-2, -6, -2],
                    rotateY: [0, 5, 0],
                    rotateX: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  {/* Sheen effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full"
                    animate={{ translateX: ['100%', '-100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  {/* Top Highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                </motion.div>
              ) : (
                <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-white/5 rounded-sm" />
              )}
              {i === 2 && (
                <motion.div 
                   className="absolute inset-0 bg-blue-500/20 blur-md rounded-full -bottom-1"
                   animate={{ 
                     scale: [0.8, 1, 0.8],
                     opacity: [0.3, 0.6, 0.3]
                   }}
                   transition={{ 
                     duration: 4, 
                     repeat: Infinity, 
                     ease: "easeInOut" 
                   }}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
