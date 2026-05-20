import React from 'react';
import { Trash2 } from 'lucide-react';
import { snapValue, getSnapTargets } from '../lib/snapUtils';
import type { BBox, Selection } from '../types';

interface SelectionBoxProps {
  id: number;
  bbox: BBox;
  selected: boolean;
  displayIndex: number | null;
  selections: Selection[];
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate: (id: number) => void;
  onUpdate: (bbox: BBox) => void;
  canvasSize: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };
}

const MIN_SIZE = 20;

export default function SelectionBox({ id, bbox, selected, displayIndex, selections, onToggle, onDelete, onDuplicate, onUpdate, canvasSize, zoom, pan }: SelectionBoxProps) {
  const { xTargets, yTargets } = getSnapTargets(selections, id, canvasSize);
  const wasDraggingResizing = React.useRef(false);

  const mapClientToImage = (clientX: number, clientY: number, containerRect: DOMRect) => {
    return {
      x: (clientX - containerRect.left) / zoom - pan.x,
      y: (clientY - containerRect.top) / zoom - pan.y,
    };
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (e.altKey) {
      onDuplicate(id);
    }

    const container = (e.currentTarget as HTMLElement).parentElement!;
    const rect = container.getBoundingClientRect();
    const start = mapClientToImage(e.clientX, e.clientY, rect);
    const startBBox = { ...bbox };
    const startX = start.x - bbox.x;
    const startY = start.y - bbox.y;

    const mouseMove = (me: MouseEvent) => {
      wasDraggingResizing.current = true;
      const current = mapClientToImage(me.clientX, me.clientY, rect);
      let newX = snapValue(current.x - startX, xTargets);
      let newY = snapValue(current.y - startY, yTargets);
      
      newX = Math.max(0, Math.min(newX, canvasSize.width - bbox.width));
      newY = Math.max(0, Math.min(newY, canvasSize.height - bbox.height));
      onUpdate({ ...bbox, x: newX, y: newY });
    };

    const mouseUp = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  const handleResize = (e: React.MouseEvent, direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => {
    e.stopPropagation();
    const container = (e.currentTarget.parentElement as HTMLElement).parentElement!;
    const rect = container.getBoundingClientRect();
    const start = mapClientToImage(e.clientX, e.clientY, rect);
    const startBBox = { ...bbox };

    const mouseMove = (me: MouseEvent) => {
      wasDraggingResizing.current = true;
      const current = mapClientToImage(me.clientX, me.clientY, rect);
      const dx = current.x - start.x;
      const dy = current.y - start.y;
      let { x, y, width, height } = { ...startBBox };

      if (direction.includes('e')) {
        const newRight = snapValue(Math.max(startBBox.x + MIN_SIZE, startBBox.x + startBBox.width + dx), xTargets);
        width = Math.min(newRight, canvasSize.width) - startBBox.x;
      }
      if (direction.includes('w')) {
        const newWidth = Math.max(MIN_SIZE, startBBox.width - dx);
        x = snapValue(Math.min(startBBox.x + dx, startBBox.x + startBBox.width - MIN_SIZE), xTargets);
        width = startBBox.width + startBBox.x - x;
      }
      if (direction.includes('s')) {
        const newBottom = snapValue(Math.max(startBBox.y + MIN_SIZE, startBBox.y + startBBox.height + dy), yTargets);
        height = Math.min(newBottom, canvasSize.height) - startBBox.y;
      }
      if (direction.includes('n')) {
        const newHeight = Math.max(MIN_SIZE, startBBox.height - dy);
        y = snapValue(Math.min(startBBox.y + dy, startBBox.y + startBBox.height - MIN_SIZE), yTargets);
        height = startBBox.height + startBBox.y - y;
      }
      onUpdate({ x, y, width, height });
    };

    const mouseUp = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  return (
    <div 
      className={`absolute border-2 transition-colors ${selected ? 'border-[#0071e3] z-10 shadow-[0_0_10px_rgba(0,113,227,0.3)]' : 'border-gray-400 dark:border-gray-600 z-0'}`}
      style={{ left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height }}
      onMouseDown={e => {
          wasDraggingResizing.current = false;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          const margin = 10;
          let direction = '';
          if (y < margin) direction += 'n';
          else if (y > bbox.height - margin) direction += 's';
          if (x < margin) direction += 'w';
          else if (x > bbox.width - margin) direction += 'e';
          
          if (direction) {
              handleResize(e, direction as any);
          } else {
              handleDrag(e);
          }
      }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        const margin = 10;
        let direction = '';
        if (y < margin) direction += 'n';
        else if (y > bbox.height - margin) direction += 's';
        if (x < margin) direction += 'w';
        else if (x > bbox.width - margin) direction += 'e';
        
        e.currentTarget.style.cursor = direction ? `${direction}-resize` : 'move';
      }}
      onClick={(e) => {
          e.stopPropagation();
          if (wasDraggingResizing.current) return;
          onToggle();
      }}
      onDoubleClick={(e) => { e.stopPropagation(); onDelete(); }}
    >
      {/* Number Label: White semi-transparent, centered */}
      {displayIndex !== null && (
        <div className="absolute inset-0 flex items-center justify-center text-[48px] font-bold text-white/40 pointer-events-none select-none">
            {displayIndex}
        </div>
      )}
    </div>
  );
}
