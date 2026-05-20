export interface Translation {
  title: string;
  lang: string;
  theme: string;
  upload: string;
  startRecognition: string;
  addSelection: string;
  manualAdd: string;
  selectAll: string;
  deselectAll: string;
  clear: string;
  reorder: string;
  settings: string;
  resolution: string;
  original: string;
  manual: string;
  manualModal: {
    title: string;
    lang: string;
    prev: string;
    next: string;
    close: string;
    pages: Array<{
      title: string;
      content: string[];
    }>;
  };
  process: string;
  recognition: string;
  panelStrength: string;
  gridSettings: string;
  reset: string;
  rows: string;
  columns: string;
  exitDeleteMode: string;
  enterDeleteMode: string;
  noResults: string;
  emptyStateHeader: string;
  emptyStateBody: string;
  uploadButton: string;
  pasteHint: string;
  download: string;
  copy: string;
  delete: string;
  copied: string;
  hideSidebar: string;
  showSidebar: string;
  hideLibrary: string;
  showLibrary: string;
  downloadZip: string;
  results: string;
  batchDownload: string;
  combine: string;
  tooltips: {
    lang: string;
    theme: string;
    upload: string;
    startRecognition: string;
    manualAdd: string;
    selectAll: string;
    deselectAll: string;
    clear: string;
    reorder: string;
    deleteMode: string;
    strength: string;
    rows: string;
    cols: string;
    resolution: string;
    process: string;
    generate: string;
    downloadZip: string;
    resetZoom: string;
    preview: string;
    batchDownload: string;
    clearGrid: string;
    combine: string;
  };
}

