import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Puzzle, ArrowRight, Download, Terminal, Settings, Layers, AppWindow, ExternalLink, HelpCircle } from 'lucide-react';
import JSZip from 'jszip';

interface ExtensionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en' | 'jp';
}

export default function ExtensionExportModal({ isOpen, onClose, lang }: ExtensionExportModalProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'adaptation'>('guide');

  const content = {
    zh: {
      title: '谷歌浏览器 (Chrome) 插件指南',
      subTitle: '只需 1 步构建，点击插件按钮直接在弹出窗中高速运行',
      tabGuide: '安装与加载步骤',
      tabAdapt: '插件自适应优化',
      step1Title: '1. 本地打包构建',
      step1Desc: '在项目目录下执行命令，打包出用于浏览器的静态资源文件：',
      step2Title: '2. 打开 Chrome 扩展页面',
      step2Desc: '在谷歌浏览器地址栏输入并访问以下网址：',
      step3Title: '3. 启用开发者模式',
      step3Desc: '在扩展程序页面右上角，找到并开启“开发者模式” (Developer mode) 开关。',
      step4Title: '4. 加载 unpacked 文件夹',
      step4Desc: '点击左上角“加载已解压的扩展程序” (Load unpacked) 按钮，并选择本项目打包生成的 dist 文件夹：',
      step5Title: '5. 完成安装并使用',
      step5Desc: '在 Chrome 右上角点击“拼图 / 插件”图标，把“分镜提取器”固定到工具栏。点击即可在 800×600 精美弹出窗内全功能、高性能流畅运行！',
      downloadBtn: '下载已打包好浏览器插件 (.zip)',
      downloadSuccess: '下载成功！内含 manifest.json、图标、编译代码及说明文档。',
      adapTitle: '专为浏览器插件弹出窗 (Popup) 优化',
      adapDesc: '为了在浏览器弹出窗 800×600 的黄金尺寸内保持高效的设计/裁切体验，本工具已自动启用最先进的“折叠式抽屉布局”：',
      adapPt1: '智能侧边栏：在 1100px 以下的分辨率或插件运行环境，侧边栏会自动折叠隐藏，不遮挡主画布。',
      adapPt2: '悬浮式抽屉：点击顶部按钮即可拉出“分镜识别配置”和“结果库”，操作完自动悬浮，释放最大视野。',
      adapPt3: '视口无损平移缩放：主图片支持鼠标中键/双指平移，滚轮无限缩放，并有“最大化 / 适配画布”一键重置，轻松应对小屏编辑。',
      links: '官方文档与反馈',
      linksDesc: '加载插件时有任何疑问，可参考 Chrome 官方扩展文档。项目由 @azhu_032 高清定制。',
      copied: '已复制网址'
    },
    en: {
      title: 'Chrome Extension Guide',
      subTitle: 'Run seamlessly in a beautiful browser popup with just 1 step',
      tabGuide: 'Installation Steps',
      tabAdapt: 'Responsive Optimizations',
      step1Title: '1. Local Production Build',
      step1Desc: 'Run the build command in the project directory to compile static assets for the extension:',
      step2Title: '2. Open Chrome Extension Management',
      step2Desc: 'Type and enter the following URL in your Chrome address bar:',
      step3Title: '3. Enable Developer Mode',
      step3Desc: 'In the top-right corner of the Extensions page, toggle the "Developer mode" switch to ON.',
      step4Title: '4. Load Unpacked Folder',
      step4Desc: 'Click "Load unpacked" in the top-left corner and select the compiled dist folder inside your project:',
      step5Title: '5. Ready to Go!',
      step5Desc: 'Click the Puzzle icon in the top-right of Chrome, pin "Storyboard Extractor", and tap the icon to run it on-demand in a lightweight, beautiful 800×600 popup window!',
      downloadBtn: 'Download Bundled Chrome Extension (.zip)',
      downloadSuccess: 'Download succeeded! Contains compiled extension bundles, manifest.json, icons, and instructions.',
      adapTitle: 'Engineered for Extension Popup Window',
      adapDesc: 'To ensure perfect utility and comfort inside Chrome\'s maximum 800×600 popup dimensions, the app automatically adapts:',
      adapPt1: 'Smart Sidebars: When the viewpoint is compact or extension-rendered, the panels collapse automatically to save canvas estate.',
      adapPt2: 'Floating Drawers: Tap the top panel actions to slides left/right sidebars over the canvas as absolute overlays.',
      adapPt3: 'Perfect Canvas Fit: Smooth mouse middle-drag pan and scroll zoom with a responsive "Fit Canvas" control.',
      links: 'Official Resources & Feedback',
      linksDesc: 'For more about Chrome browser extension development, check the developer guides. Built by @azhu_032.',
      copied: 'URL Copied'
    },
    jp: {
      title: 'Chrome 拡張機能（ポップアップ）ガイド',
      subTitle: '簡単な1ステップ、ポップアップウィンドウで直接高速動作',
      tabGuide: 'インストール方法',
      tabAdapt: 'ポップアップ最適化',
      step1Title: '1. ローカルでのビルド',
      step1Desc: 'プロジェクトディレクトリで次のコマンドを実行して、静的ファイルをビルドします：',
      step2Title: '2. 拡張プログラム画面を開く',
      step2Desc: 'ブラウザの検索バーに次のURLを入力してアクセスします：',
      step3Title: '3. デベロッパーモードを有効にする',
      step3Desc: '拡張画面の右上にある「デベロッパーモード」のスイッチをONにします。',
      step4Title: '4. unpacked フォルダーを読み込む',
      step4Desc: '左上の「パッケージ化されていない拡張機能を読み込む」ボタンをクリックし、dist フォルダーを選択します：',
      step5Title: '5. これで準備完了！',
      step5Desc: 'Chrome 右上のパズルアイコンからこのツールを固定し、アイコンをクリックするだけで 800×600 の便利なポップアップ内で高速稼働します！',
      downloadBtn: '完成済み拡張機能パッケージのダウンロード (.zip)',
      downloadSuccess: 'ダウンロード完了！ビルドコード、manifest.jsonとアイコンが入っています。',
      adapTitle: 'ポップアップウィンドウの使い勝手向上',
      adapDesc: 'Chrome ポップアップの制限サイズ（最大 800×600）に適合するよう、自動的に「オーバーレイドロワー」に変化します：',
      adapPt1: 'スマート格納：表示幅が 1100px 以下のとき、サイドパネルが隠れ、中央のキャンバス領域を最大化します。',
      adapPt2: 'フローティング：ヘッダーのトグルボタンで左右のコントロールをドロワー形式で重ね、軽快に操作できます。',
      adapPt3: 'ズームとパン：ホイール拡大・縮小、中キードラッグでのスクロール、フィットボタンで表示領域をリセットできます。',
      links: '公式ドキュメント',
      linksDesc: 'インストールの詳細については、Chrome デベロッパー用のドキュメントをご参照ください。azhu_032 によるカスタム開発。',
      copied: 'URLをコピーしました'
    }
  }[lang];

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert(content.copied + ': ' + url);
  };

  const handleDownloadBackup = async () => {
    try {
      // First attempt to fetch the complete, compiled production extension package built by our server/Vite script
      const res = await fetch('chrome-extension.zip?t=' + Date.now());
      if (!res.ok) {
        throw new Error('Prepackaged server-side zip not found. Falling back to dynamic local packaging.');
      }
      
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `storyboard-extractor-extension-${Date.now()}.zip`;
      link.click();
      alert(lang === 'zh' 
        ? '已成功下载完整的浏览器插件包！请解压后通过 "加载已解压的扩展程序(Load unpacked)" 倒入谷歌浏览器中启用。' 
        : lang === 'jp'
        ? '拡張機能パッケージのダウンロードが完了しました！解凍してから「パッケージ化されていない拡張機能を読み込む」でChromeに読み込んでください。'
        : 'Successfully downloaded fully packaged extension! Deflate and load inside Google Chrome via "Load unpacked".'
      );
    } catch (err) {
      console.warn('Prepackaged zip download failed, running client-side fallbacks:', err);
      const zip = new JSZip();
 
      // Fetch manifest json
      try {
        const manifestRes = await fetch('manifest.json');
        const manifestText = await manifestRes.text();
        zip.file('manifest.json', manifestText);
      } catch {
        zip.file('manifest.json', JSON.stringify({
          "manifest_version": 3,
          "name": "Remix: 分镜提取器2.4",
          "version": "2.4.0",
          "description": "谷歌浏览器插件：快速从草稿或任意图片中自动识别、裁剪、自定义排序并组合分镜图。",
          "action": {
            "default_popup": "index.html"
          },
          "permissions": ["activeTab", "clipboardWrite"],
          "icons": { "16": "icon16.png", "48": "icon48.png", "128": "icon128.png" }
        }, null, 2));
      }
 
      // Fetch the icons as Base64/blobs
      const sizes = [16, 48, 128];
      for (const size of sizes) {
        try {
          const iconRes = await fetch(`icon${size}.png`);
          const iconBlob = await iconRes.blob();
          zip.file(`icon${size}.png`, iconBlob);
        } catch (err2) {
          console.warn('Could not fetch icon blob, carrying on fallback text', err2);
        }
      }

      // Add a helper README.md
      const readmeContent = `# Storyboard Extractor Chrome Extension Backup Bundle

## Steps to install unpacked extension:
1. Copy \`manifest.json\` and the icons (\`icon16.png\`, \`icon48.png\`, \`icon128.png\`) to your \`dist\` directory or project public folder.
2. Build the project using: \`npm run build\`
3. Go to Chrome -> \`chrome://extensions/\`
4. Enable "Developer mode" in the top-right.
5. Click "Load unpacked" and select the \`dist\` output folder.
6. Voila! Run Storyboard Extractor in a super crisp browser popup window.
`;
      zip.file('README.md', readmeContent);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `chrome-extension-config-${Date.now()}.zip`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center pointer-events-none p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md pointer-events-auto"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-white dark:bg-[#1c1c1e] w-full max-w-3xl h-[620px] rounded-3xl shadow-[0_45px_120px_rgba(0,0,0,0.3)] border border-[#d2d2d7] dark:border-[#333333] flex flex-col overflow-hidden pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="h-[75px] border-b border-[#d2d2d7] dark:border-[#333333] flex items-center justify-between px-6 shrink-0 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0071e3]/10 text-[#0071e3] rounded-2xl">
                <Puzzle size={24} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-[17px] font-extrabold tracking-tight">{content.title}</h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{content.subTitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex px-6 border-b border-[#d2d2d7] dark:border-[#333333] shrink-0 bg-white dark:bg-[#1c1c1e] z-10 gap-4">
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 text-[13px] font-bold border-b-2 transition-all relative flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'border-[#0071e3] text-[#0071e3]'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Layers size={14} />
              {content.tabGuide}
            </button>
            <button
              onClick={() => setActiveTab('adaptation')}
              className={`py-3 text-[13px] font-bold border-b-2 transition-all relative flex items-center gap-1.5 ${
                activeTab === 'adaptation'
                  ? 'border-[#0071e3] text-[#0071e3]'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <AppWindow size={14} />
              {content.tabAdapt}
            </button>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'guide' ? (
              <div className="space-y-6">
                {/* Custom Instruction Box */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
                  <Terminal size={18} className="text-[#0071e3] shrink-0 mt-0.5" />
                  <div className="text-[12px] leading-relaxed text-[#0071e3] dark:text-blue-300">
                    <strong>提示：</strong>本项目的 <code>public/manifest.json</code> 已经配置成功，并在 <code>vite.config.ts</code> 中完成了相对路径 base 适配。执行线上或本地 build 时，构建产物将能<strong>自适应在任意标准浏览器插件 popup 中完全展现运行</strong>。
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl space-y-3">
                    <span className="text-[13px] font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-white">
                      <Settings size={15} className="text-[#0071e3]" />
                      {content.step1Title}
                    </span>
                    <p className="text-[12px] opacity-60 leading-relaxed">{content.step1Desc}</p>
                    <div className="bg-gray-100 dark:bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-[#0071e3] flex justify-between items-center group">
                      <span>npm run build</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText('npm run build')}
                        className="text-[9px] font-sans font-bold uppercase hover:underline opacity-40 group-hover:opacity-100"
                      >
                        {lang === 'zh' ? '复制' : 'copy'}
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl space-y-3">
                    <span className="text-[13px] font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-white">
                      <ExternalLink size={15} className="text-[#0071e3]" />
                      {content.step2Title}
                    </span>
                    <p className="text-[12px] opacity-60 leading-relaxed">{content.step2Desc}</p>
                    <div 
                      onClick={() => handleCopyUrl('chrome://extensions/')}
                      className="bg-gray-100 dark:bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-gray-500 dark:text-gray-300 hover:text-[#0071e3] cursor-pointer flex justify-between items-center group"
                    >
                      <span>chrome://extensions/</span>
                      <span className="text-[9px] font-sans font-bold uppercase hover:underline opacity-40 group-hover:opacity-100">
                        {lang === 'zh' ? '复制' : 'copy'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl space-y-2">
                    <span className="text-[13px] font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-white">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">✓</div>
                      {content.step3Title}
                    </span>
                    <p className="text-[12px] opacity-60 leading-relaxed">{content.step3Desc}</p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl space-y-2">
                    <span className="text-[13px] font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-white">
                      <Download size={15} className="text-[#0071e3]" />
                      {content.step4Title}
                    </span>
                    <p className="text-[12px] opacity-60 leading-relaxed">{content.step4Desc}</p>
                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] text-yellow-600 dark:text-yellow-400">
                      <strong>/dist</strong> (由项目编译生成的静态打包文件夹)
                    </div>
                  </div>
                </div>

                {/* Final step highlight */}
                <div className="p-4.5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl border border-blue-500/10 dark:border-white/5 flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#0071e3] to-purple-500 flex items-center justify-center text-white font-extrabold shadow-lg shrink-0 text-lg">
                    ★
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">{content.step5Title}</h4>
                    <p className="text-[11.5px] opacity-60 leading-relaxed mt-0.5">{content.step5Desc}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3.5">
                  <h3 className="text-[15px] font-extrabold tracking-tight flex items-center gap-2">
                    <AppWindow size={16} className="text-[#0071e3]" />
                    {content.adapTitle}
                  </h3>
                  <p className="text-[12.5px] opacity-60 leading-relaxed">
                    {content.adapDesc}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#0071e3] shrink-0 mt-2" />
                      <p className="text-[13px] leading-relaxed opacity-80">{content.adapPt1}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#0071e3] shrink-0 mt-2" />
                      <p className="text-[13px] leading-relaxed opacity-80">{content.adapPt2}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#0071e3] shrink-0 mt-2" />
                      <p className="text-[13px] leading-relaxed opacity-80">{content.adapPt3}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-2">{content.links}</span>
                  <p className="text-[12px] opacity-50 leading-relaxed mb-4">{content.linksDesc}</p>
                  <a 
                    href="https://developer.chrome.com/docs/extensions" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0071e3] hover:underline"
                  >
                    Chrome Extension Documentation
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="h-[75px] border-t border-[#d2d2d7] dark:border-[#333333] shrink-0 px-6 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
            <span className="text-[11px] opacity-40 font-mono">Unpacked Folder Build Compatible v2.4</span>
            <button
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-[13px] font-extrabold flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-95 transition-all"
            >
              <Download size={15} />
              {content.downloadBtn}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
