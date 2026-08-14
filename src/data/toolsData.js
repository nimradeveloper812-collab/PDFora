export const TOOLS_CATEGORIES = [
  { id: 'all', name: 'All Tools' },
  { id: 'convert-to', name: 'Convert to PDF' },
  { id: 'convert-from', name: 'Convert from PDF' },
  { id: 'organize', name: 'Edit & Organize' },
  { id: 'optimize', name: 'Optimize & Secure' },
];

export const TOOLS = [
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    slug: 'word-to-pdf',
    path: '/tools/word-to-pdf',
    category: 'convert-to',
    shortDesc: 'Convert DOCX and DOC files to PDF online with high accuracy and privacy.',
    description: 'Easily turn Microsoft Word documents (.docx, .doc) into clean, professional PDF files. Preserves layout, formatting, images, and tables.',
    iconName: 'FileText',
    badge: 'Popular',
    acceptedTypes: '.docx, .doc, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword',
    acceptedFileLabel: 'DOCX, DOC files',
    maxFiles: 10,
    options: [
      {
        id: 'orientation',
        label: 'Page Orientation',
        type: 'select',
        default: 'auto',
        choices: [
          { value: 'auto', label: 'Auto Detect' },
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' }
        ]
      },
      {
        id: 'margin',
        label: 'Page Margins',
        type: 'select',
        default: 'normal',
        choices: [
          { value: 'normal', label: 'Normal (Standard)' },
          { value: 'narrow', label: 'Narrow' },
          { value: 'wide', label: 'Wide' }
        ]
      }
    ],
    features: [
      'Original formatting & typography retained',
      'Supports modern DOCX and legacy DOC formats',
      'Batch conversion up to 10 files',
      'Private in-browser or cloud conversion'
    ],
    steps: [
      'Upload your Word document (.docx recommended or .doc)',
      'Adjust orientation or page margins if needed',
      'Click "Convert to PDF" and download your file'
    ],
    faqs: [
      {
        q: 'Will my document formatting be preserved?',
        a: 'Yes! PDFora preserves your original text layout, typography, tables, and images accurately.'
      },
      {
        q: 'Which Word formats are supported?',
        a: 'We support modern .docx files directly in your browser with zero data sharing, as well as legacy .doc formats.'
      },
      {
        q: 'Is my Word document safe during conversion?',
        a: 'Absolutely. Files are processed privately in your browser session or transferred via encrypted TLS connections and auto-deleted within 1 hour.'
      }
    ]
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    slug: 'excel-to-pdf',
    path: '/tools/excel-to-pdf',
    category: 'convert-to',
    shortDesc: 'Convert Excel spreadsheets (XLS, XLSX) into readable PDF documents.',
    description: 'Transform Microsoft Excel sheets into perfectly formatted PDFs. Control table scaling, page orientation, and sheet selection.',
    iconName: 'Table',
    badge: 'Popular',
    acceptedTypes: '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    acceptedFileLabel: 'XLS, XLSX files',
    maxFiles: 5,
    options: [
      {
        id: 'fitPages',
        label: 'Table Scaling',
        type: 'select',
        default: 'fit-width',
        choices: [
          { value: 'fit-width', label: 'Fit All Columns on One Page' },
          { value: 'actual-size', label: 'Actual Sheet Size' },
          { value: 'fit-sheet', label: 'Fit Whole Sheet on One Page' }
        ]
      },
      {
        id: 'orientation',
        label: 'Orientation',
        type: 'select',
        default: 'landscape',
        choices: [
          { value: 'landscape', label: 'Landscape (Recommended for tables)' },
          { value: 'portrait', label: 'Portrait' }
        ]
      }
    ],
    features: [
      'Auto-fits wide tables cleanly',
      'Multiple sheets merged into single PDF',
      'High DPI formula and grid rendering',
      'Privacy guaranteed'
    ],
    steps: [
      'Select your Excel (.xls or .xlsx) spreadsheet',
      'Choose column fitting options',
      'Convert and download your spreadsheet as PDF'
    ],
    faqs: [
      {
        q: 'Does it support multi-sheet workbooks?',
        a: 'Yes, every worksheet in your Excel workbook will be compiled sequentially into the output PDF.'
      }
    ]
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    slug: 'powerpoint-to-pdf',
    path: '/tools/powerpoint-to-pdf',
    category: 'convert-to',
    shortDesc: 'Convert PPT and PPTX presentations into PDF handouts.',
    description: 'Turn Microsoft PowerPoint slides into high-resolution PDF documents for easy sharing, viewing, and printing.',
    iconName: 'Presentation',
    badge: '',
    acceptedTypes: '.ppt, .pptx, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation',
    acceptedFileLabel: 'PPT, PPTX files',
    maxFiles: 5,
    options: [
      {
        id: 'slidesPerPage',
        label: 'Slides Per Page',
        type: 'select',
        default: '1',
        choices: [
          { value: '1', label: '1 Slide per page (Full Screen)' },
          { value: '2', label: '2 Slides per page' },
          { value: '4', label: '4 Slides Handout Grid' }
        ]
      }
    ],
    features: [
      'High-quality vector presentation rendering',
      'Maintains full slide color accuracy',
      'Supports PPT & PPTX files',
      'Fast automated processing'
    ],
    steps: [
      'Drag and drop your PowerPoint presentation',
      'Select slide layout settings',
      'Download your PDF slides'
    ],
    faqs: [
      {
        q: 'Which PowerPoint formats are supported?',
        a: 'We support modern .pptx presentations directly in your browser with full text and embedded media extraction, as well as .ppt files.'
      },
      {
        q: 'Are custom fonts and graphics in slides preserved?',
        a: 'Yes, PDFora extracts typography, layout structures, and embedded high-resolution graphics into your PDF document.'
      }
    ]
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    slug: 'jpg-to-pdf',
    path: '/tools/jpg-to-pdf',
    category: 'convert-to',
    shortDesc: 'Convert JPG, PNG, WEBP and BMP images into a clean single PDF.',
    description: 'Combine multiple images into one ordered PDF document. Reorder images, set custom margins, and adjust page dimensions.',
    iconName: 'Image',
    badge: 'Popular',
    acceptedTypes: '.jpg, .jpeg, .png, .webp, .bmp, image/jpeg, image/png, image/webp',
    acceptedFileLabel: 'JPG, PNG, WEBP, BMP images',
    maxFiles: 30,
    options: [
      {
        id: 'pageSize',
        label: 'PDF Page Size',
        type: 'select',
        default: 'a4',
        choices: [
          { value: 'auto', label: 'Auto (Match Image Aspect Ratio)' },
          { value: 'a4', label: 'A4 (Standard Paper)' },
          { value: 'us-letter', label: 'US Letter' }
        ]
      },
      {
        id: 'margin',
        label: 'Image Margin',
        type: 'select',
        default: 'small',
        choices: [
          { value: 'none', label: 'No Margin (Full Bleed)' },
          { value: 'small', label: 'Small Margin' },
          { value: 'big', label: 'Big Margin' }
        ]
      }
    ],
    features: [
      'Combine multiple image formats into one PDF',
      'Drag to reorder images easily',
      'Custom paper size and orientation options',
      'Zero quality loss compression'
    ],
    steps: [
      'Upload one or multiple images',
      'Arrange the image order by dragging',
      'Click "Convert to PDF" and download'
    ],
    faqs: [
      {
        q: 'Can I upload different image formats at once?',
        a: 'Yes! You can mix JPG, PNG, WEBP, and BMP files together into a single PDF.'
      }
    ]
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    slug: 'pdf-to-jpg',
    path: '/tools/pdf-to-jpg',
    category: 'convert-from',
    shortDesc: 'Extract all pages or images from a PDF into high-quality JPGs.',
    description: 'Convert every page of your PDF into high-resolution JPG images, or extract embedded images directly.',
    iconName: 'FileImage',
    badge: '',
    acceptedTypes: '.pdf, application/pdf',
    acceptedFileLabel: 'PDF document',
    maxFiles: 1,
    options: [
      {
        id: 'mode',
        label: 'Extraction Mode',
        type: 'select',
        default: 'entire-page',
        choices: [
          { value: 'entire-page', label: 'Convert Entire PDF Pages to JPG' },
          { value: 'extract-images', label: 'Extract Single Embedded Images Only' }
        ]
      },
      {
        id: 'quality',
        label: 'Image Quality / Resolution',
        type: 'select',
        default: 'high',
        choices: [
          { value: 'medium', label: 'Standard Quality (150 DPI)' },
          { value: 'high', label: 'High Quality (300 DPI - Crisp)' },
          { value: 'maximum', label: 'Maximum Resolution (600 DPI)' }
        ]
      }
    ],
    features: [
      'Renders high-resolution 300+ DPI JPG images',
      'Option to extract only embedded images',
      'Downloads as a convenient ZIP archive for multi-page documents',
      'Fast processing engine'
    ],
    steps: [
      'Upload your PDF document',
      'Choose image quality and extraction mode',
      'Download your extracted JPG images'
    ],
    faqs: [
      {
        q: 'How will I receive the JPG files?',
        a: 'Single-page PDFs download as a JPG file; multi-page PDFs download as a neat ZIP archive containing all pages.'
      }
    ]
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    path: '/tools/merge-pdf',
    category: 'organize',
    shortDesc: 'Combine multiple PDF files into one unified document.',
    description: 'Merge two or more PDF files into a single structured document in seconds. Drag and drop to reorder files easily.',
    iconName: 'Layers',
    badge: 'Popular',
    acceptedTypes: '.pdf, application/pdf',
    acceptedFileLabel: 'PDF documents',
    maxFiles: 20,
    options: [
      {
        id: 'sortOrder',
        label: 'File Sorting',
        type: 'select',
        default: 'custom',
        choices: [
          { value: 'custom', label: 'Custom Drag & Drop Order' },
          { value: 'name-asc', label: 'Name (A to Z)' },
          { value: 'name-desc', label: 'Name (Z to A)' }
        ]
      }
    ],
    features: [
      'Combine up to 20 PDFs simultaneously',
      'Drag-and-drop page/file reordering',
      'Preserves original bookmark structures',
      '100% private & secure processing'
    ],
    steps: [
      'Upload two or more PDF files',
      'Drag items into your desired sequence',
      'Click "Merge PDF" to download the merged document'
    ],
    faqs: [
      {
        q: 'Is there a limit on how many PDFs I can merge?',
        a: 'You can combine up to 20 PDF files per batch on our free platform.'
      }
    ]
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    slug: 'compress-pdf',
    path: '/tools/compress-pdf',
    category: 'optimize',
    shortDesc: 'Reduce PDF file size while retaining maximum visual quality.',
    description: 'Optimize and shrink large PDF files for faster email attachment and web uploading without sacrificing readability.',
    iconName: 'Minimize2',
    badge: 'Essential',
    acceptedTypes: '.pdf, application/pdf',
    acceptedFileLabel: 'PDF document',
    maxFiles: 5,
    options: [
      {
        id: 'compressionLevel',
        label: 'Compression Preset',
        type: 'radio',
        default: 'recommended',
        choices: [
          { value: 'extreme', label: 'Extreme Compression', desc: 'Maximum size reduction, moderate image quality reduction (~80% smaller)' },
          { value: 'recommended', label: 'Recommended Compression', desc: 'Optimal balance between size and high visual quality (~50% smaller)' },
          { value: 'less', label: 'Less Compression', desc: 'Minimal reduction, highest possible visual preservation (~25% smaller)' }
        ]
      }
    ],
    features: [
      'Reduce file size by up to 80%',
      'Smart vector & image optimization',
      'Preview estimated file size reduction',
      'Fast cloud rendering'
    ],
    steps: [
      'Upload your large PDF file',
      'Select your preferred compression preset',
      'Download your compressed, lightweight PDF'
    ],
    faqs: [
      {
        q: 'Will my text become blurry after compression?',
        a: 'No! Text and vector graphics remain 100% sharp. Compression primarily optimizes high-density image elements.'
      }
    ]
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    slug: 'split-pdf',
    path: '/tools/split-pdf',
    category: 'organize',
    shortDesc: 'Separate one PDF into individual pages or specific page ranges.',
    description: 'Extract specific pages or split a long PDF into multiple smaller documents effortlessly.',
    iconName: 'Scissors',
    badge: '',
    acceptedTypes: '.pdf, application/pdf',
    acceptedFileLabel: 'PDF document',
    maxFiles: 1,
    options: [
      {
        id: 'splitMode',
        label: 'Split Method',
        type: 'select',
        default: 'range',
        choices: [
          { value: 'range', label: 'Custom Page Ranges (e.g. 1-3, 5, 8-10)' },
          { value: 'all', label: 'Extract Every Page into Individual PDFs' },
          { value: 'odd-even', label: 'Separate Odd and Even Pages' }
        ]
      },
      {
        id: 'customRanges',
        label: 'Page Range Syntax',
        type: 'text',
        default: '1-5',
        placeholder: 'e.g. 1-3, 5-8'
      },
      {
        id: 'oddEvenSelect',
        label: 'Extract Pages',
        type: 'select',
        default: 'odd',
        choices: [
          { value: 'odd', label: 'Odd Pages (1, 3, 5...)' },
          { value: 'even', label: 'Even Pages (2, 4, 6...)' }
        ]
      }
    ],
    features: [
      'Extract exact page ranges',
      'Split into single page PDFs',
      'Fast thumbnail preview',
      'Instant extraction without loss of quality'
    ],
    steps: [
      'Upload the PDF you want to split',
      'Enter page numbers or ranges (e.g. 1-4, 7)',
      'Click "Split PDF" to generate separate files'
    ],
    faqs: [
      {
        q: 'Can I extract non-consecutive pages?',
        a: 'Yes, you can enter individual page numbers separated by commas, such as "1, 4, 7, 10-12".'
      }
    ]
  }
];

