import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Download, Trash2, Copy, Check } from 'lucide-react';
import Tooltip from './Tooltip';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';

interface SortableResultItemProps {
  id: number;
  index: number;
  imageData: string;
  onRemove: (id: number) => void;
  onPreview: (data: string) => void;
  lang: Language;
  tooltips: any;
  key?: React.Key;
}

export default function SortableResultItem({ id, index, imageData, onRemove, onPreview, lang, tooltips }: SortableResultItemProps) {
  const [copied, setCopied] = React.useState(false);
  const t = TRANSLATIONS[lang];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image: ', err);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      onClick={() => onPreview(imageData)}
      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-[#0071e3] dark:hover:border-[#0071e3] transition-all touch-none shadow-sm cursor-grab active:cursor-grabbing"
    >
      <img 
        src={imageData} 
        alt={`Selection ${id}`} 
        className="w-full h-full object-cover pointer-events-none select-none" 
      />
      
      <div 
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all pointer-events-none backdrop-blur-[2px]"
      >
        <Tooltip content={t.download}>
          <button 
            onClick={(e) => { e.stopPropagation(); const isJpeg = imageData.startsWith('data:image/jpeg'); const ext = isJpeg ? 'jpg' : 'png'; const link = document.createElement('a'); link.href = imageData; link.download = `selection-${index + 1}.${ext}`; link.click(); }} 
            className="p-2 bg-white dark:bg-black/60 dark:text-white rounded-full text-[#1d1d1f] hover:scale-110 active:scale-95 transition-all shadow-md pointer-events-auto"
          >
            <Download size={14}/>
          </button>
        </Tooltip>
        <Tooltip content={copied ? t.copied : t.copy}>
          <button 
            onClick={handleCopy}
            className={`p-2 rounded-full hover:scale-110 active:scale-95 transition-all shadow-md pointer-events-auto ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-black/60 dark:text-white text-[#1d1d1f]'}`}
          >
            {copied ? <Check size={14}/> : <Copy size={14}/>}
          </button>
        </Tooltip>
        <Tooltip content={t.delete}>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(id); }} 
            className="p-2 bg-white dark:bg-black/60 dark:text-white rounded-full text-[#1d1d1f] hover:scale-110 active:scale-95 transition-all shadow-md pointer-events-auto"
          >
            <Trash2 size={14}/>
          </button>
        </Tooltip>
      </div>
      
      <div className="absolute top-2 left-2 bg-black/40 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md pointer-events-none border border-white/10 uppercase">
        {(index + 1).toString().padStart(2, '0')}
      </div>
    </div>
  );
}
