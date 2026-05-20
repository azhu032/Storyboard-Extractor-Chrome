import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const distDir = path.resolve(process.cwd(), 'dist');

async function zipDirectory(sourceDir, outPath) {
  const zip = new JSZip();

  function addFilesRecursively(currentDir, zipFolder) {
    const list = fs.readdirSync(currentDir);
    for (const item of list) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const nextFolder = zipFolder.folder(item);
        addFilesRecursively(itemPath, nextFolder);
      } else {
        // Skip any existing bundle ZIP to avoid zipping itself
        if (item === 'chrome-extension.zip' || item.endsWith('.zip')) {
          continue;
        }
        const fileContent = fs.readFileSync(itemPath);
        zipFolder.file(item, fileContent);
      }
    }
  }

  console.log(`Zipping contents from directory: ${sourceDir}`);
  addFilesRecursively(sourceDir, zip);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(outPath, content);
  console.log(`Successfully completed packaging directory into ZIP: ${outPath}`);
}

if (fs.existsSync(distDir)) {
  const outZipPath = path.join(distDir, 'chrome-extension.zip');
  const publicZipPath = path.resolve(process.cwd(), 'public', 'chrome-extension.zip');
  
  zipDirectory(distDir, outZipPath)
    .then(() => {
      console.log('Zip package created in dist successfully!');
      // Copy to public folder too so it's committed/exported and available over standard assets fetch
      fs.copyFileSync(outZipPath, publicZipPath);
      console.log(`Successfully backed up zip package to public: ${publicZipPath}`);
    })
    .catch((err) => {
      console.error('Failed to create ZIP package:', err);
    });
} else {
  console.error('dist directory does not exist! Please compile/build first.');
}