export const FAQS = [
  {
    question: 'Is PDFora completely free to use?',
    answer: 'Yes! PDFora offers free access to all core PDF conversion, compression, merging, and splitting tools with no hidden subscriptions required.'
  },
  {
    question: 'Is PDFora suitable for Pakistani students, freelancers, and offices?',
    answer: 'Absolutely! PDFora was built in Pakistan to provide students, university researchers, freelancers, and offices across Lahore, Karachi, Islamabad, and nationwide with fast, 100% free, and strictly private PDF tools.'
  },
  {
    question: 'Are my files private and secure?',
    answer: 'Security and privacy are our top priorities. All uploaded files are encrypted using TLS 1.3 in transit and are permanently deleted from our servers within 1 hour after processing.'
  },
  {
    question: 'Do I need to install any software or browser extensions?',
    answer: 'No installation required! PDFora is a 100% web-based platform that works seamlessly in modern browsers across Windows, Mac, Linux, iOS, and Android.'
  },
  {
    question: 'Is there a limit on file size?',
    answer: 'You can upload documents up to 50MB per file on our standard free tier, which covers 99% of everyday office and personal documents.'
  },
  {
    question: 'Can I use PDFora on my mobile phone?',
    answer: 'Yes, PDFora is optimized for mobile touch devices. You can upload documents directly from your iPhone, iPad, or Android device.'
  }
];
