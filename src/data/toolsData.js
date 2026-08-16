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
      'Original formatting, headings & typography retained',
      'Supports modern DOCX with embedded images and tables',
      'Supports multilingual scripts (Urdu, Arabic, Hindi, CJK, Cyrillic)',
      '100% private in-browser client-side processing'
    ],
    steps: [
      'Upload your Word document (.docx or .doc) via drag & drop or file picker.',
      'Adjust orientation or page margins if necessary.',
      'Click "Convert to PDF" to instantly generate and download your PDF.'
    ],
    overview: 'PDFora Word to PDF converter provides instantaneous, high-fidelity document transformation directly inside your modern web browser. Traditional online converters upload your sensitive contracts, resumes, and personal documents to distant third-party servers. PDFora executes text formatting, layout restructuring, and image embedding locally in your browser memory via WebAssembly and Canvas pipelines, ensuring zero latency and maximum privacy.',
    useCases: [
      {
        title: 'Academic Papers & Theses',
        desc: 'Students and university researchers convert research submissions, assignments, and citations with strict layout preservation across any operating system.'
      },
      {
        title: 'Resumes & Job Applications',
        desc: 'Job seekers lock their CV formatting so recruiters view consistent margins, fonts, and contact icons regardless of their Microsoft Word version.'
      },
      {
        title: 'Legal Contracts & Agreements',
        desc: 'Legal professionals convert drafts to immutable PDF files ready for digital signatures, client review, and compliance archiving.'
      },
      {
        title: 'Business Proposals & Invoices',
        desc: 'Small businesses and freelancers export client proposals, sales estimates, and billing sheets with crisp tables and brand logos.'
      }
    ],
    technicalSpecs: [
      { label: 'Supported Input Formats', value: '.docx, .doc (Microsoft Word 97-2024, Office 365, LibreOffice Writer)' },
      { label: 'Output Standard', value: 'ISO 32000-1 PDF (Universal Reader Compatible)' },
      { label: 'Processing Architecture', value: 'In-Browser Client-Side Engine (Zero Server File Persistence)' },
      { label: 'Character Encodings', value: 'UTF-8, WinAnsi, Arabic/Urdu RTL, Indic, CJK, Cyrillic, Greek' },
      { label: 'Max File Batch', value: 'Up to 10 files per conversion session' }
    ],
    proTips: [
      'Ensure standard font families (Arial, Times New Roman, Calibri, Georgia) are used for optimal cross-platform rendering.',
      'For complex multi-column documents, verify table boundaries before exporting to maintain exact column widths.',
      'Use high-resolution PNG or JPEG images in your Word file for crystal-clear printed results.'
    ],
    faqs: [
      {
        q: 'Will my document formatting and tables be preserved?',
        a: 'Yes. PDFora parses paragraph alignments, font styles (bold, italic, underline), embedded images, and data tables to recreate an exact visual representation in PDF format.'
      },
      {
        q: 'Are my confidential documents uploaded to any remote server?',
        a: 'No. PDFora processes DOCX files natively in your browser session. Your documents never leave your device, ensuring complete privacy and compliance with data protection laws.'
      },
      {
        q: 'Can I convert multilingual Word files containing Urdu, Arabic, or Chinese?',
        a: 'Absolutely. Our universal font cascade supports right-to-left (RTL) scripts, Devanagari, East Asian CJK characters, European accents, and math symbols seamlessly.'
      },
      {
        q: 'Do I need Microsoft Office installed on my computer?',
        a: 'No software installation is required. PDFora works completely in your web browser across Windows, macOS, Linux, iPhone, iPad, and Android.'
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
      'Auto-fits wide tables and columns cleanly on single pages',
      'Preserves cell grids, numbers, currencies, and formula outputs',
      'Supports multi-sheet workbooks in sequential order',
      'Client-side computation ensures sensitive financial figures remain private'
    ],
    steps: [
      'Select or drag and drop your Excel spreadsheet (.xlsx or .xls).',
      'Choose your table scaling preference (Fit Width or Actual Size) and orientation.',
      'Click "Convert to PDF" and download your publication-ready document.'
    ],
    overview: 'Converting spreadsheets to PDF is often frustrating due to cut-off columns, orphaned rows, and broken financial tables. PDFora Excel to PDF converter intelligently detects table boundaries and scales wide financial worksheets cleanly across landscape or portrait PDF pages. Financial analysts, accountants, and administrators can create polished reports without needing complex print-area configurations in Excel.',
    useCases: [
      {
        title: 'Financial Statements & Audits',
        desc: 'Accountants export balance sheets, profit-and-loss statements, and cash-flow projections with aligned numbers and currency symbols.'
      },
      {
        title: 'Project Timelines & Gantt Charts',
        desc: 'Project managers transform task schedules and milestone tracking sheets into easy-to-share executive PDF summaries.'
      },
      {
        title: 'Inventory & Stock Records',
        desc: 'Warehouse and retail managers compile stock counts, product catalogs, and price lists into unalterable PDF files.'
      },
      {
        title: 'Grade Books & Attendance Records',
        desc: 'Teachers and academic staff generate clean student scorecards and semester attendance sheets for printing.'
      }
    ],
    technicalSpecs: [
      { label: 'Supported Input Formats', value: '.xlsx, .xls (Microsoft Excel 97-2024, Google Sheets export, CSV)' },
      { label: 'Scaling Modes', value: 'Fit Width, Actual Sheet Size, Fit Whole Sheet' },
      { label: 'Multi-Sheet Handling', value: 'Sequential page compilation across all workbook sheets' },
      { label: 'Data Security', value: '100% In-Memory Processing (No financial data transmission)' },
      { label: 'Max File Size', value: 'Up to 50 MB spreadsheets per session' }
    ],
    proTips: [
      'Choose Landscape orientation for sheets with more than 6 columns to prevent narrow cell text wrapping.',
      'Hide calculation scratchpad columns in Excel before conversion if you only want the summary table visible.',
      'Use the "Fit All Columns" option to guarantee your table never splits horizontally across pages.'
    ],
    faqs: [
      {
        q: 'Does it support workbooks with multiple sheets/tabs?',
        a: 'Yes. Every worksheet contained in your Excel workbook is compiled sequentially into the output PDF document.'
      },
      {
        q: 'Will my cell formulas display correctly?',
        a: 'The converter calculates and outputs the final displayed values, formatted numbers, percentages, and currencies.'
      },
      {
        q: 'Are my financial spreadsheets secure?',
        a: 'Completely. Files are parsed entirely in your browser without transmitting your numbers to remote servers.'
      },
      {
        q: 'Can I convert .xls files created in older Excel versions?',
        a: 'Yes. Both modern XML-based .xlsx files and legacy binary .xls files from Excel 97–2003 are fully supported.'
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
          { value: '1', label: '1 Slide per page (Full Screen 16:9)' },
          { value: '2', label: '2 Slides per page (Handout)' },
          { value: '4', label: '4 Slides per page (Grid)' }
        ]
      }
    ],
    features: [
      'Widescreen 16:9 and standard 4:3 slide geometry preserved',
      'Maintains typography, diagrams, shapes, and color schemes',
      'Supports PPTX and legacy PPT presentations',
      'Creates compact, lightweight PDF handouts ideal for emailing'
    ],
    steps: [
      'Upload your PowerPoint (.pptx or .ppt) presentation.',
      'Select your preferred slide layout (Full Screen 1 Slide per page or Handout).',
      'Click "Convert to PDF" to generate and download your PDF slides.'
    ],
    overview: 'Presentations shared as raw PPTX files frequently suffer from missing fonts, broken slide layouts, or unwanted accidental edits on target computers. PDFora PowerPoint to PDF converter freezes your slides into standard, tamper-proof PDF documents. Every slide retains its exact dimensions, typography, embedded imagery, and visual hierarchy, ensuring your presentation looks identical on projectors, tablets, and smartphones.',
    useCases: [
      {
        title: 'Conference Handouts & Slide Decks',
        desc: 'Speakers and keynote presenters export slide decks for attendees to review and annotate on laptops or mobile devices.'
      },
      {
        title: 'Investor Pitch Decks',
        desc: 'Startup founders convert confidential pitch decks into secure, uneditable PDFs to share with venture capitalists and angel investors.'
      },
      {
        title: 'Classroom Lecture Slides',
        desc: 'Professors and educators distribute lecture notes in 2-up or 4-up handout formats for student printing and note-taking.'
      },
      {
        title: 'Corporate Training Modules',
        desc: 'HR and training departments produce standardized training manuals and compliance decks for employee onboarding.'
      }
    ],
    technicalSpecs: [
      { label: 'Supported Input Formats', value: '.pptx, .ppt (Microsoft PowerPoint 97-2024, Google Slides export, Keynote export)' },
      { label: 'Slide Aspect Ratios', value: '16:9 Widescreen, 16:10, 4:3 Standard' },
      { label: 'Output Document Format', value: 'Vector-enabled High DPI PDF' },
      { label: 'Processing Security', value: '100% Client-Side In-Memory Execution' },
      { label: 'Max File Limit', value: 'Up to 5 presentations per batch' }
    ],
    proTips: [
      'For printing physical notes, select "2 Slides per page" to balance readability with paper conservation.',
      'Ensure high-contrast text against slide background colors to ensure legibility when projected in bright rooms.',
      'Convert your presentation to PDF before uploading to LinkedIn Slides or SlideShare for perfect slide transitions.'
    ],
    faqs: [
      {
        q: 'Will slide animations and sound effects be included in the PDF?',
        a: 'PDF is a static page format. Animations and audio clips are flattened into their final visual appearance on each slide.'
      },
      {
        q: 'Are custom embedded fonts and vector shapes preserved?',
        a: 'Yes. Slide layouts, vector geometries, shapes, and typography are rendered cleanly in the PDF output.'
      },
      {
        q: 'Can I view the converted PDF in full screen like a slideshow?',
        a: 'Yes. Modern PDF readers (Adobe Acrobat, Chrome, Edge, Apple Preview) offer Full-Screen Presentation Mode (Ctrl+L or Cmd+L).'
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
        default: 'auto',
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
      'Combine up to 30 mixed image formats (JPG, PNG, WEBP, BMP) into 1 PDF',
      'Intuitive drag-and-drop thumbnail reordering',
      'Auto-detects image orientation (portrait and landscape)',
      'Zero loss in photo resolution and color fidelity'
    ],
    steps: [
      'Upload one or multiple photos/images (JPG, PNG, WEBP).',
      'Reorder thumbnails by dragging them into your desired sequence.',
      'Select page sizing and margins, then click "Convert to PDF".'
    ],
    overview: 'Scanned receipts, passport photos, smartphone document snaps, and design mockups often need to be merged into a single standardized PDF file for official submissions. PDFora JPG to PDF converter allows you to combine dozens of images seamlessly. With instant thumbnail drag-and-drop reordering and automatic paper orientation detection, creating professional multi-page photo documents takes only seconds.',
    useCases: [
      {
        title: 'ID & Passport Document Submissions',
        desc: 'Combine scanned CNIC/ID cards, driver licenses, and passport photos into single verified PDF files for visa and banking applications.'
      },
      {
        title: 'Expense Receipts & Invoicing',
        desc: 'Compile smartphone photos of paper receipts and bills into a chronological expense report for accounting reimbursement.'
      },
      {
        title: 'Design Portfolios & Photography Books',
        desc: 'Photographers and graphic designers assemble high-resolution portfolio books for client presentation.'
      },
      {
        title: 'Handwritten Notes & Exam Papers',
        desc: 'Students snap photos of physical notebook pages and combine them into single organized PDF documents for submission.'
      }
    ],
    technicalSpecs: [
      { label: 'Supported Image Formats', value: 'JPG, JPEG, PNG, WEBP, BMP, GIF (static)' },
      { label: 'Max Images Per Batch', value: 'Up to 30 high-resolution images' },
      { label: 'Page Sizing Options', value: 'Auto-fit, Standard A4, US Letter' },
      { label: 'Compression Quality', value: 'High-Fidelity 96% JPEG compression without artifacting' },
      { label: 'Privacy Standard', value: 'Pure Client-Side In-Memory Processing' }
    ],
    proTips: [
      'Use "Auto (Match Image Aspect Ratio)" if you want each PDF page to match the exact dimensions of your original photo.',
      'Select "No Margin" for full-bleed photo albums and presentation artwork.',
      'Drag thumbnail cards in the dropzone to quickly arrange the exact page sequence before converting.'
    ],
    faqs: [
      {
        q: 'Can I combine different image formats (e.g. JPG and PNG together)?',
        a: 'Yes. You can upload any combination of JPG, PNG, WEBP, and BMP files in the same batch.'
      },
      {
        q: 'Will image quality degrade during conversion?',
        a: 'No. PDFora embeds images at original DPI resolution to ensure crystal-clear text and sharp photo details.'
      },
      {
        q: 'Is there a limit on how many images I can merge?',
        a: 'You can combine up to 30 images in a single batch on our free platform.'
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
          { value: 'entire-page', label: 'Convert Entire PDF Pages to JPG' }
        ]
      }
    ],
    features: [
      'High-DPI 2.0x supersampled rendering for razor-sharp text and graphics',
      'Multi-page PDFs automatically packaged into a convenient ZIP archive',
      'Single-page PDFs download directly as standalone JPG files',
      'Complete multilingual CMap support for international scripts'
    ],
    steps: [
      'Upload the PDF document you wish to convert to images.',
      'Click "Convert to JPG" to start high-resolution page rendering.',
      'Download your individual JPG image or ZIP archive containing all pages.'
    ],
    overview: 'When you need to embed a PDF page into a website, social media post, PowerPoint slide, or graphic design project, converting the PDF into an image is the cleanest solution. PDFora PDF to JPG engine uses high-density 2x canvas supersampling to render vector text, tables, and photos with crisp clarity. International CMap font tables are loaded automatically to ensure Arabic, Urdu, CJK, and Indic characters render without missing glyphs.',
    useCases: [
      {
        title: 'Social Media & Marketing Graphics',
        desc: 'Marketers extract PDF report summaries and infographics into JPGs for posting on LinkedIn, Twitter, and Instagram.'
      },
      {
        title: 'Website & Blog Article Illustration',
        desc: 'Content creators convert PDF diagrams and document covers into lightweight web-ready JPG images.'
      },
      {
        title: 'Slide Embeds & Keynote Presentations',
        desc: 'Professionals insert specific PDF report pages directly into PowerPoint or Google Slides as high-res images.'
      },
      {
        title: 'Mobile Sharing on Messaging Apps',
        desc: 'Users convert official certificates and notices into images for instant preview in WhatsApp groups without requiring a PDF reader.'
      }
    ],
    technicalSpecs: [
      { label: 'Render Engine', value: 'PDF.js High-DPI Canvas Supersampling (2.0x scale)' },
      { label: 'Output Image Format', value: 'JPEG (High Quality 95% Encoding)' },
      { label: 'Font & Glyph Support', value: 'Full Unicode CMap & Embedded TrueType/OpenType Rendering' },
      { label: 'Archive Format', value: 'Standard ZIP for multi-page documents' },
      { label: 'Security', value: 'In-Browser Execution (Zero remote server storage)' }
    ],
    proTips: [
      'Single-page PDFs download instantly as single .jpg files without needing unzipping software.',
      'For multi-page documents, files are named sequentially (e.g., page_1.jpg, page_2.jpg) inside the downloaded ZIP.',
      'The 2x supersampling ensures text remains readable even when zoomed in on high-resolution Retina displays.'
    ],
    faqs: [
      {
        q: 'Will the extracted JPG images be blurry?',
        a: 'No. PDFora renders pages at double resolution (2.0x scale) with anti-aliasing to ensure text and lines remain sharp.'
      },
      {
        q: 'How do I access images if my PDF has multiple pages?',
        a: 'If your PDF contains multiple pages, all converted JPG images are packaged into a single, organized ZIP file.'
      },
      {
        q: 'Are password-protected PDFs supported?',
        a: 'You must unlock password-protected PDFs before conversion so the rendering engine can read the document streams.'
      }
    ]
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    path: '/tools/merge-pdf',
    category: 'organize',
    shortDesc: 'Combine multiple PDF documents into a single organized file.',
    description: 'Merge two or more PDF files into a single, unified document. Drag and drop to reorder files and preview page counts.',
    iconName: 'Layers',
    badge: 'Popular',
    acceptedTypes: '.pdf, application/pdf',
    acceptedFileLabel: 'PDF documents',
    maxFiles: 20,
    options: [
      {
        id: 'sorting',
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
      'Combine up to 20 PDF files simultaneously in one batch',
      'Drag-and-drop card reordering or automatic alphabetical sorting',
      'Preserves original vector bookmarks, hyperlinked structures, and metadata',
      '100% private in-browser document compilation'
    ],
    steps: [
      'Upload two or more PDF files you want to join.',
      'Drag items into your preferred sequential order or choose A-Z sorting.',
      'Click "Merge PDF" to download the unified, single PDF file.'
    ],
    overview: 'Combining multiple standalone documents—such as cover letters, project proposals, appendices, and scanned certificates—into one continuous PDF is essential for business and academic workflows. PDFora Merge PDF tool operates with zero server upload delay. Pages and metadata trees are concatenated directly in memory, producing a clean, unified PDF without re-compressing or degrading original graphics.',
    useCases: [
      {
        title: 'Job & University Application Packages',
        desc: 'Combine cover letters, resumes, transcripts, and letters of recommendation into one professional submission file.'
      },
      {
        title: 'Legal Dossiers & Case Files',
        desc: 'Lawyers merge evidence documents, client affidavits, and exhibit sheets into single sequential legal briefs.'
      },
      {
        title: 'Monthly Financial Reports',
        desc: 'Finance teams unite departmental spending reports, audit sheets, and executive summaries into an annual ledger.'
      },
      {
        title: 'E-Books & Manual Compilation',
        desc: 'Authors and publishers concatenate individual chapter drafts into complete digital books.'
      }
    ],
    technicalSpecs: [
      { label: 'Max Files Per Batch', value: 'Up to 20 PDF documents simultaneously' },
      { label: 'Page Limit', value: 'No artificial page count limit' },
      { label: 'Metadata Preservation', value: 'Retains embedded fonts, vector paths, and page dimensions' },
      { label: 'Execution Speed', value: 'Near-instantaneous in-memory stream concatenation' },
      { label: 'Privacy Standard', value: '100% In-Browser Memory Processing' }
    ],
    proTips: [
      'Arrange documents in the exact order you want them to appear in the final combined file before clicking Merge.',
      'Use alphabetical sorting (Name A-Z) if your files are numbered sequentially (e.g. 01_intro.pdf, 02_body.pdf).',
      'Compress your merged document afterward using our Compress PDF tool if the combined file exceeds email attachment limits.'
    ],
    faqs: [
      {
        q: 'Can I merge PDFs that have different page orientations or sizes?',
        a: 'Yes. PDFora preserves the individual orientation (portrait/landscape) and dimensions of every single page during merging.'
      },
      {
        q: 'Will merging reduce the quality of text or photos in my PDFs?',
        a: 'No. The merging process joins the raw PDF streams without re-sampling images or converting text to bitmaps.'
      },
      {
        q: 'How many PDF files can I merge at once?',
        a: 'You can merge up to 20 PDF files in a single batch on our free platform.'
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
          { value: 'extreme', label: 'Extreme Compression', desc: 'Maximum size reduction (~70-80% smaller), optimized for strict upload limits' },
          { value: 'recommended', label: 'Recommended Compression', desc: 'Optimal balance between lightweight size and sharp visual quality (~50% smaller)' },
          { value: 'less', label: 'Less Compression', desc: 'High visual preservation with subtle stream deflation (~25% smaller)' }
        ]
      }
    ],
    features: [
      'Reduce file size by up to 80% with smart vector and bitmap stream optimization',
      '3 tailored compression presets (Extreme, Recommended, Less)',
      'Removes redundant metadata and unused font objects',
      'Private in-browser compression ensures zero confidential data leakage'
    ],
    steps: [
      'Upload your large PDF file.',
      'Choose your preferred compression preset (Recommended, Extreme, or Less).',
      'Click "Compress PDF" to download your lightweight, optimized document.'
    ],
    overview: 'Oversized PDF files cause email bounces, slow web downloads, and trigger upload rejections on government and job portal forms with strict 2MB or 5MB limits. PDFora Compress PDF utility optimizes embedded image streams, deflates object streams, and strips redundant metadata without sacrificing text sharpness. The result is a lightweight, email-ready PDF that looks crisp on screens and prints clearly.',
    useCases: [
      {
        title: 'Email Attachment Limit Compliance',
        desc: 'Shrink multi-megabyte presentations and catalogs to fit within Gmail, Outlook, and corporate 25MB attachment limits.'
      },
      {
        title: 'Government & University Portal Uploads',
        desc: 'Meet strict 2MB or 5MB file-size limits on immigration, visa, civil service, and university admission portals.'
      },
      {
        title: 'Fast Web Publishing & SEO Optimization',
        desc: 'Reduce PDF load times on business websites and blogs to improve Core Web Vitals and user retention.'
      },
      {
        title: 'Mobile Storage & Cloud Archiving',
        desc: 'Save gigabytes of space when storing thousands of scanned invoices, receipts, and ebooks on cloud drives.'
      }
    ],
    technicalSpecs: [
      { label: 'Optimization Engine', value: 'Lossless Stream Deflation & High-Density Bitmap Resampling' },
      { label: 'Presets Available', value: 'Extreme (High Reduction), Recommended (Balanced), Less (High Quality)' },
      { label: 'Text & Vector Sharpness', value: '100% Vector Text Preservation (Fonts remain sharp)' },
      { label: 'Execution Location', value: '100% In-Browser Memory (Zero remote server storage)' },
      { label: 'Batch Processing', value: 'Up to 5 files per session' }
    ],
    proTips: [
      'Use "Recommended" for general office documents, resumes, and business presentations.',
      'Select "Extreme" when an online portal strictly requires files under 2MB or 1MB.',
      'Text and vector lines will never become blurry because compression focuses primarily on image stream density.'
    ],
    faqs: [
      {
        q: 'Will my text become blurry after compression?',
        a: 'No. Vector text, outlines, and fonts remain 100% sharp. Compression optimizes high-density image elements and strips unneeded stream overhead.'
      },
      {
        q: 'How much can I reduce my PDF file size?',
        a: 'Size reduction typically ranges from 25% to 80% depending on the volume and density of images in the original PDF.'
      },
      {
        q: 'Is my compressed PDF safe from third-party interception?',
        a: 'Yes. Compression executes in your browser session using WebAssembly. Your files are not stored on any remote disk.'
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
        label: 'Split Mode',
        type: 'select',
        default: 'range',
        choices: [
          { value: 'range', label: 'Extract Specific Pages (e.g. 1, 3, 5-8)' },
          { value: 'all', label: 'Extract All Pages as Individual PDFs' },
          { value: 'odd-even', label: 'Separate Odd / Even Pages' }
        ]
      },
      {
        id: 'customRanges',
        label: 'Enter Exact Page Numbers (e.g. 1, 3, 5-8 or 2)',
        type: 'text',
        default: '',
        placeholder: 'e.g. 1, 3, 5-8 or 2',
        dependsOn: { id: 'splitMode', value: 'range' }
      },
      {
        id: 'oddEvenSelect',
        label: 'Select Which Pages to Extract',
        type: 'select',
        default: 'odd',
        choices: [
          { value: 'odd', label: 'Odd Pages Only (1, 3, 5...)' },
          { value: 'even', label: 'Even Pages Only (2, 4, 6...)' }
        ],
        dependsOn: { id: 'splitMode', value: 'odd-even' }
      }
    ],
    features: [
      'Extract only the exact page numbers or ranges you specify',
      'Separate entire PDF documents into single-page files packed in a ZIP',
      'Odd and Even page extraction for double-sided manual printing',
      'Maintains original vector quality, hyperlinks, and document formatting'
    ],
    steps: [
      'Upload the PDF document you wish to split.',
      'Enter specific page numbers (e.g. 1, 4, 7-10) or choose Odd/Even/All mode.',
      'Click "Split PDF" to generate and download your extracted document or ZIP.'
    ],
    overview: 'Large PDF documents like books, government forms, contracts, and court filings often contain pages you do not need to share. PDFora Split PDF tool gives you surgical control to extract exactly the pages you specify (e.g. page 3, or pages 1, 4, 7-10). You can also extract all pages into individual single-page PDFs or separate odd and even pages for manual duplex printing.',
    useCases: [
      {
        title: 'Extracting Specific Agreement Pages',
        desc: 'Extract and send only the signature page or summary clause of a 50-page commercial lease agreement.'
      },
      {
        title: 'Chapter Extraction from E-Books & Textbooks',
        desc: 'Students and educators extract specific book chapters and study units to share with study groups.'
      },
      {
        title: 'Double-Sided Printing Preparation',
        desc: 'Separate odd and even pages to easily print double-sided documents on standard single-sided desktop printers.'
      },
      {
        title: 'Confidential Page Redaction / Removal',
        desc: 'Isolate and share public sections of a document while omitting confidential internal pages.'
      }
    ],
    technicalSpecs: [
      { label: 'Split Modes', value: 'Custom Page Ranges, Single Page Extraction, Odd/Even, Extract All' },
      { label: 'Range Syntax', value: 'Comma-separated lists & ranges (e.g. 1, 3, 5-8, 12)' },
      { label: 'Output Document Types', value: 'Standalone PDF or ZIP archive containing single pages' },
      { label: 'Stream Quality', value: '100% Lossless Vector Copy (Zero re-rasterization)' },
      { label: 'Security Standard', value: 'Pure In-Browser Client Execution' }
    ],
    proTips: [
      'To extract a single page, enter just its number (e.g. 3) in the range input box.',
      'Use commas and dashes together (e.g. 1, 3-5, 9) to extract non-consecutive sections in one operation.',
      'Extracting pages preserves the original vector typography and embedded links without quality loss.'
    ],
    faqs: [
      {
        q: 'Can I extract non-consecutive pages (e.g., pages 1, 4, and 7)?',
        a: 'Yes. Simply enter "1, 4, 7" in the page range box, and only those exact pages will be extracted into your new PDF.'
      },
      {
        q: 'What happens if I select "Extract All Pages"?',
        a: 'Every single page of your PDF is extracted into its own individual PDF file, and all files are packaged into a clean ZIP archive for download.'
      },
      {
        q: 'Will splitting damage the quality of text or embedded images?',
        a: 'No. PDFora extracts the raw page objects directly from the PDF stream without re-compression, preserving 100% of the original quality.'
      }
    ]
  }
];

export const FAQS = [
  {
    question: 'Is PDFora completely free to use?',
    answer: 'Yes! PDFora offers free access to all core PDF conversion, compression, merging, and splitting tools with no hidden subscriptions or watermarks.'
  },
  {
    question: 'Are my uploaded files private and secure?',
    answer: 'Security and privacy are our foundational principles. PDFora runs document transformations natively in your web browser memory using client-side WebAssembly. Your files are not stored on remote servers.'
  },
  {
    question: 'Do I need to install any software or browser extensions?',
    answer: 'No installation required! PDFora is a 100% web-based platform that works seamlessly in modern browsers across Windows, macOS, Linux, iOS, and Android.'
  },
  {
    question: 'Can I use PDFora on mobile devices?',
    answer: 'Yes! PDFora is fully responsive and optimized for touch interactions on smartphones and tablets, allowing you to convert and organize documents on the go.'
  }
];
