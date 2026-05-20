export type Language = 'zh' | 'en' | 'jp';
export type Theme = 'light' | 'dark';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Selection {
  id: number;
  selected: boolean;
  bbox: BBox;
  source: 'auto' | 'manual' | 'manual-grid';
}
