import { BBox, Selection } from '../types';

const SNAP_THRESHOLD = 10;

export const snapValue = (value: number, targets: number[]) => {
  let closestTarget = value;
  let minDiff = SNAP_THRESHOLD + 1;

  for (const target of targets) {
    const diff = Math.abs(value - target);
    if (diff <= SNAP_THRESHOLD && diff < minDiff) {
      minDiff = diff;
      closestTarget = target;
    }
  }
  return closestTarget;
};

export const getSnapTargets = (selections: Selection[], currentId: number, canvasSize: { width: number; height: number }) => {
  const xTargets = [0, canvasSize.width];
  const yTargets = [0, canvasSize.height];

  for (const sel of selections) {
    if (sel.id === currentId) continue;
    xTargets.push(sel.bbox.x, sel.bbox.x + sel.bbox.width);
    yTargets.push(sel.bbox.y, sel.bbox.y + sel.bbox.height);
  }

  return { xTargets, yTargets };
};
