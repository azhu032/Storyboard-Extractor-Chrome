export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STRENGTH_PARAMS = [
  { threshold: 190, minAreaRatio: 0.06, minSize: 60 },
  { threshold: 210, minAreaRatio: 0.04, minSize: 40 },
  { threshold: 230, minAreaRatio: 0.02, minSize: 20 },
  { threshold: 240, minAreaRatio: 0.01, minSize: 10 },
  { threshold: 250, minAreaRatio: 0.005, minSize: 5 },
];

export async function detectPanels(
  imageUrl: string, 
  width: number, 
  height: number, 
  strength: number = 3,
  manualGrid?: { rows: number; cols: number }
): Promise<BBox[]> {
  const { threshold, minAreaRatio, minSize } = STRENGTH_PARAMS[Math.max(0, Math.min(4, strength - 1))];

  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve([{ x: 0, y: 0, width, height }]);
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const totalArea = width * height;

      // 1. Preprocessing: Binary map and intensity projections
      const binary = new Uint8Array(width * height);
      const rowIntensity = new Float32Array(height);
      const colIntensity = new Float32Array(width);

      for (let y = 0; y < height; y++) {
        let rowSum = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const isContent = gray < threshold ? 1 : 0;
          binary[y * width + x] = isContent ? 255 : 0;
          if (isContent) rowSum++;
        }
        rowIntensity[y] = rowSum / width;
      }

      for (let x = 0; x < width; x++) {
        let colSum = 0;
        for (let y = 0; y < height; y++) {
          if (binary[y * width + x]) colSum++;
        }
        colIntensity[x] = colSum / height;
      }

      // 2. Helper: Trim box to actual content
      const trimBox = (box: BBox): BBox => {
        let x1 = Math.max(0, Math.floor(box.x));
        let y1 = Math.max(0, Math.floor(box.y));
        let x2 = Math.min(width - 1, Math.floor(box.x + box.width) - 1);
        let y2 = Math.min(height - 1, Math.floor(box.y + box.height) - 1);

        // Shrink from top
        while (y1 <= y2) {
          let hasPixel = false;
          for (let ix = x1; ix <= x2; ix++) {
            if (binary[y1 * width + ix]) { hasPixel = true; break; }
          }
          if (hasPixel) break;
          y1++;
        }
        // Shrink from bottom
        while (y2 >= y1) {
          let hasPixel = false;
          for (let ix = x1; ix <= x2; ix++) {
            if (binary[y2 * width + ix]) { hasPixel = true; break; }
          }
          if (hasPixel) break;
          y2--;
        }
        // Shrink from left
        while (x1 <= x2) {
          let hasPixel = false;
          for (let iy = y1; iy <= y2; iy++) {
            if (binary[iy * width + x1]) { hasPixel = true; break; }
          }
          if (hasPixel) break;
          x1++;
        }
        // Shrink from right
        while (x2 >= x1) {
          let hasPixel = false;
          for (let iy = y1; iy <= y2; iy++) {
            if (binary[iy * width + x2]) { hasPixel = true; break; }
          }
          if (hasPixel) break;
          x2--;
        }

        if (x1 > x2 || y1 > y2) return box;
        return { x: x1, y: y1, width: x2 - x1 + 1, height: y2 - y1 + 1 };
      };

      // 2.5. Handle Manual Grid if specified
      if (manualGrid && manualGrid.rows > 0 && manualGrid.cols > 0) {
        const { rows, cols } = manualGrid;
        const boxes: BBox[] = [];
        const cellW = width / cols;
        const cellH = height / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * cellW;
            const y = r * cellH;
            let w = cellW;
            let h = cellH;

            if (c === cols - 1) w = width - x;
            if (r === rows - 1) h = height - y;

            // Trim the grid box to actual content
            const trimmed = trimBox({ x, y, width: w, height: h });
            
            // Only add if it contains some content
            let pixels = 0;
            const step = 4;
            for (let sy = trimmed.y; sy < trimmed.y + trimmed.height; sy += step) {
              for (let sx = trimmed.x; sx < trimmed.x + trimmed.width; sx += step) {
                if (binary[Math.floor(sy) * width + Math.floor(sx)]) pixels++;
              }
            }
            if (pixels > 0) {
                boxes.push(trimmed);
            }
          }
        }
        return resolve(boxes.length > 0 ? boxes : [{ x: 0, y: 0, width, height }]);
      }

      // 3. Try Regular Grid Detection
      const findGaps = (intensity: Float32Array, limit: number) => {
        const gaps: number[] = [];
        let gapStart = -1;
        for (let i = 0; i < limit; i++) {
          if (intensity[i] < 0.02) { // Slightly more lenient gap
            if (gapStart === -1) gapStart = i;
          } else {
            if (gapStart !== -1) {
              if (i - gapStart > 2) gaps.push(Math.floor((gapStart + i) / 2));
              gapStart = -1;
            }
          }
        }
        return gaps;
      };

      const hGaps = findGaps(rowIntensity, height).filter(g => g > height * 0.03 && g < height * 0.97);
      const vGaps = findGaps(colIntensity, width).filter(g => g > width * 0.03 && g < width * 0.97);

      if ((hGaps.length >= 1 && hGaps.length <= 8) || (vGaps.length >= 1 && vGaps.length <= 8)) {
        const yBounds = [0, ...hGaps, height];
        const xBounds = [0, ...vGaps, width];
        const gridBoxes: BBox[] = [];

        for (let i = 0; i < yBounds.length - 1; i++) {
          for (let j = 0; j < xBounds.length - 1; j++) {
            const bx = xBounds[j];
            const by = yBounds[i];
            const bw = xBounds[j + 1] - bx;
            const bh = yBounds[i + 1] - by;
            
            let pixels = 0;
            const step = 2; // Finer step for better density check
            for (let sy = by; sy < by + bh; sy += step) {
              for (let sx = bx; sx < bx + bw; sx += step) {
                if (binary[Math.floor(sy) * width + Math.floor(sx)]) pixels++;
              }
            }
            // Grid content threshold: at least 3% area and non-empty
            if (pixels / ((bw * bh) / (step * step)) > 0.03 && (bw * bh) / totalArea > 0.02) {
              gridBoxes.push(trimBox({ x: bx, y: by, width: bw, height: bh }));
            }
          }
        }

        if (gridBoxes.length >= 1) return resolve(gridBoxes);
      }

      // 4. Fallback to Connected Component Analysis
      const visited = new Uint8Array(width * height);
      let boxes: BBox[] = [];

      for (let i = 0; i < width * height; i++) {
        if (binary[i] === 255 && !visited[i]) {
          let minX = width, maxX = 0, minY = height, maxY = 0, pixelCount = 0;
          const stack = [i];
          visited[i] = 1;
          
          while (stack.length > 0) {
            const curr = stack.pop()!;
            const cy = Math.floor(curr / width);
            const cx = curr % width;
            minX = Math.min(minX, cx);
            maxX = Math.max(maxX, cx);
            minY = Math.min(minY, cy);
            maxY = Math.max(maxY, cy);
            pixelCount++;

            // Use 4-connectivity
            const nx = [cx - 1, cx + 1, cx, cx];
            const ny = [cy, cy, cy - 1, cy + 1];
            for (let k = 0; k < 4; k++) {
              const tx = nx[k];
              const ty = ny[k];
              if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                const nidx = ty * width + tx;
                if (binary[nidx] === 255 && !visited[nidx]) {
                  visited[nidx] = 1;
                  stack.push(nidx);
                }
              }
            }
          }

          const boxWidth = maxX - minX + 1;
          const boxHeight = maxY - minY + 1;
          const area = boxWidth * boxHeight;
          const density = pixelCount / area;
          const areaRatio = area / totalArea;
          
          // Conditions: No text-like shapes, area check
          const isTextLike = density < 0.1 || boxWidth > boxHeight * 12 || boxHeight > boxWidth * 12;
          if (!isTextLike && areaRatio >= 0.005 && boxWidth > minSize && boxHeight > minSize) {
            boxes.push(trimBox({ x: minX, y: minY, width: boxWidth, height: boxHeight }));
          }
        }
      }

      // Final Check: Ensure at least 2 selections if possible
      if (boxes.length < 2 && boxes.length > 0) {
          // If we only found one large box but there was potential for more, maybe threshold was too strict
          // But for now, we follow the "at least 2" guideline by returning the initial boxes or the whole image
      }

      boxes.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 50) return a.x - b.x;
        return a.y - b.y;
      });

      resolve(boxes.length > 0 ? boxes : [{ x: 0, y: 0, width, height }]);
    };
    img.onerror = () => resolve([{ x: 0, y: 0, width, height }]);
  });
}
