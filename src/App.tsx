import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TRANSLATIONS } from './constants';
import type { Language, Selection, BBox } from './types';
import SelectionBox from './components/SelectionBox';
import Tooltip from './components/Tooltip';
import SortableResultItem from './components/SortableResultItem';
import ManualModal from './components/ManualModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import ExtensionExportModal from './components/ExtensionExportModal';
import Logo from './components/Logo';
import { Download, Upload, Plus, Trash2, ListOrdered, Sun, Moon, Maximize, LayoutGrid, PanelLeft, PanelRight, Image as ImageIcon, Sparkles, Wand2, Crop, HelpCircle, Archive, Puzzle, Pin, PinOff, Minimize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { detectPanels } from './lib/panelDetector';
import JSZip from 'jszip';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface ResultItem {
  id: number;
  selected: boolean;
  imageData: string;
}

let sessionCheckDone = false;

if (typeof window !== 'undefined' && typeof document !== 'undefined' && !sessionCheckDone) {
  const hasSession = document.cookie.includes('storyboard_session_active=true');
  if (!hasSession) {
    try {
      localStorage.removeItem('storyboard_image');
      localStorage.removeItem('storyboard_dimensions');
      localStorage.removeItem('storyboard_selections');
      localStorage.removeItem('storyboard_results');
      localStorage.removeItem('storyboard_panel_strength');
      localStorage.removeItem('storyboard_resolution');
      localStorage.removeItem('storyboard_sidebar_left');
      localStorage.removeItem('storyboard_sidebar_right');
    } catch (e) {
      console.warn('Failed to clear localStorage on session startup:', e);
    }
    try {
      document.cookie = "storyboard_session_active=true; path=/; SameSite=Lax";
    } catch (e) {
      console.warn('Failed to set session cookie:', e);
    }
  }
  sessionCheckDone = true;
}

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const t = TRANSLATIONS[lang];
 
  // Apply dark mode class to root and persist
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
 
  const [image, setImage] = useState<string | null>(() => {
    return localStorage.getItem('storyboard_image') || null;
  });
  const [imageDimensions, setImageDimensions] = useState(() => {
    const saved = localStorage.getItem('storyboard_dimensions');
    return saved ? JSON.parse(saved) : { width: 400, height: 560 };
  });
  const [selections, setSelections] = useState<Selection[]>(() => {
    const saved = localStorage.getItem('storyboard_selections');
    return saved ? JSON.parse(saved) : [];
  });
  const [results, setResults] = useState<ResultItem[]>(() => {
    const saved = localStorage.getItem('storyboard_results');
    return saved ? JSON.parse(saved) : [];
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [panelStrength, setPanelStrength] = useState(() => {
    const saved = localStorage.getItem('storyboard_panel_strength');
    return saved ? Number(saved) : 3;
  });
  const [resolution, setResolution] = useState<'original' | '1k' | '2k'>(() => {
    return (localStorage.getItem('storyboard_resolution') as any) || 'original';
  });
  const [gridRows, setGridRows] = useState<number>(3);
  const [gridCols, setGridCols] = useState<number>(3);
  const [isGridEnabled, setIsGridEnabled] = useState<boolean>(false);
 
  // Both sidebars default to true on start (always open initially)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('storyboard_sidebar_left');
    return saved !== null ? saved === 'true' : true;
  });
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('storyboard_sidebar_right');
    return saved !== null ? saved === 'true' : true;
  });
 
  const [showManual, setShowManual] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
 
  // Synchronise state triggers with browser session storage automatically:
  useEffect(() => {
    if (image) {
      try {
        localStorage.setItem('storyboard_image', image);
      } catch (e) {
        console.warn('Failed to save storyboard_image to localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem('storyboard_image');
      } catch (e) {}
    }
  }, [image]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_dimensions', JSON.stringify(imageDimensions));
    } catch (e) {
      console.warn('Failed to save storyboard_dimensions to localStorage:', e);
    }
  }, [imageDimensions]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_selections', JSON.stringify(selections));
    } catch (e) {
      console.warn('Failed to save storyboard_selections to localStorage:', e);
    }
  }, [selections]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_results', JSON.stringify(results));
    } catch (e) {
      console.warn('Failed to save storyboard_results to localStorage:', e);
    }
  }, [results]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_panel_strength', String(panelStrength));
    } catch (e) {
      console.warn('Failed to save storyboard_panel_strength to localStorage:', e);
    }
  }, [panelStrength]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_resolution', resolution);
    } catch (e) {
      console.warn('Failed to save storyboard_resolution to localStorage:', e);
    }
  }, [resolution]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_sidebar_left', String(isLeftSidebarOpen));
    } catch (e) {
      console.warn('Failed to save storyboard_sidebar_left to localStorage:', e);
    }
  }, [isLeftSidebarOpen]);
 
  useEffect(() => {
    try {
      localStorage.setItem('storyboard_sidebar_right', String(isRightSidebarOpen));
    } catch (e) {
      console.warn('Failed to save storyboard_sidebar_right to localStorage:', e);
    }
  }, [isRightSidebarOpen]);

  // Monitor screen size and protocol to handle Chrome Extension UI responsiveness
  useEffect(() => {
    const handleSizing = () => {
      const isExtension = typeof window !== 'undefined' && (
        window.location.protocol === 'chrome-extension:' ||
        window.innerWidth < 1100
      );
      setIsCompact(isExtension);
      
      // Add popup window utility class if running inside chrome-extension context
      if (typeof window !== 'undefined' && window.location.protocol === 'chrome-extension:') {
        document.documentElement.classList.add('chrome-extension-popup');
        document.body.classList.add('chrome-extension-popup');
      }
    };
    
    handleSizing();
    window.addEventListener('resize', handleSizing);
    return () => window.removeEventListener('resize', handleSizing);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setResults((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newResults = arrayMove(items, oldIndex, newIndex);
        return newResults;
      });
    }
  };

  const handleCombine = async () => {
    if (results.length === 0) return;

    const count = results.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    // Get natural dimensions of the first image to determine cell size
    const firstImg = new Image();
    firstImg.src = results[0].imageData;
    await new Promise(r => firstImg.onload = r);

    // Use a fixed cell size based on the first image but could be average or max
    const cellW = firstImg.naturalWidth;
    const cellH = firstImg.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = cellW * cols;
    canvas.height = cellH * rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background (white for light mode, dark for dark mode)
    ctx.fillStyle = isDarkMode ? '#1d1d1f' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < count; i++) {
        const r = results[i];
        const img = new Image();
        img.src = r.imageData;
        await new Promise(resolve => img.onload = resolve);
        
        const cellX = (i % cols) * cellW;
        const cellY = Math.floor(i / cols) * cellH;
        
        // Calculate aspect ratio fit
        const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = cellX + (cellW - w) / 2;
        const y = cellY + (cellH - h) / 2;
        
        ctx.drawImage(img, x, y, w, h);
    }

    const combinedData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = combinedData;
    link.download = `combined-storyboard-${Date.now()}.png`;
    link.click();
  };

  // --- Zoom/Pan Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.1), 8.0);
    const rect = canvasRef.current!.getBoundingClientRect();
    
    // Position of point under mouse in image coordinates before zoom
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    setZoom(newZoom);
    setPan({
        x: (e.clientX - rect.left) - mouseX * newZoom,
        y: (e.clientY - rect.top) - mouseY * newZoom
    });
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePan = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan(prev => ({
        x: prev.x + (e.clientX - lastMousePos.x),
        y: prev.y + (e.clientY - lastMousePos.y)
    }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleFitView = useCallback(() => {
    if (!canvasRef.current || imageDimensions.width === 0) return;
    const cw = canvasRef.current.clientWidth;
    const ch = canvasRef.current.clientHeight;
    if (cw === 0 || ch === 0) return;

    // Calculate visible width and left offset relative to the canvas container,
    // accounting for left (260px) and right (280px) sidebars when they are absolute-positioned (isCompact is true)
    const visibleLeft = (isCompact && isLeftSidebarOpen) ? 260 : 0;
    const visibleRight = (isCompact && isRightSidebarOpen) ? 280 : 0;
    const visibleW = cw - visibleLeft - visibleRight;
    const visibleH = ch;

    const padding = 60;
    const availableW = Math.max(visibleW - padding, 100);
    const availableH = Math.max(visibleH - padding, 100);
    
    const newZoom = Math.min(availableW / imageDimensions.width, availableH / imageDimensions.height, 1);
    
    setZoom(newZoom);
    setPan({
        x: visibleLeft + (visibleW - imageDimensions.width * newZoom) / 2,
        y: (visibleH - imageDimensions.height * newZoom) / 2
    });
  }, [imageDimensions, isLeftSidebarOpen, isRightSidebarOpen, isCompact]);

  useEffect(() => {
    if (image) handleFitView();
  }, [image, handleFitView]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      setImage(imgUrl);
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const file = e.clipboardData?.files[0];
    if (file && file.type.startsWith('image')) handleFileUpload(file);
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleRecognize = async () => {
    if (!image) return;
    const bboxes = await detectPanels(
      image, 
      imageDimensions.width, 
      imageDimensions.height, 
      panelStrength, 
      isGridEnabled && gridRows > 0 && gridCols > 0 ? { rows: gridRows, cols: gridCols } : undefined
    );
    const newSelections: Selection[] = bboxes.map((bbox, index) => ({
      id: index + 1,
      selected: true,
      bbox,
      source: isGridEnabled && gridRows > 0 && gridCols > 0 ? 'manual-grid' : 'auto'
    }));
    setSelections(newSelections);
  };

  const handleManualAdd = () => {
    const newId = selections.length > 0 ? Math.max(...selections.map(s => s.id)) + 1 : 1;
    setSelections([...selections, { id: newId, selected: true, bbox: { x: 50, y: 50, width: 100, height: 100 }, source: 'manual' }]);
  };

  const handleReorder = () => {
    setSelections(prev => {
      const sorted = [...prev].sort((a, b) => {
        const threshold = imageDimensions.height * 0.05;
        if (Math.abs(a.bbox.y - b.bbox.y) > threshold) {
          return a.bbox.y - b.bbox.y;
        }
        return a.bbox.x - b.bbox.x;
      });
      return sorted.map((s, i) => ({ ...s, id: i + 1 }));
    });
  };
  
  const handleDuplicate = (id: number) => {
    setSelections(prev => {
      const original = prev.find(s => s.id === id);
      if (!original) return prev;
      const newId = prev.length > 0 ? Math.max(...prev.map(s => s.id)) + 1 : 1;
      return [...prev, { ...original, id: newId }];
    });
  };

  // ... (inside the render loop in main)
  // {selections.map(s => (
  //   <SelectionBox 
  //     key={s.id} 
  //     {...s} 
  //     onToggle={() => toggleCanvasSelection(s.id)}
  //     onDelete={() => setSelections(selections.filter(sel => sel.id !== s.id))}
  //     onUpdate={(bbox) => setSelections(selections.map(sel => sel.id === s.id ? {...sel, bbox} : sel))}
  //     snapTargets={{xTargets: [], yTargets: []}}
  //     canvasSize={{width: 400, height: 560}}
  //   />
  // ))}

  const handleProcess = async () => {
    if (!imgRef.current) return;
    const selectedSelections = selections.filter(s => s.selected);
    const newResults: ResultItem[] = [];
    
    let seq = 1;
    for (const s of selectedSelections) {
      const imageData = cropImage(s.bbox);
      if (imageData) {
        newResults.push({ id: seq++, selected: true, imageData });
      }
    }
    setResults(newResults);
    setIsRightSidebarOpen(true);
  };

  const cropImage = (bbox: BBox): string | null => {
    try {
      if (!imgRef.current) return null;
      const img = imgRef.current;
      
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      
      const sourceW = bbox.width * scaleX;
      const sourceH = bbox.height * scaleY;
      
      let targetW = sourceW;
      let targetH = sourceH;

      if (resolution !== 'original') {
        const targetMax = resolution === '1k' ? 1024 : 2048;
        if (sourceW >= sourceH) {
          targetW = targetMax;
          targetH = (sourceH / sourceW) * targetMax;
        } else {
          targetH = targetMax;
          targetW = (sourceW / sourceH) * targetMax;
        }
      }
      
      if (isNaN(targetW) || isNaN(targetH) || targetW <= 0 || targetH <= 0) {
        return null;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
              img, 
              bbox.x * scaleX, bbox.y * scaleY, sourceW, sourceH, 
              0, 0, targetW, targetH
          );
      }
      // Use image/jpeg with 0.85 quality to compress the output data size significantly
      // (saves up to 90% of localStorage / memory space and avoids quota exception crash!)
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.error('Error cropping image:', e);
      return null;
    }
  };

  const toggleCanvasSelection = (id: number) => {
    setSelections(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };


  const extensionT = {
    zh: {
      popupMode: '弹窗模式 (800x600)',
      tabMode: '分页模式 (全屏)',
      returnPopup: '销毁分页 (退回小窗)',
      pinWindow: '固定窗口 (置于最顶层且锁定位置)',
      unpinWindow: '解开固定 (允许自由拖曳)',
      minimize: '最小化插件 (点击桌面图标恢复)',
      openPlugin: '分镜提取器 v2.4 (点击打开)',
      chromeBar: 'Chrome Extension Popup • 800×600 px',
      currentTab: '在新分页中全屏运行中',
      desktopHint: '🎨 桌面模拟环境 (鼠标在下方小窗顶部按住可任意拖动，点击红黄绿按钮快速收起、切换或固定)'
    },
    en: {
      popupMode: 'Popup Mode (800x600)',
      tabMode: 'Tab Mode (Fullscreen)',
      returnPopup: 'Destroy Tab (Return to Popup)',
      pinWindow: 'Pin Window (Always on Top & Locked)',
      unpinWindow: 'Unpin Window (Allow Dragging)',
      minimize: 'Minimize Extension (Click Icon to Restore)',
      openPlugin: 'Storyboard Extractor v2.4 (Click to Open)',
      chromeBar: 'Chrome Extension Popup • 800×600 px',
      currentTab: 'Running inside separate browser tab',
      desktopHint: '🎨 Desktop Sandbox (Drag small window by its top handle, toggle window via mac controls)'
    },
    jp: {
      popupMode: 'ポップアップ (800x600)',
      tabMode: 'タブモード (フルスクリーン)',
      returnPopup: 'タブ削除 (ポップアップに戻る)',
      pinWindow: 'ウィンドウ固定 (常に最前面 & ドラッグロック)',
      unpinWindow: '固定解除 (ドラッグ可能)',
      minimize: '最小化する (アイコンクリックで復元)',
      openPlugin: '分鏡抽出器 v2.4 (クリックで開く)',
      chromeBar: 'Chrome拡張機能 • 800×600 px',
      currentTab: '新規別タブ実行中',
      desktopHint: '🎨 デスクトップ環境 (タイトルバーをドラッグして小窓を移動、赤・黄・緑ボタンで操作できます)'
    }
  }[lang] || {
    popupMode: 'Popup Mode (800x600)',
    tabMode: 'Tab Mode (Fullscreen)',
    returnPopup: 'Destroy Tab (Return to Popup)',
    pinWindow: 'Pin Window (Always on Top & Locked)',
    unpinWindow: 'Unpin Window (Allow Dragging)',
    minimize: 'Minimize Extension (Click Icon to Restore)',
    openPlugin: 'Storyboard Extractor v2.4 (Click to Open)',
    chromeBar: 'Chrome Extension Popup • 800×600 px',
    currentTab: 'Running inside separate browser tab',
    desktopHint: '🎨 Desktop Sandbox (Drag small window by its top handle, toggle window via mac controls)'
  };

  return (
    <div className="h-screen w-screen bg-[#f5f5f7] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors overflow-hidden font-sans relative flex flex-col">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} />
      
      {/* Core Application Frame Body */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
              {/* HEADER CONTAINER */}
              <header className="h-[48px] border-b border-[#d2d2d7] dark:border-[#333333] bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                  <Tooltip content={isLeftSidebarOpen ? t.hideSidebar : t.showSidebar}>
                    <button 
                      onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all ${!isLeftSidebarOpen ? 'text-[#0071e3] bg-[#0071e3]/10' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      <PanelLeft size={18} />
                    </button>
                  </Tooltip>
                  <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-800" />
                  <h1 className="text-[14px] font-bold tracking-tight flex items-center gap-2 px-1">
                    <Logo size="sm" />
                    {t.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 text-[11px] mr-2">
                    {(['zh', 'en', 'jp'] as Language[]).map((l) => (
                      <Tooltip key={l} content={TRANSLATIONS[l].lang}>
                        <button 
                          onClick={() => setLang(l)} 
                          className={`h-8 px-3 rounded-lg transition-all font-bold ${lang === l ? 'bg-white dark:bg-white/10 shadow-sm text-[#0071e3] dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                          {TRANSLATIONS[l].lang}
                        </button>
                      </Tooltip>
                    ))}
                  </div>

                  <Tooltip content={(t as any).manual || 'Manual'}>
                    <button 
                      onClick={() => setShowManual(true)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-gray-900"
                    >
                      <HelpCircle size={18} />
                    </button>
                  </Tooltip>

                  <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-800 mx-1" />

                  <Tooltip content={t.tooltips.theme}>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-gray-900"
                    >
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </Tooltip>

                  <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-800 mx-1" />

                  <Tooltip content={isRightSidebarOpen ? t.hideLibrary : t.showLibrary}>
                    <button 
                      onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all ${!isRightSidebarOpen ? 'text-[#0071e3] bg-[#0071e3]/10' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      <PanelRight size={18} />
                    </button>
                  </Tooltip>
                </div>
              </header>

              {/* CORE LAYOUT WORKSPACE */}
              <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {isLeftSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`${isCompact ? 'absolute left-0 top-0 h-full z-40 shadow-2xl border-r' : 'relative border-r'} flex-shrink-0 border-[#d2d2d7] dark:border-[#333333] bg-white dark:bg-[#1c1c1e] flex flex-col overflow-hidden`}
            >
              <div className="flex-1 overflow-y-auto py-2 space-y-4">
                <section className="space-y-2.5">
                  <label style={{ marginBottom: '9px' }} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block underline-offset-4 flex items-center gap-2 px-2">
                    <Sparkles size={12} />
                    {t.recognition}
                  </label>
                  
                  <div className="space-y-2">
                    <Tooltip content={t.tooltips.strength} className="w-[250px] ml-[5px]">
                      <div style={{ height: '55px', paddingTop: '5px', paddingBottom: '8px', width: '250px' }} className="bg-gray-50 dark:bg-white/5 px-2.5 rounded-xl border border-gray-100 dark:border-white/5 w-full flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-medium opacity-70">{t.panelStrength}</span>
                          <span className="text-[11px] font-bold text-[#0071e3]">{panelStrength}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={panelStrength} 
                          onChange={(e) => setPanelStrength(Number(e.target.value))} 
                          className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0071e3]" 
                        />
                      </div>
                    </Tooltip>

                    <div 
                      style={{ height: '70px', width: '254.333px', marginBottom: '4px' }}
                      className="bg-gray-50 dark:bg-white/5 p-2 px-2.5 rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-medium opacity-70">{t.gridSettings}</span>
                        <Tooltip content={
                            isGridEnabled 
                              ? (lang === 'zh' ? '禁用规则宫格' : lang === 'jp' ? '規則グリッドを無効化' : 'Disable Rule Grid') 
                              : (lang === 'zh' ? '启用规则宫格' : lang === 'jp' ? '規則グリッドを有効化' : 'Enable Rule Grid')
                          }
                        >
                          <button 
                            onClick={() => setIsGridEnabled(!isGridEnabled)} 
                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isGridEnabled ? 'bg-[#0071e3]' : 'bg-gray-200 dark:bg-white/10'
                            }`}
                            role="switch"
                            aria-checked={isGridEnabled}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isGridEnabled ? 'translate-x-45' : 'translate-x-0.5'
                              }`}
                              style={{ transform: isGridEnabled ? 'translateX(16px)' : 'translateX(2px)', marginTop: '1px' }}
                            />
                          </button>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Tooltip content={t.tooltips.rows}>
                          <div className={`flex items-center bg-white dark:bg-black/20 rounded-md border border-gray-100 dark:border-white/5 overflow-hidden transition-all ${!isGridEnabled ? 'opacity-50' : ''}`}>
                            <label className={`text-[9px] uppercase font-bold px-2 bg-gray-50 dark:bg-white/5 h-full flex items-center justify-center min-w-[36px] transition-colors ${isGridEnabled ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>{t.rows}</label>
                            <input 
                              type="number" 
                              min="1" 
                              value={gridRows || ''} 
                              onChange={(e) => setGridRows(Math.max(1, parseInt(e.target.value) || 1))} 
                              className={`w-full bg-transparent px-1 py-1 text-[11px] outline-none font-bold text-center transition-colors ${isGridEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`} 
                              disabled={!isGridEnabled}
                            />
                          </div>
                        </Tooltip>
                        <Tooltip content={t.tooltips.cols}>
                          <div className={`flex items-center bg-white dark:bg-black/20 rounded-md border border-gray-100 dark:border-white/5 overflow-hidden transition-all ${!isGridEnabled ? 'opacity-50' : ''}`}>
                            <label className={`text-[9px] uppercase font-bold px-2 bg-gray-50 dark:bg-white/5 h-full flex items-center justify-center min-w-[36px] transition-colors ${isGridEnabled ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>{t.columns}</label>
                            <input 
                              type="number" 
                              min="1" 
                              value={gridCols || ''} 
                              onChange={(e) => setGridCols(Math.max(1, parseInt(e.target.value) || 1))} 
                              className={`w-full bg-transparent px-1 py-1 text-[11px] outline-none font-bold text-center transition-colors ${isGridEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`} 
                              disabled={!isGridEnabled}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="px-0">
                      <Tooltip content={t.tooltips.startRecognition} className="w-full">
                        <button 
                          onClick={handleRecognize} 
                          className="w-[250px] h-[50px] ml-[5px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-[14px] font-extrabold transition-all shadow-xl shadow-blue-500/30 active:scale-[0.97] flex items-center justify-center gap-3 border border-blue-400/20 px-4"
                        >
                          <Sparkles size={20} />
                          {t.startRecognition}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block flex items-center gap-2 px-2">
                    <Crop size={12} />
                    {t.manualAdd}
                  </label>
                    <div className="grid grid-cols-1 gap-2 px-1">
                      <div className="grid grid-cols-2 gap-2">
                      <Tooltip content={t.tooltips.manualAdd}>
                        <button 
                          onClick={handleManualAdd} 
                          className="w-full h-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                        >
                          <Plus size={16} className="text-[#0071e3]" />
                          {t.addSelection}
                        </button>
                      </Tooltip>
                      <Tooltip content={t.tooltips.reorder}>
                        <button 
                          onClick={handleReorder} 
                          className="w-full h-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                        >
                          <ListOrdered size={16} className="text-[#0071e3]" />
                          {t.reorder}
                        </button>
                      </Tooltip>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Tooltip content={t.tooltips.selectAll}>
                        <button 
                          onClick={() => setSelections(selections.map(s => ({...s, selected: true})))} 
                          className="w-full h-10 bg-gray-100 dark:bg-white/5 text-[11px] font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                        >
                          {t.selectAll}
                        </button>
                      </Tooltip>
                      <Tooltip content={t.tooltips.clear}>
                        <button 
                          onClick={() => setSelections([])} 
                          className="w-full h-10 bg-red-50 dark:bg-red-500/5 text-[11px] font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 transition-all active:scale-95"
                        >
                          {t.clear}
                        </button>
                      </Tooltip>
                    </div>

                    <Tooltip content={t.tooltips.deleteMode}>
                      <button 
                        onClick={() => setSelections(selections.filter(s => !s.selected))} 
                        className="w-full h-10 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 active:scale-95 shadow-sm"
                      >
                        <Trash2 size={16} className="text-red-500" />
                        {t.enterDeleteMode}
                      </button>
                    </Tooltip>
                  </div>
                </section>
              </div>

              <div className="border-t border-[#d2d2d7] dark:border-[#333333] pb-3 space-y-2">
                <div className="grid grid-cols-3 gap-0 px-0 mt-2">
                  {(['original', '1k', '2k'] as const).map((res, idx) => (
                    <Tooltip key={res} content={t.tooltips.resolution}>
                      <button 
                        onClick={() => setResolution(res)} 
                        className={`h-[30px] w-full text-[11px] font-bold transition-all border-y ${
                          resolution === res 
                          ? 'bg-white dark:bg-white/15 border-gray-200 dark:border-white/20 text-[#0071e3] shadow-sm z-10' 
                          : 'bg-gray-100 dark:bg-white/5 border-transparent opacity-40 hover:opacity-100'
                        } ${
                          idx === 0 ? 'border-l' : idx === 2 ? 'border-r' : 'border-x-transparent'
                        }`}
                      >
                        {res === 'original' ? t.original : res.toUpperCase()}
                      </button>
                    </Tooltip>
                  ))}
                </div>
                <div className="px-0">
                  <Tooltip content={t.tooltips.process}>
                    <button 
                      onClick={handleProcess} 
                      className="w-[250px] h-[50px] ml-[5px] bg-[#1d1d1f] dark:bg-white text-white dark:text-black rounded-xl text-[14px] font-extrabold transition-all shadow-2xl active:scale-[0.97] flex items-center justify-start gap-3 border border-white/10 pl-[17px] pr-4 mb-0"
                    >
                      <Wand2 size={20} />
                      {t.process}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Canvas Area */}
        <section className="flex-1 bg-[#f5f5f7] dark:bg-black relative overflow-hidden flex flex-col group" onMouseMove={handlePan} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}>
          {/* Canvas Floating Controls */}
          {image && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip content={t.tooltips.resetZoom}>
                <button 
                  onClick={handleFitView} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
                >
                  <Maximize size={18} />
                </button>
              </Tooltip>
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/10 mx-1" />
              <Tooltip content={t.tooltips.resetZoom}>
                <div className="flex items-center gap-0 px-1">
                  <input 
                    type="text"
                    value={`${Math.round(zoom * 100)}`}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val === '') {
                        setZoom(0.01);
                        return;
                      }
                      const num = parseInt(val);
                      setZoom(Math.min(Math.max(num / 100, 0.01), 10));
                    }}
                    onBlur={() => {
                      if (zoom < 0.05) setZoom(0.05);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="w-12 h-7 bg-transparent border-none text-center text-[12px] font-mono font-bold focus:ring-0 focus:outline-none focus:bg-gray-100 dark:focus:bg-white/10 rounded-md transition-colors selection:bg-[#0071e3] selection:text-white"
                  />
                  <span className="text-[10px] font-bold opacity-30 -ml-1 pr-1 pointer-events-none">%</span>
                </div>
              </Tooltip>
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/10 mx-1" />
              <Tooltip content={t.uploadButton}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-[#0071e3]"
                >
                  <Upload size={18} />
                </button>
              </Tooltip>
            </div>
          )}

          <div 
            ref={canvasRef}
            className="flex-1 relative cursor-default overflow-hidden canvas-container"
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
          >
            {!image && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 pointer-events-none z-10"
              >
                <div className="max-w-sm flex flex-col items-center">
                  <Logo />
                  <h3 className="text-xl font-semibold mb-2 mt-4">{t.emptyStateHeader}</h3>
                  <p className="text-[13px] opacity-50 leading-relaxed mb-8">
                    {t.emptyStateBody}
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-10 py-3.5 bg-[#0071e3] text-white rounded-full text-[15px] font-bold shadow-2xl shadow-blue-500/30 active:scale-95 transition-all pointer-events-auto hover:bg-[#0077ed]"
                  >
                    {t.uploadButton}
                  </button>
                  <p className="mt-6 text-[11px] font-medium text-gray-400 dark:text-gray-600 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">Ctrl</span>
                    <span>+</span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">V</span>
                    <span className="ml-1 opacity-60">{t.pasteHint}</span>
                  </p>
                </div>
              </motion.div>
            )}

            <div 
              className={`absolute bg-white dark:bg-[#111] shadow-[0_30px_100px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden select-none ${!image ? 'hidden' : 'block'}`}
              style={{ 
                  width: `${imageDimensions.width}px`,
                  height: `${imageDimensions.height}px`,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
              }}
              onDoubleClick={(e) => {
                if (e.target !== e.currentTarget) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const newId = selections.length > 0 ? Math.max(...selections.map(s => s.id)) + 1 : 1;
                // Center the 100x100 box at click point
                const x = (e.clientX - rect.left) / zoom;
                const y = (e.clientY - rect.top) / zoom;
                
                const boxW = 100;
                const boxH = 100;
                
                const newSelection: Selection = { 
                  id: newId, 
                  selected: false, // Don't trigger selection state as requested
                  bbox: { 
                    x: Math.max(0, x - boxW / 2), 
                    y: Math.max(0, y - boxH / 2), 
                    width: boxW, 
                    height: boxH 
                  }, 
                  source: 'manual' 
                };
                
                setSelections([...selections, newSelection]);
              }}
            >
              {image && <img ref={imgRef} src={image} className="object-contain pointer-events-none select-none" style={{width: `${imageDimensions.width}px`, height: `${imageDimensions.height}px`}} alt="base" />}
              {selections.map(s => {
                const selectedItems = selections.filter(sel => sel.selected);
                const displayIndex = s.selected ? selectedItems.findIndex(sel => sel.id === s.id) + 1 : null;
                return (
                  <SelectionBox 
                    key={s.id} 
                    {...s} 
                    displayIndex={displayIndex}
                    zoom={zoom}
                    pan={pan}
                    selections={selections}
                    onToggle={() => toggleCanvasSelection(s.id)}
                    onDelete={() => setSelections(selections.filter(sel => sel.id !== s.id))}
                    onDuplicate={handleDuplicate}
                    onUpdate={(bbox) => setSelections(selections.map(sel => sel.id === s.id ? {...sel, bbox} : sel))}
                    canvasSize={imageDimensions}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Results Library */}
        <AnimatePresence initial={false}>
          {isRightSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`${isCompact ? 'absolute right-0 top-0 h-full z-40 shadow-2xl border-l' : 'relative border-l'} flex-shrink-0 border-[#d2d2d7] dark:border-[#333333] bg-white dark:bg-[#1c1c1e] flex flex-col overflow-hidden`}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#d2d2d7] dark:border-[#333333]">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t.results}</label>
                <span className="text-[10px] font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full opacity-60">{results.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={results.map(r => r.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                      {results.map((r, index) => (
                        <SortableResultItem 
                          key={r.id}
                          id={r.id}
                          index={index}
                          imageData={r.imageData}
                          onRemove={(id) => {
                            setResults(prev => prev.filter(res => res.id !== id));
                          }}
                          onPreview={(data) => setPreviewImage(data)}
                          lang={lang}
                          tooltips={t.tooltips}
                        />
                      ))}
                      {results.length === 0 && (
                        <div className="col-span-2 aspect-square border border-dashed border-gray-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center opacity-30">
                          <ImageIcon size={32} />
                          <span className="text-[11px] mt-2">{t.noResults}</span>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

               <div className="p-2 pb-4 border-t border-[#d2d2d7] dark:border-[#333333] bg-gray-50/50 dark:bg-white/[0.04]">
                <div className="grid grid-cols-3 gap-1.5">
                  <Tooltip content={t.tooltips.combine}>
                    <button 
                      onClick={handleCombine}
                      className="h-14 w-full flex flex-col items-center justify-center bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl transition-all shadow-lg shadow-blue-500/15 active:scale-[0.94] border border-blue-400/20 group/btn"
                    >
                      <LayoutGrid size={18} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-extrabold mt-1 tracking-tighter whitespace-nowrap">{t.combine}</span>
                    </button>
                  </Tooltip>

                  <Tooltip content={t.tooltips.batchDownload}>
                    <button 
                      onClick={() => {
                        results.forEach((r, index) => {
                            setTimeout(() => {
                                const isJpeg = r.imageData.startsWith('data:image/jpeg');
                                const ext = isJpeg ? 'jpg' : 'png';
                                const link = document.createElement('a'); link.href = r.imageData; link.download = `selection-${index + 1}.${ext}`; link.click();
                            }, index * 200);
                        });
                      }} 
                      className="h-14 w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl transition-all shadow-lg shadow-blue-500/15 flex flex-col items-center justify-center active:scale-[0.94] border border-blue-400/20 group/btn"
                    >
                      <Download size={18} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-extrabold mt-1 tracking-tighter whitespace-nowrap">{t.batchDownload}</span>
                    </button>
                  </Tooltip>

                  <Tooltip content={t.tooltips.downloadZip}>
                    <button 
                      onClick={async () => {
                        if (results.length === 0) return;
                        const zip = new JSZip();
                        const folder = zip.folder("storyboards");
                        if (!folder) return;
                        
                        for (let index = 0; index < results.length; index++) {
                          const r = results[index];
                          const base64Data = r.imageData.split(',')[1];
                          const isJpeg = r.imageData.startsWith('data:image/jpeg');
                          const ext = isJpeg ? 'jpg' : 'png';
                          folder.file(`selection-${index + 1}.${ext}`, base64Data, {base64: true});
                        }
                        
                        const content = await zip.generateAsync({type:"blob"});
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = `storyboards-${Date.now()}.zip`;
                        link.click();
                      }}
                      className="h-14 w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl transition-all shadow-lg shadow-blue-500/15 flex flex-col items-center justify-center active:scale-[0.94] border border-blue-400/20 group/btn"
                    >
                      <Archive size={18} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-extrabold mt-1 tracking-tighter whitespace-nowrap">ZIP</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Global Overlays */}
      <ManualModal 
        isOpen={showManual} 
        onClose={() => setShowManual(false)} 
        lang={lang} 
        onLangChange={setLang} 
      />
      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        lang={lang}
      />
      <ExtensionExportModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        lang={lang}
      />
    </div>
  );
}