export const TRANSLATIONS: Record<string, Translation> = {
  zh: {
    title: '分镜提取器',
    lang: '中文',
    theme: '模式',
    upload: '图像输入',
    startRecognition: '开始分镜识别',
    addSelection: '新增选区',
    manualAdd: '选区编辑',
    selectAll: '全选',
    deselectAll: '全不选',
    clear: '清空',
    reorder: '重排序',
    settings: '处理设置',
    resolution: '输出分辨率',
    original: '原图',
    manual: '说明书',
    manualModal: {
      title: '分镜提取工具 - 使用指南',
      lang: '切换语言',
      prev: '上一页',
      next: '下一页',
      close: '关闭',
      pages: [
        {
          title: '1. 快速入门',
          content: [
            '• 使用顺序（基础）：上传图片→开始分镜识别→开始处理→下载（复制）分镜图片',
            '• 上传图片：点击左侧“图像输入”或粘贴图片 (Ctrl+V)。',
            '• 画布操作：滚轮缩放，中键或拖动空白处平移。',
            '• 视图复位：点击底部浮动栏的“最大化”按钮可重置视图。',
          ]
        },
        {
          title: '2. 选区管理',
          content: [
            '• 新增选区：双击画布空白处或点击左侧“新增选区”。',
            '• 单击选中：单击选区可切换选中状态，蓝色为选中。',
            '• 拖动复制：按住 Alt 键拖动已选中选区可快速复制。',
            '• 删除选区：点击选中选区（变蓝）后，点击左侧“删除选中”按钮，或直接双击选区。',
          ]
        },
        {
          title: '3. 智能识别',
          content: [
            '• 自动检测：点击“开始分镜识别”根据内容智能划分选区。',
            '• 识别强度：强度越高，识别出的分镜边界越敏感。',
            '• 规则宫格：若分镜为标准行列布局，可填入行列数后识别。',
          ]
        },
        {
          title: '4. 输出导出',
          content: [
            '• 分辨率：支持原图及1k/2k等比放大导出。',
            '• 开始处理：将选中项裁剪并生成结果到右侧库。',
            '• 一键组合：将库中所有图按顺序拼接为一张大图并下载。',
            '• 库操作：单击预览大图，拖动调整顺序。',
          ]
        },
        {
          title: '5. 声明',
          content: [
            '• 使用本工具处理图像，即表示同意工具可以对上传内容进行必要处理。本工具仅限合法用途（如个人作品或已授权素材）。用户需确保素材符合版权规定，并对使用本工具产生的后果负责。本工具及作者不承担未经授权使用或修改的责任。作者保留对软件及生成内容进行合法追溯和保护的权利。',
            '• 作者X (Twitter)：@azhu_032'
          ]
        }
      ]
    },
    process: '开始处理',
    recognition: '分镜识别',
    panelStrength: '分镜检测强度',
    gridSettings: '规则宫格 (可选)',
    reset: '重置',
    rows: '行数',
    columns: '列数',
    exitDeleteMode: '退出删除模式',
    enterDeleteMode: '删除选中',
    noResults: '暂无结果',
    emptyStateHeader: '准备好开始了？',
    emptyStateBody: '上传一张包含多个分镜的草稿或图片。我们将帮助你快速识别、切分并按需排列它们。',
    uploadButton: '本地上传',
    pasteHint: 'Ctrl+V 粘贴剪切板图像',
    download: '下载',
    copy: '复制',
    delete: '删除',
    copied: '已复制',
    hideSidebar: '收起侧边栏',
    showSidebar: '展开侧边栏',
    hideLibrary: '收起库',
    showLibrary: '展开库',
    downloadZip: '下载全部 ZIP',
    results: '处理结果库',
    batchDownload: '批量下载',
    combine: '一键组合',
    tooltips: {
      lang: '切换语言',
      theme: '切换亮色/深色模式',
      upload: '点击上传图片，或按 Ctrl+V 粘贴图片',
      startRecognition: '自动识别图片中的分镜并建立选区',
      manualAdd: '手动添加一个新的分镜选区',
      selectAll: '选中当前所有分镜选区',
      deselectAll: '取消选中所有分镜选区',
      clear: '删除当前所有分镜选区',
      reorder: '按从上到下、从左到右重新编号选区',
      deleteMode: '删除当前在画布中选中的分镜选区',
      strength: '调整分镜识别强度，数值越高越容易识别更多分镜',
      rows: '输入规则宫格分镜的行数',
      cols: '输入规则宫格分镜的列数',
      resolution: '选择导出图像的分辨率',
      process: '根据当前选区裁剪并处理分镜图像',
      generate: '生成右侧预览图结果',
      downloadZip: '将当前结果打包下载为 ZIP 文件',
      resetZoom: '将图片恢复到最适合当前画布的显示状态',
      preview: '单击查看大图，拖拽调整顺序，可下载/复制',
      batchDownload: '批量下载当前预览结果',
      clearGrid: '清空宫格行数列数',
      combine: '将当前结果按顺序组合成一张网格图并下载',
    }
  },
  en: {
    title: 'Storyboard Extractor',
    lang: 'English',
    theme: 'Theme',
    upload: 'Image Input',
    startRecognition: 'Start Recognition',
    addSelection: 'Add Selection',
    manualAdd: 'Selection Edit',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    clear: 'Clear',
    reorder: 'Reorder',
    settings: 'Settings',
    resolution: 'Resolution',
    original: 'Original',
    manual: 'Manual',
    manualModal: {
      title: 'Guide',
      lang: 'Language',
      prev: 'Prev',
      next: 'Next',
      close: 'Close',
      pages: [
        {
          title: '1. Basics',
          content: [
            '• Core Workflow: Upload → Start Recognition → Process → Download (or Copy) Storyboards',
            '• Upload: Click "Image Input" or paste (Ctrl+V).',
            '• Canvas: Wheel to zoom, Middle-click or drag background to pan.',
            '• Reset View: Click "Maximize" in the bottom bar.',
          ]
        },
        {
          title: '2. Selection',
          content: [
            '• Add: Double-click canvas or click "Add Selection".',
            '• Select: Click to toggle (blue means selected).',
            '• Duplicate: Alt + drag a selected box.',
            '• Delete: Select a box (turns blue) then click "Delete Selected", or double-click to delete directly.',
          ]
        },
        {
          title: '3. Recognition',
          content: [
            '• Auto: Click "Start Recognition" to detect panels.',
            '• Strength: Sensitivity of edge detection.',
            '• Grid: Specify rows/cols for perfect grid layouts.',
          ]
        },
        {
          title: '4. Output',
          content: [
            '• Resolution: Original or 1k/2k (with upscale).',
            '• Process: Crop selected items to the library.',
            '• Combine: Stitch all results into one big grid image.',
            '• Library: Click to preview, drag to sort.',
          ]
        },
        {
          title: '5. Disclaimer',
          content: [
            '• By using this tool to process images, you agree that we may perform necessary processing on your uploaded content. This tool is strictly limited to legal uses (such as personal creations or authorized materials). Users must ensure compliance with copyright laws and assume all consequences for using this tool. The tool and the author accept no liability for unauthorized use or modification. The author reserves all rights to legally trace and protect the software and its generated content.',
            '• Author X (Twitter): @azhu_032'
          ]
        }
      ]
    },
    process: 'Process',
    recognition: 'Recognition',
    panelStrength: 'Panel Strength',
    gridSettings: 'Rule Grid (Optional)',
    reset: 'Reset',
    rows: 'Rows',
    columns: 'Cols',
    exitDeleteMode: 'Exit Delete Mode',
    enterDeleteMode: 'Delete Selected',
    noResults: 'No Results',
    emptyStateHeader: 'Ready to start?',
    emptyStateBody: "Upload a sketch or image with multiple storyboards. We'll help you recognize, split, and arrange them.",
    uploadButton: 'Local Upload',
    pasteHint: '(Ctrl+V Paste clipboard image)',
    download: 'Download',
    copy: 'Copy',
    delete: 'Delete',
    copied: 'Copied',
    hideSidebar: 'Hide Sidebar',
    showSidebar: 'Show Sidebar',
    hideLibrary: 'Hide Library',
    showLibrary: 'Show Library',
    downloadZip: 'Download ZIP',
    results: 'Results Library',
    batchDownload: 'Batch Download',
    combine: 'Combine All',
    tooltips: {
      lang: 'Switch Language',
      theme: 'Toggle Light/Dark Mode',
      upload: 'Click to upload or Ctrl+V to paste',
      startRecognition: 'Automatically identify panels and create selections',
      manualAdd: 'Manually add a new storyboard selection',
      selectAll: 'Select all current storyboard selections',
      deselectAll: 'Deselect all storyboard selections',
      clear: 'Delete all current storyboard selections',
      reorder: 'Renumber selections from top to bottom, left to right',
      deleteMode: 'Delete currently selected storyboard selections',
      strength: 'Adjust recognition strength; higher values find more panels',
      rows: 'Number of rows for regular grid layout',
      cols: 'Number of columns for regular grid layout',
      resolution: 'Select output image resolution',
      process: 'Crop and process storyboard images based on selections',
      generate: 'Generate preview results on the right',
      downloadZip: 'Pack current results into a ZIP file',
      resetZoom: 'Restore image to fit current canvas',
      preview: 'Click for full view, drag to reorder, actions available',
      batchDownload: 'Batch download current previews',
      clearGrid: 'Clear grid row/column count',
      combine: 'Combine current results into a single grid image and download',
    }
  },
  jp: {
    title: '絵コンテ抽出器',
    lang: '日本語',
    theme: 'テーマ',
    upload: '画像入力',
    startRecognition: '抽出を開始',
    addSelection: '選択範囲を追加',
    manualAdd: '選択範囲編集',
    selectAll: 'すべて選択',
    deselectAll: '選択解除',
    clear: 'クリア',
    reorder: '再並べ替え',
    settings: '処理設定',
    resolution: '出力解像度',
    original: 'オリジナル',
    manual: '説明書',
    manualModal: {
      title: 'ガイド',
      lang: '言語切り替え',
      prev: '前へ',
      next: '次へ',
      close: '閉じる',
      pages: [
        {
          title: '1. 基本操作',
          content: [
            '• 基本的な流れ：画像アップロード → 抽出を開始 → 処理開始 → 絵コンテをダウンロード（またはコピー）',
            '• アップロード: 「画像入力」をクリックするか、貼り付け (Ctrl+V) します。',
            '• キャンバス: ホイールでズーム、中クリックまたはドラッグで移動。',
            '• リセット: 下部の「最大化」ボタンで表示をリセット。',
          ]
        },
        {
          title: '2. 選択範囲',
          content: [
            '• 追加: ダブルクリックまたは「選択範囲を追加」ボタン。',
            '• 選択: クリックで切り替え（青が選択中）。',
            '• 複製: Alt + ドラッグしてコピー。',
            '• 削除: 範囲を選択（青色）してから「選択を削除」をクリック、またはダブルクリックで直接削除。',
          ]
        },
        {
          title: '3. 自動認識',
          content: [
            '• 自動抽出: 「抽出を開始」で分鏡を自動的に検出。',
            '• 検出強度: 感度の調整。高いほど細かく抽出します。',
            '• グリッド: 行数と列数を指定して等分割抽出。',
          ]
        },
        {
          title: '4. 書き出し',
          content: [
            '• 解像度: オリジナルまたは1k/2k（高画質化含む）。',
            '• 処理開始: 選択項目を切り出し、右側のライブラリへ。',
            '• 画像結合: ライブラリの画像を1枚に結合して保存。',
            '• プレビュー: クリックで拡大、ドラッグで並べ替え。',
          ]
        },
        {
          title: '5. 免責事項',
          content: [
            '• 本ツールで画像を処理することで、アップロードされたコンテンツに必要な処理を行うことに同意したものとみなします。本ツールは、合法的な用途（個人作品や許諾済みの素材など）のみにご利用いただけます。ユーザーは素材が著作権規定を遵守していることを確認し、本ツールの利用に伴う結果について自己責任を负うものとします。本ツールおよび著作者は、無許可の利用や改変に対する一切の責任を負いません。著作者は、ソフトウェアおよび生成されたコンテンツを合法的に追跡・保護する権利を留保します。',
            '• 著者X (Twitter)：@azhu_032'
          ]
        }
      ]
    },
    process: '処理開始',
    recognition: '分鏡認識',
    panelStrength: '検出強度',
    gridSettings: 'ルールグリッド (オプション)',
    reset: 'リセット',
    rows: '行数',
    columns: '列数',
    exitDeleteMode: '削除モード終了',
    enterDeleteMode: '選択を削除',
    noResults: '結果なし',
    emptyStateHeader: '開始の準備はできましたか？',
    emptyStateBody: '複数の絵コンテを含むスケッチや画像をアップロードしてください。認識、分割、整理をサポートします。',
    uploadButton: 'ローカルアップロード',
    pasteHint: 'Ctrl+V クリップボード画像を貼り付け',
    download: 'ダウンロード',
    copy: 'コピー',
    delete: '削除',
    copied: 'コピー完了',
    hideSidebar: 'サイドバーを隠す',
    showSidebar: 'サイドバーを表示',
    hideLibrary: 'ライブラリを隠す',
    showLibrary: 'ライブラリを表示',
    downloadZip: 'ZIP一括ダウンロード',
    results: '結果ライブラリ',
    batchDownload: '一括ダウンロード',
    combine: '画像結合',
    tooltips: {
      lang: '言語を切り替える',
      theme: 'ライト/ダークモードを切り替える',
      upload: 'クリックしてアップロード、または Ctrl+V で貼り付け',
      startRecognition: '絵コンテを自動認識して選択範囲を作成',
      manualAdd: '新しい選択範囲を手動で追加',
      selectAll: '現在のすべての選択範囲を選択',
      deselectAll: 'すべての選択範囲の選択を解除',
      clear: '現在のすべての選択範囲を削除',
      reorder: '上から下、左から右へ再番号付け',
      deleteMode: '現在選択されている範囲を削除します',
      strength: '認識強度を調整します（高いほど多くのパネルを検出）',
      rows: 'グリッドレイアウトの行数',
      cols: 'グリッドレイアウトの列数',
      resolution: '出力解像度を選択',
      process: '選択範囲に基づいて画像を切り抜いて処理',
      generate: '右側のプレビュー結果を生成',
      downloadZip: '現在の結果をZIPとしてダウンロード',
      resetZoom: '画像をキャンバスに合わせる',
      preview: 'クリックで全画面表示、ドラッグで並べ替え、操作も可能',
      batchDownload: '現在のプレビューを一括ダウンロード',
      clearGrid: 'グリッド設定をクリア',
      combine: '現在の結果を指定の順序で1枚のグリッド画像に結合してダウンロード',
    }
  }
};
