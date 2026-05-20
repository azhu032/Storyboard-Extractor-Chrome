import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Let's ensure the public directory exists
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Simple and robust PNG encoder using node's native zlib
function pngEncode(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method
  
  const ihdrChunk = makeChunk('IHDR', ihdr);
  
  // IDAT chunk with deflate
  // Each row has a leading filter byte (0)
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  let srcOffset = 0;
  let destOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[destOffset++] = 0; // Filter none
    rgbaBuffer.copy(scanlines, destOffset, srcOffset, srcOffset + width * 4);
    srcOffset += width * 4;
    destOffset += width * 4;
  }
  
  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const sumBuf = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(sumBuf);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, sumBuf, crcBuf]);
}

// Simple CRC32 implementation
let crcTable;
function makeCrcTable() {
  crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }
}

function crc32(buf) {
  if (!crcTable) makeCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw elegant rounded square storyboard icon with a 3x3 layout of card components
// (highlighting the top-right selected frame in vibrant apple blue index 2)
function drawLogo(N) {
  const buf = Buffer.alloc(N * N * 4);
  
  const center = N / 2;
  const outerPad = N * 0.08;
  const cardSize = N - 2 * outerPad;
  const halfCard = cardSize / 2;
  const radius = cardSize * 0.22;
  
  // Grid coordinates inside white squircle card
  const gridInset = cardSize * 0.12;
  const gridX = outerPad + gridInset;
  const gridY = outerPad + gridInset;
  const gridW = cardSize - 2 * gridInset;
  const gridH = cardSize - 2 * gridInset;
  
  const spacing = Math.max(0.5, N * 0.035);
  const cellW = (gridW - 2 * spacing) / 3;
  const cellH = (gridH - 2 * spacing) / 3;
  
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const idx = (y * N + x) * 4;
      
      const dx = Math.abs(x + 0.5 - center);
      const dy = Math.abs(y + 0.5 - center);
      
      if (dx > halfCard || dy > halfCard) {
        // Transparent margins outer background
        buf[idx] = 0; buf[idx+1] = 0; buf[idx+2] = 0; buf[idx+3] = 0;
        continue;
      }
      
      // Rounded outer squircle check
      let isOutside = false;
      let alpha = 255;
      if (dx > halfCard - radius && dy > halfCard - radius) {
        const cx = halfCard - radius;
        const cy = halfCard - radius;
        const dist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
        if (dist > radius) {
          isOutside = true;
        } else if (dist > radius - 1) {
          // Soft anti-aliasing on card rounded corner limits
          alpha = Math.max(0, Math.min(255, Math.round((radius - dist) * 255)));
        }
      }
      
      if (isOutside) {
        buf[idx] = 0; buf[idx+1] = 0; buf[idx+2] = 0; buf[idx+3] = 0;
        continue;
      }
      
      // Soft Slate border of 1px thickness around the squircle to make it look premium
      const distFromEdge = halfCard - Math.max(dx, dy);
      let isBorder = false;
      if (dx > halfCard - radius && dy > halfCard - radius) {
        const cx = halfCard - radius;
        const cy = halfCard - radius;
        const dist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
        if (dist > radius - 1 && dist <= radius) {
          isBorder = true;
        }
      } else if (distFromEdge >= 0 && distFromEdge < 0.8) {
        isBorder = true;
      }
      
      if (isBorder) {
        buf[idx] = 210; buf[idx+1] = 210; buf[idx+2] = 215; buf[idx+3] = alpha;
        continue;
      }
      
      // Inside white container check if we are on a grid cell
      const gx = x + 0.5 - gridX;
      const gy = y + 0.5 - gridY;
      
      if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
        const col = Math.floor(gx / (cellW + spacing));
        const row = Math.floor(gy / (cellH + spacing));
        
        const cellXStart = col * (cellW + spacing);
        const cellYStart = row * (cellH + spacing);
        const inCellX = (gx - cellXStart) < cellW;
        const inCellY = (gy - cellYStart) < cellH;
        
        if (col >= 0 && col < 3 && row >= 0 && row < 3 && inCellX && inCellY) {
          if (row === 0 && col === 2) {
            // Bright highlight blue frame representing the active selected storyboard item (Logo.tsx top right block)
            buf[idx] = 0; buf[idx+1] = 113; buf[idx+2] = 227; buf[idx+3] = alpha;
          } else {
            // Unselected normal storyboard boxes (light sleek grey)
            buf[idx] = 229; buf[idx+1] = 229; buf[idx+2] = 234; buf[idx+3] = alpha;
          }
          continue;
        }
      }
      
      // Default: Pure smooth white container backing
      buf[idx] = 255; buf[idx+1] = 255; buf[idx+2] = 255; buf[idx+3] = alpha;
    }
  }
  
  return buf;
}

// Generate the sizes
function writeIcon(filename, size) {
  const filePath = path.join(publicDir, filename);
  const rgbaBuffer = drawLogo(size);
  const pngBuffer = pngEncode(size, size, rgbaBuffer);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Generated perfect modern adaptive 3x3 storyboard logo: ${filePath} (${size}x${size})`);
}

writeIcon('icon16.png', 16);
writeIcon('icon48.png', 48);
writeIcon('icon128.png', 128);

console.log('Successfully completed building pixel-perfect popup storyboard icons matching app Logo!');
