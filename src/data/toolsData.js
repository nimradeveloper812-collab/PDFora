export const TOOLS_CATEGORIES = [
  {
    "id": "all",
    "name": "All Tools",
    "shortName": "All",
    "desc": "Complete suite of 19 free online document, image, video, and audio tools."
  },
  {
    "id": "pdf",
    "name": "PDF Tools",
    "shortName": "PDF",
    "desc": "Everything you need to merge, split, compress, and organize PDF documents."
  },
  {
    "id": "documents",
    "name": "Word & Document Tools",
    "shortName": "Documents",
    "desc": "Convert seamlessly between Microsoft Word (.docx), Excel (.xlsx), and PDF formats."
  },
  {
    "id": "images",
    "name": "Image Tools",
    "shortName": "Images",
    "desc": "Remove backgrounds, compress image file sizes, and convert between raster formats."
  },
  {
    "id": "video",
    "name": "Video Tools",
    "shortName": "Video",
    "desc": "Transcode video containers and compress high-definition footage with zero visual quality loss."
  },
  {
    "id": "audio",
    "name": "Audio Tools",
    "shortName": "Audio",
    "desc": "Extract studio audio streams from video files and compress audio recordings efficiently."
  }
];

export function getToolTheme(toolId, category) {
  // PDFora Primary Purple Theme
  if (toolId === 'compress-pdf' || toolId === 'split-pdf' || toolId === 'merge-pdf') {
    return {
      name: 'purple',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
      accentColor: '#6C3FFC',
      lightBg: '#F3F0FF',
      badgeTextColor: '#6C3FFC',
    };
  }
  // Word & Document Tools
  if (toolId === 'word-to-pdf' || toolId === 'pdf-to-word') {
    return {
      name: 'indigo',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
      accentColor: '#4F46E5',
      lightBg: '#EEF2FF',
      badgeTextColor: '#4F46E5',
    };
  }
  // Spreadsheet Tools
  if (toolId === 'excel-to-pdf' || toolId === 'pdf-to-excel' || toolId === 'excel-to-word' || toolId === 'word-to-excel') {
    return {
      name: 'emerald',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      accentColor: '#059669',
      lightBg: '#ECFDF5',
      badgeTextColor: '#059669',
    };
  }
  // Presentation & Image Tools
  if (toolId === 'powerpoint-to-pdf' || toolId === 'jpg-to-pdf' || toolId === 'pdf-to-jpg') {
    return {
      name: 'violet',
      iconBg: 'bg-violet-50 text-violet-600 border-violet-100',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      btnBg: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
      accentColor: '#7C3AED',
      lightBg: '#F5F3FF',
      badgeTextColor: '#7C3AED',
    };
  }
  // Image & Background Utilities
  if (category === 'images' || (toolId && toolId.includes('image'))) {
    return {
      name: 'fuchsia',
      iconBg: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
      badgeBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      btnBg: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-fuchsia-500/20',
      accentColor: '#C026D3',
      lightBg: '#FDF4FF',
      badgeTextColor: '#C026D3',
    };
  }
  // Video & Audio Tools
  if (category === 'video' || category === 'audio' || (toolId && (toolId.includes('video') || toolId.includes('audio')))) {
    return {
      name: 'purple',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
      accentColor: '#6C3FFC',
      lightBg: '#F3F0FF',
      badgeTextColor: '#6C3FFC',
    };
  }
  // Default PDFora Brand Theme -> Primary Purple
  return {
    name: 'purple',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
    accentColor: '#6C3FFC',
    lightBg: '#F3F0FF',
    badgeTextColor: '#6C3FFC',
  };
}

export const TOOLS = [
  {
    "id": "word-to-pdf",
    "name": "Word to PDF",
    "slug": "word-to-pdf",
    "path": "/word-to-pdf",
    "category": "documents",
    "popular": true,
    "shortDesc": "Convert DOCX and DOC files to PDF online with high accuracy and privacy.",
    "description": "Easily turn Microsoft Word documents (.docx, .doc) into clean, professional PDF files. Preserves layout, formatting, images, and tables.",
    "iconName": "FileText",
    "badge": "Popular",
    "acceptedTypes": ".docx, .doc, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword",
    "acceptedFileLabel": "DOCX, DOC files",
    "maxFiles": 10,
    "options": [
      {
        "id": "orientation",
        "label": "Page Orientation",
        "type": "select",
        "default": "auto",
        "choices": [
          {
            "value": "auto",
            "label": "Auto Detect"
          },
          {
            "value": "portrait",
            "label": "Portrait"
          },
          {
            "value": "landscape",
            "label": "Landscape"
          }
        ]
      },
      {
        "id": "margin",
        "label": "Page Margins",
        "type": "select",
        "default": "normal",
        "choices": [
          {
            "value": "normal",
            "label": "Normal (Standard)"
          },
          {
            "value": "narrow",
            "label": "Narrow"
          },
          {
            "value": "wide",
            "label": "Wide"
          }
        ]
      }
    ],
    "features": [
      "Original formatting, headings & typography retained",
      "Supports modern DOCX with embedded images and tables",
      "Supports multilingual scripts (Urdu, Arabic, Hindi, CJK, Cyrillic)",
      "100% private in-browser client-side processing"
    ],
    "steps": [
      "Upload your Word document (.docx or .doc) via drag & drop or file picker.",
      "Adjust orientation or page margins if necessary.",
      "Click \"Convert to PDF\" to instantly generate and download your PDF."
    ],
    "overview": "PDFora Word to PDF converter provides instantaneous, high-fidelity document transformation directly inside your modern web browser. Traditional online converters upload your sensitive contracts, resumes, and personal documents to distant third-party servers. PDFora executes text formatting, layout restructuring, and image embedding locally in your browser memory via WebAssembly and Canvas pipelines, ensuring zero latency and maximum privacy.",
    "useCases": [
      {
        "title": "Academic Papers & Theses",
        "desc": "Students and university researchers convert research submissions, assignments, and citations with strict layout preservation across any operating system."
      },
      {
        "title": "Resumes & Job Applications",
        "desc": "Job seekers lock their CV formatting so recruiters view consistent margins, fonts, and contact icons regardless of their Microsoft Word version."
      },
      {
        "title": "Legal Contracts & Agreements",
        "desc": "Legal professionals convert drafts to immutable PDF files ready for digital signatures, client review, and compliance archiving."
      },
      {
        "title": "Business Proposals & Invoices",
        "desc": "Small businesses and freelancers export client proposals, sales estimates, and billing sheets with crisp tables and brand logos."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Input Formats",
        "value": ".docx, .doc (Microsoft Word 97-2024, Office 365, LibreOffice Writer)"
      },
      {
        "label": "Output Standard",
        "value": "ISO 32000-1 PDF (Universal Reader Compatible)"
      },
      {
        "label": "Processing Architecture",
        "value": "In-Browser Client-Side Engine (Zero Server File Persistence)"
      },
      {
        "label": "Character Encodings",
        "value": "UTF-8, WinAnsi, Arabic/Urdu RTL, Indic, CJK, Cyrillic, Greek"
      },
      {
        "label": "Max File Batch",
        "value": "Up to 10 files per conversion session"
      }
    ],
    "proTips": [
      "Ensure standard font families (Arial, Times New Roman, Calibri, Georgia) are used for optimal cross-platform rendering.",
      "For complex multi-column documents, verify table boundaries before exporting to maintain exact column widths.",
      "Use high-resolution PNG or JPEG images in your Word file for crystal-clear printed results."
    ],
    "faqs": [
      {
        "q": "Will my document formatting and tables be preserved?",
        "a": "Yes. PDFora parses paragraph alignments, font styles (bold, italic, underline), embedded images, and data tables to recreate an exact visual representation in PDF format."
      },
      {
        "q": "Are my confidential documents uploaded to any remote server?",
        "a": "No. PDFora processes DOCX files natively in your browser session. Your documents never leave your device, ensuring complete privacy and compliance with data protection laws."
      },
      {
        "q": "Can I convert multilingual Word files containing Urdu, Arabic, or Chinese?",
        "a": "Absolutely. Our universal font cascade supports right-to-left (RTL) scripts, Devanagari, East Asian CJK characters, European accents, and math symbols seamlessly."
      },
      {
        "q": "Do I need Microsoft Office installed on my computer?",
        "a": "No software installation is required. PDFora works completely in your web browser across Windows, macOS, Linux, iPhone, iPad, and Android."
      }
    ],
    "metaTitle": "Word to PDF Converter Online Free — DOCX to PDF | PDFora",
    "metaDescription": "Convert Microsoft Word (.docx, .doc) documents to PDF online for free. Preserves formatting, tables, fonts, and images with 100% private in-browser processing.",
    "h1Title": "Word to PDF Converter Online",
    "primaryKeywords": [
      "word to pdf",
      "convert docx to pdf",
      "word to pdf online free",
      "doc to pdf",
      "convert word to pdf"
    ],
    "relatedToolIds": [
      "pdf-to-word",
      "excel-to-pdf",
      "powerpoint-to-pdf",
      "merge-pdf"
    ]
  },
  {
    "id": "excel-to-pdf",
    "name": "Excel to PDF",
    "slug": "excel-to-pdf",
    "path": "/excel-to-pdf",
    "category": "documents",
    "shortDesc": "Convert Excel spreadsheets (XLS, XLSX) into readable PDF documents.",
    "description": "Transform Microsoft Excel sheets into perfectly formatted PDFs. Control table scaling, page orientation, and sheet selection.",
    "iconName": "Table",
    "badge": "Popular",
    "acceptedTypes": ".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "acceptedFileLabel": "XLS, XLSX files",
    "maxFiles": 5,
    "options": [
      {
        "id": "fitPages",
        "label": "Table Scaling",
        "type": "select",
        "default": "fit-width",
        "choices": [
          {
            "value": "fit-width",
            "label": "Fit All Columns on One Page"
          },
          {
            "value": "actual-size",
            "label": "Actual Sheet Size"
          },
          {
            "value": "fit-sheet",
            "label": "Fit Whole Sheet on One Page"
          }
        ]
      },
      {
        "id": "orientation",
        "label": "Orientation",
        "type": "select",
        "default": "landscape",
        "choices": [
          {
            "value": "landscape",
            "label": "Landscape (Recommended for tables)"
          },
          {
            "value": "portrait",
            "label": "Portrait"
          }
        ]
      }
    ],
    "features": [
      "Auto-fits wide tables and columns cleanly on single pages",
      "Preserves cell grids, numbers, currencies, and formula outputs",
      "Supports multi-sheet workbooks in sequential order",
      "Client-side computation ensures sensitive financial figures remain private"
    ],
    "steps": [
      "Select or drag and drop your Excel spreadsheet (.xlsx or .xls).",
      "Choose your table scaling preference (Fit Width or Actual Size) and orientation.",
      "Click \"Convert to PDF\" and download your publication-ready document."
    ],
    "overview": "Converting spreadsheets to PDF is often frustrating due to cut-off columns, orphaned rows, and broken financial tables. PDFora Excel to PDF converter intelligently detects table boundaries and scales wide financial worksheets cleanly across landscape or portrait PDF pages. Financial analysts, accountants, and administrators can create polished reports without needing complex print-area configurations in Excel.",
    "useCases": [
      {
        "title": "Financial Statements & Audits",
        "desc": "Accountants export balance sheets, profit-and-loss statements, and cash-flow projections with aligned numbers and currency symbols."
      },
      {
        "title": "Project Timelines & Gantt Charts",
        "desc": "Project managers transform task schedules and milestone tracking sheets into easy-to-share executive PDF summaries."
      },
      {
        "title": "Inventory & Stock Records",
        "desc": "Warehouse and retail managers compile stock counts, product catalogs, and price lists into unalterable PDF files."
      },
      {
        "title": "Grade Books & Attendance Records",
        "desc": "Teachers and academic staff generate clean student scorecards and semester attendance sheets for printing."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Input Formats",
        "value": ".xlsx, .xls (Microsoft Excel 97-2024, Google Sheets export, CSV)"
      },
      {
        "label": "Scaling Modes",
        "value": "Fit Width, Actual Sheet Size, Fit Whole Sheet"
      },
      {
        "label": "Multi-Sheet Handling",
        "value": "Sequential page compilation across all workbook sheets"
      },
      {
        "label": "Data Security",
        "value": "100% In-Memory Processing (No financial data transmission)"
      },
      {
        "label": "Max File Size",
        "value": "Up to 50 MB spreadsheets per session"
      }
    ],
    "proTips": [
      "Choose Landscape orientation for sheets with more than 6 columns to prevent narrow cell text wrapping.",
      "Hide calculation scratchpad columns in Excel before conversion if you only want the summary table visible.",
      "Use the \"Fit All Columns\" option to guarantee your table never splits horizontally across pages."
    ],
    "faqs": [
      {
        "q": "Does it support workbooks with multiple sheets/tabs?",
        "a": "Yes. Every worksheet contained in your Excel workbook is compiled sequentially into the output PDF document."
      },
      {
        "q": "Will my cell formulas display correctly?",
        "a": "The converter calculates and outputs the final displayed values, formatted numbers, percentages, and currencies."
      },
      {
        "q": "Are my financial spreadsheets secure?",
        "a": "Completely. Files are parsed entirely in your browser without transmitting your numbers to remote servers."
      },
      {
        "q": "Can I convert .xls files created in older Excel versions?",
        "a": "Yes. Both modern XML-based .xlsx files and legacy binary .xls files from Excel 97–2003 are fully supported."
      }
    ],
    "metaTitle": "Excel to PDF Converter Online Free — XLSX to PDF | PDFora",
    "metaDescription": "Convert Excel spreadsheets (.xlsx, .xls) to PDF online for free. Auto-fit wide columns, keep formula values, and format clean PDF reports privately.",
    "h1Title": "Excel to PDF Converter Online",
    "primaryKeywords": [
      "excel to pdf",
      "xlsx to pdf converter",
      "convert excel to pdf online",
      "xls to pdf",
      "spreadsheet to pdf"
    ],
    "relatedToolIds": [
      "pdf-to-excel",
      "word-to-pdf",
      "word-to-excel",
      "compress-pdf"
    ]
  },
  {
    "id": "powerpoint-to-pdf",
    "name": "PowerPoint to PDF",
    "slug": "powerpoint-to-pdf",
    "path": "/powerpoint-to-pdf",
    "category": "pdf",
    "shortDesc": "Convert PPT and PPTX presentations into PDF handouts.",
    "description": "Turn Microsoft PowerPoint slides into high-resolution PDF documents for easy sharing, viewing, and printing.",
    "iconName": "Presentation",
    "badge": "",
    "acceptedTypes": ".ppt, .pptx, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "acceptedFileLabel": "PPT, PPTX files",
    "maxFiles": 5,
    "options": [
      {
        "id": "slidesPerPage",
        "label": "Slides Per Page",
        "type": "select",
        "default": "1",
        "choices": [
          {
            "value": "1",
            "label": "1 Slide per page (Full Screen 16:9)"
          },
          {
            "value": "2",
            "label": "2 Slides per page (Handout)"
          },
          {
            "value": "4",
            "label": "4 Slides per page (Grid)"
          }
        ]
      }
    ],
    "features": [
      "Widescreen 16:9 and standard 4:3 slide geometry preserved",
      "Maintains typography, diagrams, shapes, and color schemes",
      "Supports PPTX and legacy PPT presentations",
      "Creates compact, lightweight PDF handouts ideal for emailing"
    ],
    "steps": [
      "Upload your PowerPoint (.pptx or .ppt) presentation.",
      "Select your preferred slide layout (Full Screen 1 Slide per page or Handout).",
      "Click \"Convert to PDF\" to generate and download your PDF slides."
    ],
    "overview": "Presentations shared as raw PPTX files frequently suffer from missing fonts, broken slide layouts, or unwanted accidental edits on target computers. PDFora PowerPoint to PDF converter freezes your slides into standard, tamper-proof PDF documents. Every slide retains its exact dimensions, typography, embedded imagery, and visual hierarchy, ensuring your presentation looks identical on projectors, tablets, and smartphones.",
    "useCases": [
      {
        "title": "Conference Handouts & Slide Decks",
        "desc": "Speakers and keynote presenters export slide decks for attendees to review and annotate on laptops or mobile devices."
      },
      {
        "title": "Investor Pitch Decks",
        "desc": "Startup founders convert confidential pitch decks into secure, uneditable PDFs to share with venture capitalists and angel investors."
      },
      {
        "title": "Classroom Lecture Slides",
        "desc": "Professors and educators distribute lecture notes in 2-up or 4-up handout formats for student printing and note-taking."
      },
      {
        "title": "Corporate Training Modules",
        "desc": "HR and training departments produce standardized training manuals and compliance decks for employee onboarding."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Input Formats",
        "value": ".pptx, .ppt (Microsoft PowerPoint 97-2024, Google Slides export, Keynote export)"
      },
      {
        "label": "Slide Aspect Ratios",
        "value": "16:9 Widescreen, 16:10, 4:3 Standard"
      },
      {
        "label": "Output Document Format",
        "value": "Vector-enabled High DPI PDF"
      },
      {
        "label": "Processing Security",
        "value": "100% Client-Side In-Memory Execution"
      },
      {
        "label": "Max File Limit",
        "value": "Up to 5 presentations per batch"
      }
    ],
    "proTips": [
      "For printing physical notes, select \"2 Slides per page\" to balance readability with paper conservation.",
      "Ensure high-contrast text against slide background colors to ensure legibility when projected in bright rooms.",
      "Convert your presentation to PDF before uploading to LinkedIn Slides or SlideShare for perfect slide transitions."
    ],
    "faqs": [
      {
        "q": "Will slide animations and sound effects be included in the PDF?",
        "a": "PDF is a static page format. Animations and audio clips are flattened into their final visual appearance on each slide."
      },
      {
        "q": "Are custom embedded fonts and vector shapes preserved?",
        "a": "Yes. Slide layouts, vector geometries, shapes, and typography are rendered cleanly in the PDF output."
      },
      {
        "q": "Can I view the converted PDF in full screen like a slideshow?",
        "a": "Yes. Modern PDF readers (Adobe Acrobat, Chrome, Edge, Apple Preview) offer Full-Screen Presentation Mode (Ctrl+L or Cmd+L)."
      }
    ],
    "metaTitle": "PowerPoint to PDF Converter Online Free — PPTX to PDF | PDFora",
    "metaDescription": "Convert PowerPoint presentations (.pptx, .ppt) to high-resolution PDF handouts online for free. Fast, private slide conversion with zero uploads.",
    "h1Title": "PowerPoint to PDF Converter Online",
    "primaryKeywords": [
      "powerpoint to pdf",
      "pptx to pdf",
      "convert ppt to pdf online",
      "slides to pdf",
      "presentation to pdf"
    ],
    "relatedToolIds": [
      "word-to-pdf",
      "excel-to-pdf",
      "pdf-to-jpg",
      "merge-pdf"
    ]
  },
  {
    "id": "jpg-to-pdf",
    "name": "JPG to PDF",
    "slug": "jpg-to-pdf",
    "path": "/jpg-to-pdf",
    "category": "pdf",
    "popular": true,
    "shortDesc": "Convert JPG, PNG, WEBP and BMP images into a clean single PDF.",
    "description": "Combine multiple images into one ordered PDF document. Reorder images, set custom margins, and adjust page dimensions.",
    "iconName": "Image",
    "badge": "Popular",
    "acceptedTypes": ".jpg, .jpeg, .png, .webp, .bmp, image/jpeg, image/png, image/webp",
    "acceptedFileLabel": "JPG, PNG, WEBP, BMP images",
    "maxFiles": 30,
    "options": [
      {
        "id": "pageSize",
        "label": "PDF Page Size",
        "type": "select",
        "default": "auto",
        "choices": [
          {
            "value": "auto",
            "label": "Auto (Match Image Aspect Ratio)"
          },
          {
            "value": "a4",
            "label": "A4 (Standard Paper)"
          },
          {
            "value": "us-letter",
            "label": "US Letter"
          }
        ]
      },
      {
        "id": "margin",
        "label": "Image Margin",
        "type": "select",
        "default": "small",
        "choices": [
          {
            "value": "none",
            "label": "No Margin (Full Bleed)"
          },
          {
            "value": "small",
            "label": "Small Margin"
          },
          {
            "value": "large",
            "label": "Large Margin"
          }
        ]
      }
    ],
    "features": [
      "Combine up to 30 mixed image formats (JPG, PNG, WEBP, BMP) into 1 PDF",
      "Smart page auto-orientation matching portrait and landscape photos",
      "Custom margin settings and standard A4/Letter page scaling",
      "100% private in-browser image assembly"
    ],
    "steps": [
      "Upload or drag & drop one or multiple images.",
      "Reorder images and customize page size and margin settings.",
      "Click \"Convert to PDF\" to generate and download your PDF document."
    ],
    "overview": "Assembling photographic evidence, scanned receipts, textbook notes, and presentation graphics into a single document is easiest in PDF format. PDFora JPG to PDF converter allows you to combine up to 30 images in any sequence. You can configure page orientation, margins, and paper sizes (A4 or US Letter) to ensure your photo document prints cleanly without clipping.",
    "useCases": [
      {
        "title": "Expense Receipts & Tax Invoices",
        "desc": "Freelancers and business travelers snap photos of expense receipts and compile them into a monthly PDF report for expense reimbursement."
      },
      {
        "title": "Scanned IDs, Passports & Certificates",
        "desc": "Applicants combine front and back photos of identification cards, driving licenses, and degree certificates into unified PDF submissions."
      },
      {
        "title": "Photography Portfolios & Lookbooks",
        "desc": "Photographers and graphic designers assemble high-resolution portfolio books for client presentation."
      },
      {
        "title": "Handwritten Notes & Exam Papers",
        "desc": "Students snap photos of physical notebook pages and combine them into single organized PDF documents for submission."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Image Formats",
        "value": "JPG, JPEG, PNG, WEBP, BMP, GIF (static)"
      },
      {
        "label": "Max Images Per Batch",
        "value": "Up to 30 high-resolution images"
      },
      {
        "label": "Page Sizing Options",
        "value": "Auto-fit, Standard A4, US Letter"
      },
      {
        "label": "Compression Quality",
        "value": "High-Fidelity 96% JPEG compression without artifacting"
      },
      {
        "label": "Privacy Standard",
        "value": "Pure Client-Side In-Memory Processing"
      }
    ],
    "proTips": [
      "Use \"Auto (Match Image Aspect Ratio)\" if you want each PDF page to match the exact dimensions of your original photo.",
      "Select \"No Margin\" for full-bleed photo albums and presentation artwork.",
      "Drag thumbnail cards in the dropzone to quickly arrange the exact page sequence before converting."
    ],
    "faqs": [
      {
        "q": "Can I combine different image formats (e.g. JPG and PNG together)?",
        "a": "Yes. You can upload any combination of JPG, PNG, WEBP, and BMP files in the same batch."
      },
      {
        "q": "Will image quality degrade during conversion?",
        "a": "No. PDFora embeds images at original DPI resolution to ensure crystal-clear text and sharp photo details."
      },
      {
        "q": "Is there a limit on how many images I can merge?",
        "a": "You can combine up to 30 images in a single batch on our free platform."
      }
    ],
    "metaTitle": "JPG to PDF Converter Online Free — Images to PDF | PDFora",
    "metaDescription": "Convert JPG, PNG, WEBP, and BMP images into a single PDF online for free. Reorder pages, set orientation and margins with instant client-side processing.",
    "h1Title": "JPG to PDF Converter Online",
    "primaryKeywords": [
      "jpg to pdf",
      "image to pdf converter",
      "convert jpg to pdf online",
      "png to pdf",
      "photos to pdf"
    ],
    "relatedToolIds": [
      "pdf-to-jpg",
      "merge-pdf",
      "image-converter",
      "image-compressor"
    ]
  },
  {
    "id": "pdf-to-jpg",
    "name": "PDF to JPG",
    "slug": "pdf-to-jpg",
    "path": "/pdf-to-jpg",
    "category": "pdf",
    "shortDesc": "Extract all pages or images from a PDF into high-quality JPGs.",
    "description": "Convert every page of your PDF into high-resolution JPG images, or extract embedded images directly.",
    "iconName": "FileImage",
    "badge": "",
    "acceptedTypes": ".pdf, application/pdf",
    "acceptedFileLabel": "PDF document",
    "maxFiles": 1,
    "options": [
      {
        "id": "mode",
        "label": "Extraction Mode",
        "type": "select",
        "default": "entire-page",
        "choices": [
          {
            "value": "entire-page",
            "label": "Convert Entire PDF Pages to JPG"
          }
        ]
      }
    ],
    "features": [
      "High-DPI 2.0x supersampled rendering for razor-sharp text and graphics",
      "Multi-page PDFs automatically packaged into a convenient ZIP archive",
      "Single-page PDFs download directly as standalone JPG files",
      "Complete multilingual CMap support for international scripts"
    ],
    "steps": [
      "Upload the PDF document you wish to convert to images.",
      "Click \"Convert to JPG\" to start high-resolution page rendering.",
      "Download your individual JPG image or ZIP archive containing all pages."
    ],
    "overview": "When you need to embed a PDF page into a website, social media post, PowerPoint slide, or graphic design project, converting the PDF into an image is the cleanest solution. PDFora PDF to JPG engine uses high-density 2x canvas supersampling to render vector text, tables, and photos with crisp clarity. International CMap font tables are loaded automatically to ensure Arabic, Urdu, CJK, and Indic characters render without missing glyphs.",
    "useCases": [
      {
        "title": "Social Media & Marketing Graphics",
        "desc": "Marketers extract PDF report summaries and infographics into JPGs for posting on LinkedIn, Twitter, and Instagram."
      },
      {
        "title": "Website & Blog Article Illustration",
        "desc": "Content creators convert PDF diagrams and document covers into lightweight web-ready JPG images."
      },
      {
        "title": "Slide Embeds & Keynote Presentations",
        "desc": "Professionals insert specific PDF report pages directly into PowerPoint or Google Slides as high-res images."
      },
      {
        "title": "Mobile Sharing on Messaging Apps",
        "desc": "Users convert official certificates and notices into images for instant preview in WhatsApp groups without requiring a PDF reader."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Render Engine",
        "value": "PDF.js High-DPI Canvas Supersampling (2.0x scale)"
      },
      {
        "label": "Output Image Format",
        "value": "JPEG (High Quality 95% Encoding)"
      },
      {
        "label": "Font & Glyph Support",
        "value": "Full Unicode CMap & Embedded TrueType/OpenType Rendering"
      },
      {
        "label": "Archive Format",
        "value": "Standard ZIP for multi-page documents"
      },
      {
        "label": "Security",
        "value": "In-Browser Execution (Zero remote server storage)"
      }
    ],
    "proTips": [
      "Single-page PDFs download instantly as single .jpg files without needing unzipping software.",
      "For multi-page documents, files are named sequentially (e.g., page_1.jpg, page_2.jpg) inside the downloaded ZIP.",
      "The 2x supersampling ensures text remains readable even when zoomed in on high-resolution Retina displays."
    ],
    "faqs": [
      {
        "q": "Will the extracted JPG images be blurry?",
        "a": "No. PDFora renders pages at double resolution (2.0x scale) with anti-aliasing to ensure text and lines remain sharp."
      },
      {
        "q": "How do I access images if my PDF has multiple pages?",
        "a": "If your PDF contains multiple pages, all converted JPG images are packaged into a single, organized ZIP file."
      },
      {
        "q": "Are password-protected PDFs supported?",
        "a": "You must unlock password-protected PDFs before conversion so the rendering engine can read the document streams."
      }
    ],
    "metaTitle": "PDF to JPG Converter Online Free — Extract PDF to Images | PDFora",
    "metaDescription": "Convert PDF pages into high-resolution JPG images online for free. Extract individual pages or full document image archives with zero quality loss.",
    "h1Title": "PDF to JPG Converter Online",
    "primaryKeywords": [
      "pdf to jpg",
      "convert pdf to jpg online",
      "pdf to image converter",
      "extract images from pdf",
      "pdf to jpeg"
    ],
    "relatedToolIds": [
      "jpg-to-pdf",
      "image-compressor",
      "image-converter",
      "split-pdf"
    ]
  },
  {
    "id": "merge-pdf",
    "name": "Merge PDF",
    "slug": "merge-pdf",
    "path": "/merge-pdf",
    "category": "pdf",
    "popular": true,
    "shortDesc": "Combine multiple PDF documents into a single organized file.",
    "description": "Merge two or more PDF files into a single, unified document. Drag and drop to reorder files and preview page counts.",
    "iconName": "Layers",
    "badge": "Popular",
    "acceptedTypes": ".pdf, application/pdf",
    "acceptedFileLabel": "PDF documents",
    "maxFiles": 20,
    "options": [
      {
        "id": "sorting",
        "label": "File Sorting",
        "type": "select",
        "default": "custom",
        "choices": [
          {
            "value": "custom",
            "label": "Custom Drag & Drop Order"
          },
          {
            "value": "name-asc",
            "label": "Name (A to Z)"
          },
          {
            "value": "name-desc",
            "label": "Name (Z to A)"
          }
        ]
      }
    ],
    "features": [
      "Combine up to 20 PDF files simultaneously in one batch",
      "Drag-and-drop card reordering or automatic alphabetical sorting",
      "Preserves original vector bookmarks, hyperlinked structures, and metadata",
      "100% private in-browser document compilation"
    ],
    "steps": [
      "Upload two or more PDF files you want to join.",
      "Drag items into your preferred sequential order or choose A-Z sorting.",
      "Click \"Merge PDF\" to download the unified, single PDF file."
    ],
    "overview": "Combining multiple standalone documents—such as cover letters, project proposals, appendices, and scanned certificates—into one continuous PDF is essential for business and academic workflows. PDFora Merge PDF tool operates with zero server upload delay. Pages and metadata trees are concatenated directly in memory, producing a clean, unified PDF without re-compressing or degrading original graphics.",
    "useCases": [
      {
        "title": "Job & University Application Packages",
        "desc": "Combine cover letters, resumes, transcripts, and letters of recommendation into one professional submission file."
      },
      {
        "title": "Legal Dossiers & Case Files",
        "desc": "Lawyers merge evidence documents, client affidavits, and exhibit sheets into single sequential legal briefs."
      },
      {
        "title": "Monthly Financial Reports",
        "desc": "Finance teams unite departmental spending reports, audit sheets, and executive summaries into an annual ledger."
      },
      {
        "title": "E-Books & Manual Compilation",
        "desc": "Authors and publishers concatenate individual chapter drafts into complete digital books."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Max Files Per Batch",
        "value": "Up to 20 PDF documents simultaneously"
      },
      {
        "label": "Page Limit",
        "value": "No artificial page count limit"
      },
      {
        "label": "Metadata Preservation",
        "value": "Retains embedded fonts, vector paths, and page dimensions"
      },
      {
        "label": "Execution Speed",
        "value": "Near-instantaneous in-memory stream concatenation"
      },
      {
        "label": "Privacy Standard",
        "value": "100% In-Browser Memory Processing"
      }
    ],
    "proTips": [
      "Arrange documents in the exact order you want them to appear in the final combined file before clicking Merge.",
      "Use alphabetical sorting (Name A-Z) if your files are numbered sequentially (e.g. 01_intro.pdf, 02_body.pdf).",
      "Compress your merged document afterward using our Compress PDF tool if the combined file exceeds email attachment limits."
    ],
    "faqs": [
      {
        "q": "Can I merge PDFs that have different page orientations or sizes?",
        "a": "Yes. PDFora preserves the individual orientation (portrait/landscape) and dimensions of every single page during merging."
      },
      {
        "q": "Will merging reduce the quality of text or photos in my PDFs?",
        "a": "No. The merging process joins the raw PDF streams without re-sampling images or converting text to bitmaps."
      },
      {
        "q": "How many PDF files can I merge at once?",
        "a": "You can merge up to 20 PDF files in a single batch on our free platform."
      }
    ],
    "metaTitle": "Merge PDF Files Online Free — Combine Multiple PDFs | PDFora",
    "metaDescription": "Merge multiple PDF files into one single document online for free. Reorder pages with drag & drop and combine unlimited PDFs securely in your browser.",
    "h1Title": "Merge PDF Files Online",
    "primaryKeywords": [
      "merge pdf",
      "combine pdf files",
      "merge pdf online free",
      "join pdf files",
      "pdf merger"
    ],
    "relatedToolIds": [
      "split-pdf",
      "compress-pdf",
      "word-to-pdf",
      "jpg-to-pdf"
    ]
  },
  {
    "id": "compress-pdf",
    "name": "Compress PDF",
    "slug": "compress-pdf",
    "path": "/compress-pdf",
    "category": "pdf",
    "popular": true,
    "shortDesc": "Reduce PDF file size while retaining maximum visual quality.",
    "description": "Optimize and shrink large PDF files for faster email attachment and web uploading without sacrificing readability.",
    "iconName": "Minimize2",
    "badge": "Essential",
    "acceptedTypes": ".pdf, application/pdf",
    "acceptedFileLabel": "PDF document",
    "maxFiles": 5,
    "options": [
      {
        "id": "compressionLevel",
        "label": "Compression Preset",
        "type": "radio",
        "default": "recommended",
        "choices": [
          {
            "value": "extreme",
            "label": "Extreme Compression",
            "desc": "Maximum size reduction (~70-80% smaller), optimized for strict upload limits"
          },
          {
            "value": "recommended",
            "label": "Recommended Compression",
            "desc": "Optimal balance between lightweight size and sharp visual quality (~50% smaller)"
          },
          {
            "value": "less",
            "label": "Less Compression",
            "desc": "High visual preservation with subtle stream deflation (~25% smaller)"
          }
        ]
      }
    ],
    "features": [
      "Reduce file size by up to 80% with smart vector and bitmap stream optimization",
      "3 tailored compression presets (Extreme, Recommended, Less)",
      "Removes redundant metadata and unused font objects",
      "Private in-browser compression ensures zero confidential data leakage"
    ],
    "steps": [
      "Upload your large PDF file.",
      "Choose your preferred compression preset (Recommended, Extreme, or Less).",
      "Click \"Compress PDF\" to download your lightweight, optimized document."
    ],
    "overview": "Oversized PDF files cause email bounces, slow web downloads, and trigger upload rejections on government and job portal forms with strict 2MB or 5MB limits. PDFora Compress PDF utility optimizes embedded image streams, deflates object streams, and strips redundant metadata without sacrificing text sharpness. The result is a lightweight, email-ready PDF that looks crisp on screens and prints clearly.",
    "useCases": [
      {
        "title": "Email Attachment Limit Compliance",
        "desc": "Shrink multi-megabyte presentations and catalogs to fit within Gmail, Outlook, and corporate 25MB attachment limits."
      },
      {
        "title": "Government & University Portal Uploads",
        "desc": "Meet strict 2MB or 5MB file-size limits on immigration, visa, civil service, and university admission portals."
      },
      {
        "title": "Fast Web Publishing & SEO Optimization",
        "desc": "Reduce PDF load times on business websites and blogs to improve Core Web Vitals and user retention."
      },
      {
        "title": "Mobile Storage & Cloud Archiving",
        "desc": "Save gigabytes of space when storing thousands of scanned invoices, receipts, and ebooks on cloud drives."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Optimization Engine",
        "value": "Lossless Stream Deflation & High-Density Bitmap Resampling"
      },
      {
        "label": "Presets Available",
        "value": "Extreme (High Reduction), Recommended (Balanced), Less (High Quality)"
      },
      {
        "label": "Text & Vector Sharpness",
        "value": "100% Vector Text Preservation (Fonts remain sharp)"
      },
      {
        "label": "Execution Location",
        "value": "100% In-Browser Memory (Zero remote server storage)"
      },
      {
        "label": "Batch Processing",
        "value": "Up to 5 files per session"
      }
    ],
    "proTips": [
      "Use \"Recommended\" for general office documents, resumes, and business presentations.",
      "Select \"Extreme\" when an online portal strictly requires files under 2MB or 1MB.",
      "Text and vector lines will never become blurry because compression focuses primarily on image stream density."
    ],
    "faqs": [
      {
        "q": "Will my text become blurry after compression?",
        "a": "No. Vector text, outlines, and fonts remain 100% sharp. Compression optimizes high-density image elements and strips unneeded stream overhead."
      },
      {
        "q": "How much can I reduce my PDF file size?",
        "a": "Size reduction typically ranges from 25% to 80% depending on the volume and density of images in the original PDF."
      },
      {
        "q": "Is my compressed PDF safe from third-party interception?",
        "a": "Yes. Compression executes in your browser session using WebAssembly. Your files are not stored on any remote disk."
      }
    ],
    "metaTitle": "Compress PDF Online Free — Reduce PDF File Size | PDFora",
    "metaDescription": "Compress PDF files online for free without losing quality. Reduce document size for email, portals, and web publishing with 100% private in-browser processing.",
    "h1Title": "Compress PDF Online Free",
    "primaryKeywords": [
      "compress pdf",
      "reduce pdf size",
      "compress pdf online free",
      "shrink pdf",
      "pdf compressor"
    ],
    "relatedToolIds": [
      "merge-pdf",
      "split-pdf",
      "pdf-to-word",
      "image-compressor"
    ]
  },
  {
    "id": "split-pdf",
    "name": "Split PDF",
    "slug": "split-pdf",
    "path": "/split-pdf",
    "category": "pdf",
    "shortDesc": "Separate one PDF into individual pages or specific page ranges.",
    "description": "Extract specific pages or split a long PDF into multiple smaller documents effortlessly.",
    "iconName": "Scissors",
    "badge": "",
    "acceptedTypes": ".pdf, application/pdf",
    "acceptedFileLabel": "PDF document",
    "maxFiles": 1,
    "options": [
      {
        "id": "splitMode",
        "label": "Split Mode",
        "type": "select",
        "default": "range",
        "choices": [
          {
            "value": "range",
            "label": "Extract Specific Pages (e.g. 1, 3, 5-8)"
          },
          {
            "value": "all",
            "label": "Extract All Pages as Individual PDFs"
          },
          {
            "value": "odd-even",
            "label": "Separate Odd / Even Pages"
          }
        ]
      },
      {
        "id": "customRanges",
        "label": "Enter Exact Page Numbers (e.g. 1, 3, 5-8 or 2)",
        "type": "text",
        "default": "",
        "placeholder": "e.g. 1, 3, 5-8 or 2",
        "dependsOn": {
          "id": "splitMode",
          "value": "range"
        }
      },
      {
        "id": "oddEvenSelect",
        "label": "Select Which Pages to Extract",
        "type": "select",
        "default": "odd",
        "choices": [
          {
            "value": "odd",
            "label": "Odd Pages Only (1, 3, 5...)"
          },
          {
            "value": "even",
            "label": "Even Pages Only (2, 4, 6...)"
          }
        ],
        "dependsOn": {
          "id": "splitMode",
          "value": "odd-even"
        }
      }
    ],
    "features": [
      "Extract only the exact page numbers or ranges you specify",
      "Separate entire PDF documents into single-page files packed in a ZIP",
      "Odd and Even page extraction for double-sided manual printing",
      "Maintains original vector quality, hyperlinks, and document formatting"
    ],
    "steps": [
      "Upload the PDF document you wish to split.",
      "Enter specific page numbers (e.g. 1, 4, 7-10) or choose Odd/Even/All mode.",
      "Click \"Split PDF\" to generate and download your extracted document or ZIP."
    ],
    "overview": "Large PDF documents like books, government forms, contracts, and court filings often contain pages you do not need to share. PDFora Split PDF tool gives you surgical control to extract exactly the pages you specify (e.g. page 3, or pages 1, 4, 7-10). You can also extract all pages into individual single-page PDFs or separate odd and even pages for manual duplex printing.",
    "useCases": [
      {
        "title": "Extracting Specific Agreement Pages",
        "desc": "Extract and send only the signature page or summary clause of a 50-page commercial lease agreement."
      },
      {
        "title": "Chapter Extraction from E-Books & Textbooks",
        "desc": "Students and educators extract specific book chapters and study units to share with study groups."
      },
      {
        "title": "Double-Sided Printing Preparation",
        "desc": "Separate odd and even pages to easily print double-sided documents on standard single-sided desktop printers."
      },
      {
        "title": "Confidential Page Redaction / Removal",
        "desc": "Isolate and share public sections of a document while omitting confidential internal pages."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Split Modes",
        "value": "Custom Page Ranges, Single Page Extraction, Odd/Even, Extract All"
      },
      {
        "label": "Range Syntax",
        "value": "Comma-separated lists & ranges (e.g. 1, 3, 5-8, 12)"
      },
      {
        "label": "Output Document Types",
        "value": "Standalone PDF or ZIP archive containing single pages"
      },
      {
        "label": "Stream Quality",
        "value": "100% Lossless Vector Copy (Zero re-rasterization)"
      },
      {
        "label": "Security Standard",
        "value": "Pure In-Browser Client Execution"
      }
    ],
    "proTips": [
      "To extract a single page, enter just its number (e.g. 3) in the range input box.",
      "Use commas and dashes together (e.g. 1, 3-5, 9) to extract non-consecutive sections in one operation.",
      "Extracting pages preserves the original vector typography and embedded links without quality loss."
    ],
    "faqs": [
      {
        "q": "Can I extract non-consecutive pages (e.g., pages 1, 4, and 7)?",
        "a": "Yes. Simply enter \"1, 4, 7\" in the page range box, and only those exact pages will be extracted into your new PDF."
      },
      {
        "q": "What happens if I select \"Extract All Pages\"?",
        "a": "Every single page of your PDF is extracted into its own individual PDF file, and all files are packaged into a clean ZIP archive for download."
      },
      {
        "q": "Will splitting damage the quality of text or embedded images?",
        "a": "No. PDFora extracts the raw page objects directly from the PDF stream without re-compression, preserving 100% of the original quality."
      }
    ],
    "metaTitle": "Split PDF Online Free — Extract & Separate PDF Pages | PDFora",
    "metaDescription": "Split PDF documents into individual pages or custom page ranges online for free. Fast, accurate, and completely private client-side page extraction.",
    "h1Title": "Split PDF Online Free",
    "primaryKeywords": [
      "split pdf",
      "extract pdf pages",
      "separate pdf pages",
      "split pdf online free",
      "pdf splitter"
    ],
    "relatedToolIds": [
      "merge-pdf",
      "compress-pdf",
      "pdf-to-jpg",
      "pdf-to-word"
    ]
  },
  {
    "id": "image-background-remover",
    "name": "Image Background Remover",
    "slug": "image-background-remover",
    "path": "/image-background-remover",
    "category": "images",
    "popular": true,
    "shortDesc": "Remove backgrounds from JPG, PNG, and WebP images automatically with AI.",
    "description": "Instantly cut out background from photos using advanced deep learning segmentation directly in your browser. Download high-resolution PNGs with transparent backgrounds.",
    "iconName": "Sparkles",
    "badge": "New AI",
    "acceptedTypes": ".jpg, .jpeg, .png, .webp, image/jpeg, image/png, image/webp",
    "acceptedFileLabel": "JPG, PNG, WebP images",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Automatic AI foreground segmentation with fine edge detection",
      "Supports portraits, products, animals, logos, and graphics",
      "100% private in-browser WebAssembly neural network processing",
      "Instant interactive before/after split comparison slider",
      "Download crystal-clear PNG with alpha transparency"
    ],
    "steps": [
      "Upload or drag & drop your photo (JPG, PNG, or WebP).",
      "Watch the in-browser AI engine detect the subject and extract the background.",
      "Compare original vs processed results and download your transparent PNG."
    ],
    "overview": "Removing photo backgrounds traditionally required expensive desktop software and tedious manual clipping path masking. PDFora Image Background Remover leverages state-of-the-art WebAssembly deep neural networks to segment subjects automatically in your browser. Hair strands, intricate borders, and product outlines are separated with surgical precision—completely free, without watermarks, and with 100% client-side privacy.",
    "useCases": [
      {
        "title": "E-Commerce Product Listings",
        "desc": "Clean up product photos for Amazon, eBay, Shopify, and Etsy stores by placing items on transparent or pure white backgrounds."
      },
      {
        "title": "Portraits, Headshots & Avatars",
        "desc": "Isolate headshots for LinkedIn resumes, company team rosters, ID badges, and social media profile pictures."
      },
      {
        "title": "Graphic Design & Marketing Creatives",
        "desc": "Extract logos, icons, and hero subjects for promotional flyers, banners, YouTube thumbnails, and presentation slides."
      },
      {
        "title": "Signatures & Stamp Extraction",
        "desc": "Extract clean transparent signatures and authorization stamps to place onto digital agreements and PDF documents."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Input Formats",
        "value": "JPG, JPEG, PNG, WEBP (up to 35 MB)"
      },
      {
        "label": "Output Format",
        "value": "Lossless 32-bit RGBA PNG with 8-bit Alpha Transparency"
      },
      {
        "label": "AI Segmentation Engine",
        "value": "In-Browser ONNX Neural Network (ISNet Deep Learning Architecture)"
      },
      {
        "label": "Resolution Retention",
        "value": "Preserves full native input pixel dimensions"
      },
      {
        "label": "Data Security",
        "value": "100% Client-Side In-Memory Execution (Zero server upload)"
      }
    ],
    "proTips": [
      "Photos with high contrast between the subject and the background produce the crispest cutouts.",
      "For product photography, ensure even lighting across all edges to eliminate dark perimeter shadows.",
      "After removing the background, you can insert the transparent PNG into any PDF or slide deck using our PDF tools."
    ],
    "faqs": [
      {
        "q": "Does PDFora upload my photos to any remote server to remove backgrounds?",
        "a": "No. Unlike other online tools that send your personal photos to third-party cloud servers, PDFora executes neural network AI segmentation directly in your browser memory using WebAssembly. Your photos never leave your device."
      },
      {
        "q": "Is there any watermark or resolution cap on downloaded images?",
        "a": "None! Your output PNG retains its original high-resolution dimensions without any watermark or subscription fee."
      },
      {
        "q": "What image formats are supported?",
        "a": "You can upload JPG, JPEG, PNG, and WebP images up to 35 MB."
      },
      {
        "q": "Can I remove backgrounds from multiple photos in sequence?",
        "a": "Yes. Once your image is processed, simply click \"Process Another Image\" or \"Reset\" to immediately upload another photo."
      }
    ],
    "metaTitle": "Free Image Background Remover Online — Transparent PNG | PDFora",
    "metaDescription": "Remove image backgrounds automatically online for free using AI. Create clean transparent PNG cutouts for portraits, products, and graphics instantly.",
    "h1Title": "Free AI Image Background Remover",
    "primaryKeywords": [
      "image background remover",
      "remove bg free",
      "transparent background maker",
      "background eraser online",
      "remove image background"
    ],
    "relatedToolIds": [
      "image-compressor",
      "image-converter",
      "jpg-to-pdf",
      "pdf-to-jpg"
    ]
  },
  {
    "id": "image-compressor",
    "name": "Image Compressor",
    "slug": "image-compressor",
    "path": "/image-compressor",
    "category": "images",
    "popular": true,
    "shortDesc": "Compress JPG, PNG, and WebP images with custom quality and size controls.",
    "description": "Reduce image file sizes by up to 90% without visible quality degradation. Choose presets, adjust compression quality sliders, or convert formats on the fly.",
    "iconName": "Minimize2",
    "badge": "Fast",
    "acceptedTypes": ".jpg, .jpeg, .png, .webp, image/jpeg, image/png, image/webp",
    "acceptedFileLabel": "JPG, PNG, WebP images",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Shrink image sizes by up to 90% with smart quantization & resampling",
      "Presets for High Quality (88%), Balanced (72%), and Max Compression (42%)",
      "Custom quality slider (10% - 100%) and optional resolution downscaling",
      "Convert between JPG, PNG, and next-gen WebP formats seamlessly",
      "Live before/after comparison slider and accurate space-saved calculation"
    ],
    "steps": [
      "Upload your JPG, PNG, or WebP photo.",
      "Choose your preferred compression preset or fine-tune quality and format.",
      "Preview real calculated size savings and download your optimized image."
    ],
    "overview": "Unoptimized images slow down websites, waste cloud storage, and exceed email attachment limits. PDFora Image Compressor provides fine-grained image optimization directly in your browser. Using advanced color space quantization, discrete cosine transform (DCT) deflating, and high-efficiency WebP/JPEG encoding, you can drastically reduce file sizes while retaining crisp visual quality.",
    "useCases": [
      {
        "title": "Website Performance & SEO Optimization",
        "desc": "Compress blog images and homepage banners to improve Google Core Web Vitals, page speed scores, and user engagement."
      },
      {
        "title": "Email & Messaging Attachments",
        "desc": "Reduce large multi-megabyte photos down to lightweight files that send instantly on WhatsApp, Gmail, and Outlook."
      },
      {
        "title": "Online Portal & Government Form Uploads",
        "desc": "Satisfy strict 500 KB or 1 MB file upload requirements for visa portals, university applications, and government submissions."
      },
      {
        "title": "Mobile Storage & Cloud Backup Savings",
        "desc": "Compress high-resolution smartphone galleries to reclaim gigabytes of phone and Google Drive storage."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Input Formats",
        "value": "JPG, JPEG, PNG, WEBP (up to 50 MB)"
      },
      {
        "label": "Output Formats",
        "value": "WebP (Next-Gen), JPEG, PNG, or Original Format"
      },
      {
        "label": "Compression Presets",
        "value": "High Quality (~88%), Balanced (~72%), Max Compression (~42%), Custom"
      },
      {
        "label": "Resolution Scaling",
        "value": "Keep Native, 4K (3840px), Full HD (1920px), HD (1280px), Web (800px)"
      },
      {
        "label": "Processing Speed",
        "value": "Near-instantaneous in-memory canvas & WebCodecs pipeline"
      }
    ],
    "proTips": [
      "Converting PNG images to WebP can reduce file size by up to 80% with virtually zero perceptible loss in visual detail.",
      "Use the \"Balanced\" preset for general website images, blog posts, and email attachments.",
      "Use the Before/After split slider to verify that text and sharp edges remain crisp before downloading."
    ],
    "faqs": [
      {
        "q": "How much can I reduce my image file size?",
        "a": "Typical file size savings range between 50% and 90% depending on the original image dimensions, format, and chosen compression preset."
      },
      {
        "q": "Will my image lose visible quality after compression?",
        "a": "PDFora uses perceptual compression algorithms designed to remove imperceptible high-frequency noise while preserving sharp edges and color vibrancy."
      },
      {
        "q": "Can I convert my image to WebP format?",
        "a": "Yes! You can choose \"WebP\" in the Output Format dropdown to convert JPG or PNG files into modern lightweight WebP images."
      },
      {
        "q": "Are my private photos uploaded to a server?",
        "a": "No. PDFora compresses images directly in your web browser memory using client-side canvas and WebAssembly, guaranteeing 100% privacy."
      }
    ],
    "metaTitle": "Image Compressor Online Free — Compress JPG, PNG, WebP | PDFora",
    "metaDescription": "Compress JPG, PNG, WebP, and AVIF images online for free. Reduce file size by up to 80% while retaining crisp visual quality with side-by-side preview.",
    "h1Title": "Image Compressor Online Free",
    "primaryKeywords": [
      "image compressor",
      "compress image online",
      "compress jpg",
      "reduce png size",
      "photo compressor"
    ],
    "relatedToolIds": [
      "image-converter",
      "image-background-remover",
      "jpg-to-pdf",
      "video-compressor"
    ]
  },
  {
    "id": "pdf-to-word",
    "name": "PDF to Word",
    "slug": "pdf-to-word",
    "path": "/pdf-to-word",
    "category": "documents",
    "popular": true,
    "shortDesc": "Convert PDF documents to editable Microsoft Word (DOCX) files.",
    "description": "Transform PDF documents into fully editable Microsoft Word (.docx) documents. Preserves headings, paragraphs, bullet lists, formatting, and tables.",
    "iconName": "FileText",
    "badge": "Popular",
    "acceptedTypes": ".pdf, application/pdf",
    "acceptedFileLabel": "PDF document",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Extracts text, headings, and formatting into real editable DOCX format",
      "Detects tabular data and reconstructs structured Word tables",
      "Supports multi-page documents with automatic page break preservation",
      "100% private in-browser client-side execution"
    ],
    "steps": [
      "Upload your PDF document via drag & drop or file selector.",
      "Our engine analyzes text hierarchy, font styles, and columnar data.",
      "Download your genuine, fully editable Microsoft Word (.docx) document."
    ],
    "overview": "Converting read-only PDF files into editable Word documents is essential for revising agreements, updating CVs, and extracting research text. PDFora PDF to Word converter parses text coordinates, detects font weights and headers, reconstructs table columns, and compiles a clean, standardized Office OpenXML (.docx) file directly in your browser.",
    "useCases": [
      {
        "title": "Contract & Agreement Amendments",
        "desc": "Edit contract terms, adjust clauses, and update agreement dates in Word without retyping from scratch."
      },
      {
        "title": "CV & Resume Customization",
        "desc": "Update employment history, contact info, and skills in existing PDF resumes for new job applications."
      },
      {
        "title": "Academic Research & Literature",
        "desc": "Extract quotations, bibliography citations, and journal excerpts into Word documents for thesis drafting."
      },
      {
        "title": "Business Reports & Proposals",
        "desc": "Repurpose existing marketing analyses and executive summaries into newly formatted slide decks or briefs."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Input Standard",
        "value": "ISO 32000-1 PDF (Text-based & Vector PDFs)"
      },
      {
        "label": "Output Format",
        "value": "Microsoft Word Document (.docx - Office OpenXML Standard)"
      },
      {
        "label": "Table Extraction",
        "value": "Automatic multi-column baseline clustering & cell grid generation"
      },
      {
        "label": "Security Standard",
        "value": "100% Client-Side In-Memory Execution (Zero server file persistence)"
      },
      {
        "label": "Max File Batch",
        "value": "1 file per conversion session"
      }
    ],
    "proTips": [
      "Standard digital PDFs with selectable text yield the highest conversion fidelity.",
      "Tables with clear horizontal alignment will automatically convert into formatted Word tables.",
      "Headings and larger titles are mapped to Word Heading 1 and Heading 2 styles for easy navigation."
    ],
    "faqs": [
      {
        "q": "Will the generated file be an actual editable Word (.docx) document?",
        "a": "Yes. PDFora generates a genuine Microsoft Word Office OpenXML (.docx) file compatible with Microsoft Word, Google Docs, Apple Pages, and LibreOffice."
      },
      {
        "q": "Does it support scanned PDFs or image-only documents?",
        "a": "PDFora requires text-based PDFs for vector extraction. If an image-only scanned PDF is uploaded without selectable text, the converter will notify you."
      },
      {
        "q": "Are my confidential documents uploaded to third-party servers?",
        "a": "No. The conversion pipeline executes entirely inside your browser memory using WebAssembly. Your files are never stored or transmitted to external servers."
      }
    ],
    "metaTitle": "PDF to Word Converter Online Free — PDF to DOCX | PDFora",
    "metaDescription": "Convert PDF documents to editable Microsoft Word (.docx) files online for free. Preserves layout, paragraphs, and tables with 100% private processing.",
    "h1Title": "PDF to Word Converter Online",
    "primaryKeywords": [
      "pdf to word",
      "convert pdf to docx",
      "pdf to word converter online free",
      "pdf to doc",
      "edit pdf in word"
    ],
    "relatedToolIds": [
      "word-to-pdf",
      "pdf-to-excel",
      "compress-pdf",
      "merge-pdf"
    ]
  },
  {
    "id": "pdf-to-excel",
    "name": "PDF to Excel",
    "slug": "pdf-to-excel",
    "path": "/pdf-to-excel",
    "category": "documents",
    "shortDesc": "Extract tabular data from PDF files into Microsoft Excel spreadsheets.",
    "description": "Pull tables, financial figures, transaction rows, and data grids from PDF documents directly into clean Microsoft Excel (.xlsx) workbooks.",
    "iconName": "Table",
    "badge": "Popular",
    "acceptedTypes": ".pdf, application/pdf",
    "acceptedFileLabel": "PDF document",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Intelligent table detection and column boundary clustering",
      "Automatic data type casting for numbers, currencies, dates, and text",
      "Creates structured worksheets for multi-page document tables",
      "Auto-sized column widths for immediate readability"
    ],
    "steps": [
      "Upload your PDF containing data tables or financial sheets.",
      "The engine scans coordinates and constructs structured 2D cell grids.",
      "Download your genuine Microsoft Excel (.xlsx) spreadsheet."
    ],
    "overview": "Re-entering data from PDF invoices, bank statements, financial ledgers, and academic tables into spreadsheets by hand is slow and prone to human error. PDFora PDF to Excel converter analyzes spatial positioning across rows and columns to reconstruct clean, typed spreadsheets ready for formulas and data analysis.",
    "useCases": [
      {
        "title": "Bank & Credit Card Statements",
        "desc": "Extract financial transactions, debit/credit amounts, and date columns for accounting reconciliation and tax prep."
      },
      {
        "title": "Vendor Invoices & Purchase Orders",
        "desc": "Import itemized pricing, quantity tables, and VAT calculations into Excel for ERP and inventory updates."
      },
      {
        "title": "Scientific Data & Survey Tables",
        "desc": "Extract research figures, laboratory metrics, and polling tables into Excel for graphing and statistical modeling."
      },
      {
        "title": "Corporate Financial Statements",
        "desc": "Convert balance sheets, P&L tables, and budget projections into malleable Excel workbooks."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Input",
        "value": "PDF Documents (.pdf) containing data tables"
      },
      {
        "label": "Output Standard",
        "value": "Microsoft Excel OpenXML Spreadsheet (.xlsx)"
      },
      {
        "label": "Data Type Detection",
        "value": "Numeric casting, currency stripping, date inference, UTF-8 strings"
      },
      {
        "label": "Multi-Page Handling",
        "value": "Individual page worksheets or combined table compilation"
      },
      {
        "label": "Privacy",
        "value": "100% In-Browser Client Computation"
      }
    ],
    "proTips": [
      "Ensure table columns in the PDF have consistent vertical alignment for optimal column separation.",
      "Numbers with commas or currency symbols are intelligently converted into native numeric cells.",
      "Multi-page PDFs will generate organized \"Page 1\", \"Page 2\" tabs within the same Excel workbook."
    ],
    "faqs": [
      {
        "q": "Will numbers be formatted as actual numbers in Excel?",
        "a": "Yes. PDFora detects numeric values and formats them as real spreadsheet numbers so you can immediately perform sums, averages, and formulas."
      },
      {
        "q": "How does it handle multi-page tables?",
        "a": "Each page of data is compiled into organized worksheet tabs within a single downloadable .xlsx workbook."
      },
      {
        "q": "Are my financial spreadsheets private?",
        "a": "Completely. Files are parsed 100% locally in your web browser session without transmitting sensitive numbers to remote disks."
      }
    ],
    "metaTitle": "PDF to Excel Converter Online Free — PDF to XLSX | PDFora",
    "metaDescription": "Extract tabular data from PDF files into editable Excel (.xlsx, .csv) spreadsheets online for free. Accurate column and row parsing with total privacy.",
    "h1Title": "PDF to Excel Converter Online",
    "primaryKeywords": [
      "pdf to excel",
      "convert pdf to xlsx",
      "pdf to spreadsheet converter",
      "extract tables from pdf",
      "pdf to excel online free"
    ],
    "relatedToolIds": [
      "excel-to-pdf",
      "pdf-to-word",
      "excel-to-word",
      "word-to-excel"
    ]
  },
  {
    "id": "excel-to-word",
    "name": "Excel to Word",
    "slug": "excel-to-word",
    "path": "/excel-to-word",
    "category": "documents",
    "shortDesc": "Convert Excel spreadsheets into styled Microsoft Word document tables.",
    "description": "Transform Microsoft Excel workbooks (.xlsx, .xls, .csv) into beautifully formatted Word (.docx) documents with clean table grids and sheet sections.",
    "iconName": "Table",
    "badge": "New",
    "acceptedTypes": ".xlsx, .xls, .csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv",
    "acceptedFileLabel": "XLSX, XLS, CSV spreadsheets",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Converts spreadsheet grids into styled, professional Word tables",
      "Distinct headings and sections for multi-sheet workbooks",
      "Preserves formatted numbers, currencies, dates, and text alignments",
      "Generates native Office OpenXML (.docx) files"
    ],
    "steps": [
      "Upload your Excel spreadsheet (.xlsx, .xls, or .csv).",
      "Our engine reads worksheets, headers, rows, and cell alignments.",
      "Download your formatted Microsoft Word (.docx) document."
    ],
    "overview": "Sharing raw spreadsheets in formal reports, executive memos, or client proposals often looks unpolished. PDFora Excel to Word converter transforms tabular spreadsheet data into styled Microsoft Word tables with shaded header rows, proper cell borders, right-aligned numbers, and distinct sections for each worksheet in your workbook.",
    "useCases": [
      {
        "title": "Executive Financial Summaries",
        "desc": "Embed quarterly revenue tables and balance sheet overviews directly into Word board meeting documents."
      },
      {
        "title": "Project Milestones & Task Deliverables",
        "desc": "Convert project management tracking sheets into readable Word status reports for stakeholders."
      },
      {
        "title": "Client Invoicing & Billing Schedules",
        "desc": "Transform pricing estimates and hourly breakdown sheets into professional Word invoices."
      },
      {
        "title": "Audit & Compliance Reports",
        "desc": "Compile internal control checklists and inventory counts into formatted Word documentation."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Inputs",
        "value": ".xlsx, .xls (Excel 97-2024), .csv files"
      },
      {
        "label": "Output Standard",
        "value": "Microsoft Word Document (.docx - ISO/IEC 29500)"
      },
      {
        "label": "Table Styling",
        "value": "Accent header shading, alternating row fills, custom cell padding"
      },
      {
        "label": "Multi-Sheet Structure",
        "value": "Sequential Word sections labeled by worksheet name"
      },
      {
        "label": "Execution",
        "value": "100% In-Browser Client-Side Processing"
      }
    ],
    "proTips": [
      "Ensure the first row of your Excel sheet contains clear column headers for the cleanest table appearance in Word.",
      "Multi-sheet workbooks will automatically generate separate labeled tables for each tab in your Word file.",
      "Numbers are aligned to the right and text to the left to maintain professional typographic standards."
    ],
    "faqs": [
      {
        "q": "Does it support workbooks with multiple sheet tabs?",
        "a": "Yes! Every worksheet in your Excel file is converted into its own labeled table inside the resulting Word document."
      },
      {
        "q": "Will cell formulas be visible?",
        "a": "The converter outputs the final calculated values and formatted text from the spreadsheet into the Word table cells."
      },
      {
        "q": "Is my data secure?",
        "a": "Yes. All parsing and Word generation occurs client-side in your browser memory."
      }
    ],
    "metaTitle": "Excel to Word Converter Online Free — XLSX to DOCX | PDFora",
    "metaDescription": "Convert Excel spreadsheets (.xlsx, .xls) to formatted Microsoft Word (.docx) tables online for free. Clean report formatting with zero server uploads.",
    "h1Title": "Excel to Word Converter Online",
    "primaryKeywords": [
      "excel to word",
      "convert xlsx to docx",
      "excel table to word doc",
      "spreadsheet to word",
      "convert excel to word online"
    ],
    "relatedToolIds": [
      "word-to-excel",
      "excel-to-pdf",
      "pdf-to-excel",
      "word-to-pdf"
    ]
  },
  {
    "id": "word-to-excel",
    "name": "Word to Excel",
    "slug": "word-to-excel",
    "path": "/word-to-excel",
    "category": "documents",
    "shortDesc": "Extract tables and structured data from Word documents into Excel.",
    "description": "Extract tables, data rows, key-value pairs, and structured lists from Microsoft Word (.docx) files into clean Microsoft Excel (.xlsx) spreadsheets.",
    "iconName": "FileText",
    "badge": "New",
    "acceptedTypes": ".docx, .doc, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword",
    "acceptedFileLabel": "DOCX, DOC files",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Extracts XML tables (<w:tbl>) into separate Excel worksheet tabs",
      "Intelligently structures key-value pairs and tabular lists into columns",
      "Automatic numeric and currency data type parsing",
      "100% private in-browser client execution"
    ],
    "steps": [
      "Upload your Word document (.docx) containing tables or lists.",
      "The engine parses XML structures and extracts tabular rows and cells.",
      "Download your organized Microsoft Excel (.xlsx) spreadsheet."
    ],
    "overview": "When data is trapped inside Word tables, copying and pasting multiple rows into Excel often results in scrambled columns and broken cell boundaries. PDFora Word to Excel converter parses the underlying document XML structure to extract every table with 100% cell accuracy, placing each table into organized worksheet tabs in a genuine .xlsx workbook.",
    "useCases": [
      {
        "title": "Word Table Data Extraction",
        "desc": "Extract complex product specs, pricing matrices, and employee lists from Word files into Excel for analysis."
      },
      {
        "title": "Contract Pricing & Line-Item Audits",
        "desc": "Pull fee structures and milestone payment tables from Word agreements into spreadsheets for accounting."
      },
      {
        "title": "Survey & Questionnaires Responses",
        "desc": "Convert filled Word feedback forms and assessment rubrics into structured spreadsheet rows."
      },
      {
        "title": "Inventory & Asset Lists",
        "desc": "Transfer hardware logs and catalog tables from Word manuals into active Excel inventory trackers."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Inputs",
        "value": ".docx (Microsoft Word 2007-2024, Google Docs export)"
      },
      {
        "label": "Output Standard",
        "value": "Microsoft Excel OpenXML Spreadsheet (.xlsx)"
      },
      {
        "label": "XML Parser",
        "value": "DOM-level <w:tbl>, <w:tr>, <w:tc> table structure extraction"
      },
      {
        "label": "Fallback Mode",
        "value": "Structured key-value & delimited paragraph row mapping"
      },
      {
        "label": "Privacy",
        "value": "100% In-Browser Client Execution"
      }
    ],
    "proTips": [
      "Word documents containing standard tables (<w:tbl>) will convert with 100% column precision.",
      "If your document has multiple tables, each table is placed into its own dedicated sheet tab in Excel.",
      "Numbers inside cells are automatically parsed into numeric format for immediate spreadsheet calculations."
    ],
    "faqs": [
      {
        "q": "What happens if my Word document has multiple tables?",
        "a": "Each table is extracted into its own worksheet tab (e.g. Table 1, Table 2) within the generated Excel workbook."
      },
      {
        "q": "What if my Word document does not have formal tables?",
        "a": "Our smart parser will analyze structured key-value lines and tab-separated text to organize the content into spreadsheet rows."
      },
      {
        "q": "Are my confidential documents private?",
        "a": "Yes. The Word document is unpacked and parsed directly in your browser memory without server persistence."
      }
    ],
    "metaTitle": "Word to Excel Converter Online Free — DOCX to XLSX | PDFora",
    "metaDescription": "Extract tables and structured data from Word documents (.docx) into Excel (.xlsx) spreadsheets online for free. Fast in-browser data extraction.",
    "h1Title": "Word to Excel Converter Online",
    "primaryKeywords": [
      "word to excel",
      "convert docx to xlsx",
      "word table to excel",
      "doc to excel converter",
      "word to spreadsheet"
    ],
    "relatedToolIds": [
      "excel-to-word",
      "word-to-pdf",
      "pdf-to-excel",
      "excel-to-pdf"
    ]
  },
  {
    "id": "video-to-audio",
    "name": "Video to Audio",
    "slug": "video-to-audio",
    "path": "/video-to-audio",
    "category": "audio",
    "shortDesc": "Extract MP3, WAV, AAC, M4A, OGG, or FLAC audio from any video.",
    "description": "Extract high-fidelity audio tracks from video files including MP4, WebM, MKV, AVI, MOV, WMV, FLV, and TS without video re-encoding artifacts.",
    "iconName": "Music",
    "badge": "Popular",
    "acceptedTypes": "video/*,.mp4,.webm,.mkv,.avi,.mov,.flv,.wmv,.mpeg,.mpg,.m4v,.3gp,.ogv,.ts",
    "acceptedFileLabel": "Video files (MP4, WebM, MKV, MOV, AVI, etc.)",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Extracts genuine audio streams directly with FFmpeg transcoding",
      "Supports MP3, WAV, AAC, M4A, OGG, and FLAC output formats",
      "Custom bitrate selection from 96 kbps up to 320 kbps studio quality",
      "Integrated in-browser audio player preview and instant download"
    ],
    "steps": [
      "Upload your video file (MP4, WebM, MKV, MOV, AVI, etc.).",
      "Select your desired audio format (MP3, WAV, M4A, etc.) and bitrate.",
      "Download your pristine, extracted audio file immediately."
    ],
    "overview": "Whether you want to extract a lecture from a webinar recording, create a podcast audio track from a video interview, or pull background music from a clip, PDFora Video to Audio tool provides studio-grade audio extraction powered by FFmpeg.",
    "useCases": [
      {
        "title": "Podcasts & Webinar Audio",
        "desc": "Strip video streams from Zoom, Teams, or YouTube recordings to distribute lightweight audio-only episodes."
      },
      {
        "title": "Music & Sound Effects",
        "desc": "Extract sample clips, dialogue lines, and background music tracks for video editing and remixing."
      },
      {
        "title": "Voice Memos & Interviews",
        "desc": "Convert video interviews into compact MP3 or AAC files for automated transcription and audio notes."
      },
      {
        "title": "Lossless Studio Audio Extraction",
        "desc": "Export 24-bit/16-bit uncompressed WAV or FLAC audio tracks for music production and DAWs."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Input Formats",
        "value": "MP4, WebM, MKV, AVI, MOV, FLV, WMV, MPEG, MPG, M4V, 3GP, OGV, TS (up to 200 MB)"
      },
      {
        "label": "Output Formats",
        "value": "MP3 (LAME), WAV (PCM 16-bit), AAC, M4A (AAC-LC), OGG (Vorbis), FLAC (Lossless)"
      },
      {
        "label": "Audio Bitrates",
        "value": "320 kbps (Ultra), 256 kbps (High), 192 kbps (Standard), 128 kbps (Balanced), 96 kbps"
      },
      {
        "label": "Engine",
        "value": "Server-side FFmpeg transcode pipeline with automated temp-file cleanup"
      }
    ],
    "proTips": [
      "Choose MP3 for universal playback on smartphones, car stereos, and portable media players.",
      "Select WAV or FLAC if you plan on editing the audio track in Audacity, Premiere, or Final Cut.",
      "Use the 192 kbps bitrate for the optimal balance of acoustic clarity and compact file size."
    ],
    "faqs": [
      {
        "q": "Does this produce a real MP3/WAV file or just rename the extension?",
        "a": "PDFora executes actual FFmpeg audio demuxing and encoding. The resulting file contains genuine decoded audio headers and bitstreams."
      },
      {
        "q": "What if my video does not have an audio track?",
        "a": "The engine will detect that no audio stream exists in the video container and inform you with a clear notice."
      },
      {
        "q": "Are my uploaded videos stored permanently?",
        "a": "No. Uploaded files and temporary audio outputs are strictly deleted immediately following conversion completion."
      }
    ],
    "metaTitle": "Video to Audio Converter Online Free — MP4 to MP3 Extractor | PDFora",
    "metaDescription": "Extract high-quality MP3, WAV, AAC, and M4A audio from MP4, WebM, MKV, and AVI video files online for free. Fast client-side audio extraction.",
    "h1Title": "Video to Audio Converter Online",
    "primaryKeywords": [
      "video to audio",
      "mp4 to mp3 converter",
      "extract audio from video",
      "video to mp3 online free",
      "movie sound extractor"
    ],
    "relatedToolIds": [
      "audio-compressor",
      "video-converter",
      "video-compressor",
      "image-converter"
    ]
  },
  {
    "id": "audio-compressor",
    "name": "Audio Compressor",
    "slug": "audio-compressor",
    "path": "/audio-compressor",
    "category": "audio",
    "shortDesc": "Reduce audio file size with quality presets and bitrate controls.",
    "description": "Compress MP3, WAV, AAC, M4A, OGG, and FLAC audio files to reduce file size for email attachments, podcasts, and mobile storage.",
    "iconName": "Minimize2",
    "badge": "New",
    "acceptedTypes": "audio/*,.mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,.aiff,.opus",
    "acceptedFileLabel": "Audio files (MP3, WAV, M4A, OGG, FLAC, etc.)",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Reduces audio file size by up to 80% while retaining clear vocal and acoustic fidelity",
      "Presets for High Quality (192k), Balanced (128k), and Maximum Compression (64k)",
      "Accurate real-time file size comparison and space savings calculation",
      "Supports MP3, M4A, OGG, and OPUS output containers"
    ],
    "steps": [
      "Upload your audio file (MP3, WAV, M4A, FLAC, etc.).",
      "Choose your compression preset or target output container.",
      "Download your compact, optimized audio file."
    ],
    "overview": "Uncompressed audio recordings and high-bitrate tracks consume substantial disk space and frequently fail to send over email or messaging apps. PDFora Audio Compressor applies psychoacoustic compression algorithms to shrink audio files without introducing harsh audio distortion.",
    "useCases": [
      {
        "title": "Email & WhatsApp Attachments",
        "desc": "Reduce 30 MB voice recordings and music tracks down to lightweight files that send instantly."
      },
      {
        "title": "Podcast Distribution",
        "desc": "Compress podcast episodes to standard 128 kbps or 96 kbps bitrates to minimize streaming bandwidth."
      },
      {
        "title": "Mobile Phone & Cloud Storage Savings",
        "desc": "Compress large WAV studio sessions into high-quality MP3s to free up valuable storage space."
      },
      {
        "title": "Website & App Sound Effects",
        "desc": "Optimize UI audio assets and game sound effects for rapid web loading and low memory usage."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Inputs",
        "value": "MP3, WAV, AAC, M4A, OGG, FLAC, WMA, AIFF, OPUS (up to 200 MB)"
      },
      {
        "label": "Output Containers",
        "value": "MP3 (MPEG Audio), M4A (AAC), OGG (Vorbis), OPUS"
      },
      {
        "label": "Bitrate Profiles",
        "value": "192 kbps (High Quality), 128 kbps (Balanced), 64 kbps (Max Compression)"
      },
      {
        "label": "Processing Engine",
        "value": "FFmpeg psychoacoustic compression with perceptual rate allocation"
      }
    ],
    "proTips": [
      "Converting uncompressed WAV files to 192 kbps MP3 reduces file size by over 85% with no audible difference to the human ear.",
      "For spoken-word audio, speech recordings, and audiobooks, the \"Maximum Savings\" (64 kbps) preset produces tiny file sizes with clear vocal clarity.",
      "Use the integrated audio player to audition the compressed file before downloading."
    ],
    "faqs": [
      {
        "q": "Will my audio lose noticeable sound quality?",
        "a": "Our compression presets are tuned using psychoacoustic models that remove imperceptible frequencies, maintaining crisp dialogue and music."
      },
      {
        "q": "What if the audio is already heavily compressed?",
        "a": "If a file is already encoded at a low bitrate (e.g. 64 kbps), compressing it further may yield modest size savings. PDFora accurately reports exact bytes saved."
      },
      {
        "q": "Are my audio recordings kept private?",
        "a": "Yes. Files are processed in temporary memory sessions and automatically deleted upon completion."
      }
    ],
    "metaTitle": "Audio Compressor Online Free — Reduce MP3 & Audio Size | PDFora",
    "metaDescription": "Compress MP3, WAV, AAC, and M4A audio files online for free. Reduce file size for podcasts, voice notes, and email while maintaining crystal-clear sound.",
    "h1Title": "Audio Compressor Online Free",
    "primaryKeywords": [
      "audio compressor",
      "compress mp3 online",
      "reduce audio file size",
      "shrink mp3",
      "sound compressor free"
    ],
    "relatedToolIds": [
      "video-to-audio",
      "video-compressor",
      "video-converter",
      "image-compressor"
    ]
  },
  {
    "id": "image-converter",
    "name": "Image Converter",
    "slug": "image-converter",
    "path": "/image-converter",
    "category": "images",
    "popular": true,
    "shortDesc": "Convert images between JPG, PNG, WebP, AVIF, TIFF, and GIF.",
    "description": "Transform images between formats with full transparency preservation, custom compression quality sliders, and lossless encoding options.",
    "iconName": "RefreshCw",
    "badge": "Popular",
    "acceptedTypes": "image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.avif,.svg,.ico",
    "acceptedFileLabel": "Image files (JPG, PNG, WebP, AVIF, TIFF, GIF, BMP, etc.)",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Converts between JPG, PNG, WebP, AVIF, TIFF, and GIF formats",
      "Preserves alpha transparency channels across compatible formats",
      "Custom quality sliders and bit-for-bit lossless compression modes",
      "Instant image preview with accurate size comparison"
    ],
    "steps": [
      "Upload your image (JPG, PNG, WebP, GIF, BMP, TIFF, AVIF).",
      "Select your target format and adjust quality or lossless settings.",
      "Download your converted, high-resolution image."
    ],
    "overview": "Different platforms and publishing workflows require different image formats: WebP for modern web performance, PNG for transparent graphics, JPG for photo compatibility, and AVIF for next-generation compression. PDFora Image Converter delivers instant, high-fidelity conversions with granular quality controls.",
    "useCases": [
      {
        "title": "Web & App Performance Optimization",
        "desc": "Convert heavy PNG and JPG photos into lightweight WebP or AVIF images to boost website page load speed."
      },
      {
        "title": "Transparent Logo & Graphic Conversion",
        "desc": "Convert transparent PNG logos into WebP for modern websites or TIFF for high-resolution print design."
      },
      {
        "title": "Universal Device Compatibility",
        "desc": "Convert modern HEIF/AVIF/WebP images into universal JPG format for older software and office suites."
      },
      {
        "title": "Print & Desktop Publishing",
        "desc": "Export images to high-depth TIFF format for commercial printing and raster publishing."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Inputs",
        "value": "JPG, JPEG, PNG, WebP, GIF, BMP, TIFF, TIF, AVIF, SVG, ICO (up to 50 MB)"
      },
      {
        "label": "Target Outputs",
        "value": "WebP (Next-Gen), PNG (Lossless), JPG (Universal), AVIF (High Efficiency), TIFF, GIF"
      },
      {
        "label": "Quality Control",
        "value": "20% to 100% lossy slider + Bit-for-Bit Lossless toggle"
      },
      {
        "label": "Engine",
        "value": "High-performance Libvips / Sharp image processing engine"
      }
    ],
    "proTips": [
      "Converting PNG graphics with flat colors and transparent backgrounds to WebP can reduce file size by 70% while keeping transparency.",
      "When converting PNG to JPG, remember that JPG does not support transparency and will place transparent pixels over a clean white background.",
      "For maximum web performance and Core Web Vitals scores, AVIF and WebP are the recommended modern formats."
    ],
    "faqs": [
      {
        "q": "Is image transparency preserved?",
        "a": "Yes! When converting between formats that support transparency (PNG, WebP, AVIF, TIFF), full alpha channel transparency is preserved."
      },
      {
        "q": "Can I choose the output quality?",
        "a": "Yes. For lossy formats (JPG, WebP, AVIF), you can set the exact quality from 20% to 100%, or toggle Lossless mode for WebP and AVIF."
      },
      {
        "q": "Are my private photos uploaded to external servers?",
        "a": "No. Conversions occur in transient memory sessions and all data is cleaned up immediately upon download."
      }
    ],
    "metaTitle": "Free Image Converter Online — Convert JPG, PNG, WebP, GIF | PDFora",
    "metaDescription": "Convert images between JPG, PNG, WebP, AVIF, GIF, and BMP formats online for free. Batch conversion with custom quality settings in your browser.",
    "h1Title": "Free Online Image Converter",
    "primaryKeywords": [
      "image converter",
      "convert jpg to png",
      "webp converter online",
      "png to jpg converter",
      "photo format converter"
    ],
    "relatedToolIds": [
      "image-compressor",
      "image-background-remover",
      "jpg-to-pdf",
      "pdf-to-jpg"
    ]
  },
  {
    "id": "video-converter",
    "name": "Video Converter",
    "slug": "video-converter",
    "path": "/video-converter",
    "category": "video",
    "shortDesc": "Convert videos between MP4, WebM, MKV, AVI, MOV, WMV, and OGV.",
    "description": "Transcode video files into different containers and codecs with resolution scaling (1080p, 720p, 480p) and balanced encoding presets.",
    "iconName": "FileVideo",
    "badge": "Popular",
    "acceptedTypes": "video/*,.mp4,.webm,.mkv,.avi,.mov,.flv,.wmv,.mpeg,.mpg,.m4v,.3gp,.ogv,.ts",
    "acceptedFileLabel": "Video files (MP4, WebM, MKV, MOV, AVI, etc.)",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Transcodes between MP4, WebM, MKV, MOV, AVI, WMV, FLV, and OGV",
      "Resolution scaling options: Keep Native, 1080p FHD, 720p HD, 480p SD, 360p Web",
      "Encoding quality profiles for High Fidelity, Balanced, and Fast transcode",
      "Automatic audio track synchronization and video preview player"
    ],
    "steps": [
      "Upload your video file (MP4, WebM, MKV, MOV, AVI, etc.).",
      "Choose your target video container and optional resolution downscale.",
      "Download your converted, playable video file."
    ],
    "overview": "Compatibility problems frequently prevent videos from playing across different operating systems, media players, smart TVs, and web browsers. PDFora Video Converter transcodes videos into universally compatible MP4 (H.264/AAC), web-ready WebM (VP9/Opus), Apple-friendly QuickTime MOV, or high-capacity MKV containers with guaranteed playback.",
    "useCases": [
      {
        "title": "Universal MP4 Transcoding",
        "desc": "Convert incompatible MKV, AVI, and WMV video downloads into standard MP4 files playable on any device."
      },
      {
        "title": "HTML5 Web Video Embedding",
        "desc": "Convert videos to WebP/WebM format for royalty-free, hardware-accelerated playback on web browsers."
      },
      {
        "title": "Video Editing & Production",
        "desc": "Transcode recorded footage into QuickTime MOV or MP4 for editing in DaVinci Resolve and Adobe Premiere."
      },
      {
        "title": "Resolution Rescaling",
        "desc": "Downscale 4K and 1080p phone recordings to 720p or 480p for instant sharing over messaging apps."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Inputs",
        "value": "MP4, WebM, MKV, AVI, MOV, FLV, WMV, MPEG, MPG, M4V, 3GP, OGV, TS (up to 200 MB)"
      },
      {
        "label": "Output Containers",
        "value": "MP4 (H.264/AAC), WebM (VP9/Opus), MKV, MOV (QuickTime), AVI (MPEG-4), WMV, OGV"
      },
      {
        "label": "Resolution Options",
        "value": "Native (Keep Source), 1080p (1920x1080), 720p (1280x720), 480p, 360p"
      },
      {
        "label": "Transcode Engine",
        "value": "FFmpeg multi-threaded video encoding with web-optimized faststart metadata"
      }
    ],
    "proTips": [
      "MP4 with H.264 video and AAC audio is the world standard for 100% universal playback across smartphones, computers, and TVs.",
      "If embedding a video on a website, WebM format offers higher visual quality at lower bitrates.",
      "Downscaling a 1080p video to 720p reduces file size substantially while remaining crisp on mobile screens."
    ],
    "faqs": [
      {
        "q": "Does this perform actual video transcoding?",
        "a": "Yes. PDFora uses FFmpeg to decode the source video bitstream and re-encode it with target codecs (such as libx264 or libvpx-vp9)."
      },
      {
        "q": "Will the audio stay synchronized?",
        "a": "Yes. The transcode pipeline preserves precise timecode timestamps, ensuring synchronized audio and video."
      },
      {
        "q": "Are uploaded videos private?",
        "a": "Completely. Files are processed in isolated temporary workspaces and permanently removed immediately after encoding."
      }
    ],
    "metaTitle": "Free Video Converter Online — Convert MP4, WebM, MKV, AVI | PDFora",
    "metaDescription": "Convert video files between MP4, WebM, MKV, AVI, and MOV online for free. High-speed encoding with custom resolution presets and universal device compatibility.",
    "h1Title": "Free Online Video Converter",
    "primaryKeywords": [
      "video converter",
      "convert mp4 to webm",
      "mkv to mp4 converter",
      "video format converter",
      "free video converter online"
    ],
    "relatedToolIds": [
      "video-compressor",
      "video-to-audio",
      "audio-compressor",
      "image-converter"
    ]
  },
  {
    "id": "video-compressor",
    "name": "Video Compressor",
    "slug": "video-compressor",
    "path": "/video-compressor",
    "category": "video",
    "shortDesc": "Compress MP4, WebM, and MOV videos to reduce file size.",
    "description": "Compress video files with smart Constant Rate Factor (CRF) presets and resolution scaling to shrink file size by up to 85% for email and sharing.",
    "iconName": "Minimize2",
    "badge": "New",
    "acceptedTypes": "video/*,.mp4,.webm,.mkv,.avi,.mov,.flv,.wmv,.mpeg,.mpg,.m4v,.3gp,.ogv,.ts",
    "acceptedFileLabel": "Video files (MP4, WebM, MKV, MOV, AVI, etc.)",
    "maxFiles": 1,
    "options": [],
    "features": [
      "Compresses video file size by up to 85% using perceptual H.264 & AAC encoding",
      "Presets for High Quality, Balanced, and Maximum Compression",
      "Optional resolution downscaling to 1080p, 720p, or 480p",
      "Displays real calculated size metrics, saved space %, and playable preview"
    ],
    "steps": [
      "Upload your video file (MP4, WebM, MKV, MOV, AVI, etc.).",
      "Select your compression profile and optional resolution downscale.",
      "Download your compact, optimized MP4 video."
    ],
    "overview": "High-definition smartphone videos and screen captures often exceed email limits (25 MB) or discord upload caps. PDFora Video Compressor uses Constant Rate Factor (CRF) rate control to remove redundant visual information and compress video files into lightweight, easily shareable MP4 files without pixelation.",
    "useCases": [
      {
        "title": "Email & Messaging Uploads",
        "desc": "Compress 100 MB smartphone recordings down under 25 MB to send seamlessly on Gmail, Outlook, and WhatsApp."
      },
      {
        "title": "Discord & Social Media Sharing",
        "desc": "Fit gaming highlights and clips within free Discord (25 MB) and social upload limits."
      },
      {
        "title": "Mobile Phone & Cloud Drive Savings",
        "desc": "Compress bulky video folders to free up storage space on Google Drive, Dropbox, and iPhone storage."
      },
      {
        "title": "Online Portals & Learning Submissions",
        "desc": "Satisfy strict video file size upload caps for university submissions, job applications, and certification portals."
      }
    ],
    "technicalSpecs": [
      {
        "label": "Supported Inputs",
        "value": "MP4, WebM, MKV, AVI, MOV, FLV, WMV, MPEG, MPG, M4V, 3GP, TS (up to 200 MB)"
      },
      {
        "label": "Output Standard",
        "value": "Universal MP4 (H.264 Video + AAC Audio + FastStart Web Streaming)"
      },
      {
        "label": "Compression Profiles",
        "value": "High Quality (CRF 23), Balanced (CRF 28), Maximum Compression (CRF 33)"
      },
      {
        "label": "Resolution Scaling",
        "value": "Keep Native, 1080p FHD, 720p HD, 480p SD"
      }
    ],
    "proTips": [
      "Use the \"Balanced\" preset for general video sharing on WhatsApp, Slack, and email.",
      "Combining the \"Maximum Compression\" preset with 720p resolution scaling can shrink file size by over 80%.",
      "All compressed outputs include faststart metadata, meaning videos begin playing instantly when streamed."
    ],
    "faqs": [
      {
        "q": "How much can I reduce my video file size?",
        "a": "Depending on the chosen preset and original resolution, size savings typically range between 40% and 85%."
      },
      {
        "q": "Will the compressed video play on iPhone and Android?",
        "a": "Yes. Outputs are encoded in universal H.264 / AAC MP4 format with yuv420p pixel format for 100% universal mobile and desktop playback."
      },
      {
        "q": "Are my private videos uploaded to remote servers?",
        "a": "Files are processed in isolated transient memory containers and automatically deleted following compression."
      }
    ],
    "metaTitle": "Video Compressor Online Free — Compress MP4 & Video Files | PDFora",
    "metaDescription": "Compress MP4, WebM, MOV, and MKV video files online for free. Shrink video size by up to 85% for Discord, WhatsApp, email, and web without pixelation.",
    "h1Title": "Video Compressor Online Free",
    "primaryKeywords": [
      "video compressor",
      "compress video online free",
      "reduce mp4 size",
      "compress video for discord",
      "shrink video file"
    ],
    "relatedToolIds": [
      "video-converter",
      "video-to-audio",
      "audio-compressor",
      "image-compressor"
    ]
  },
  {
    "id": "jpg-to-png",
    "name": "JPG to PNG",
    "slug": "jpg-to-png",
    "path": "/jpg-to-png",
    "category": "images",
    "shortDesc": "Convert JPG/JPEG images to lossless PNG format online for free with vibrant color depth.",
    "iconName": "ImageIcon"
  },
  {
    "id": "png-to-jpg",
    "name": "PNG to JPG",
    "slug": "png-to-jpg",
    "path": "/png-to-jpg",
    "category": "images",
    "shortDesc": "Convert PNG images to compact JPG format online to reduce file size and increase compatibility.",
    "iconName": "ImageIcon"
  },
  {
    "id": "webp-to-jpg",
    "name": "WebP to JPG",
    "slug": "webp-to-jpg",
    "path": "/webp-to-jpg",
    "category": "images",
    "shortDesc": "Convert modern WebP images to standard JPG format for compatibility with all devices.",
    "iconName": "ImageIcon"
  },
  {
    "id": "jpg-to-webp",
    "name": "JPG to WebP",
    "slug": "jpg-to-webp",
    "path": "/jpg-to-webp",
    "category": "images",
    "shortDesc": "Convert JPG to modern WebP format to reduce file sizes by 30-40% for faster loading.",
    "iconName": "ImageIcon"
  },
  {
    "id": "png-to-webp",
    "name": "PNG to WebP",
    "slug": "png-to-webp",
    "path": "/png-to-webp",
    "category": "images",
    "shortDesc": "Convert PNG to WebP format with transparency preservation and smaller file sizes.",
    "iconName": "ImageIcon"
  },
  {
    "id": "webp-to-png",
    "name": "WebP to PNG",
    "slug": "webp-to-png",
    "path": "/webp-to-png",
    "category": "images",
    "shortDesc": "Convert Google WebP images to lossless PNG with transparent alpha background support.",
    "iconName": "ImageIcon"
  },
  {
    "id": "heic-to-jpg",
    "name": "HEIC to JPG",
    "slug": "heic-to-jpg",
    "path": "/heic-to-jpg",
    "category": "images",
    "shortDesc": "Convert Apple iPhone HEIC/HEIF photos to universal JPG format online in seconds.",
    "iconName": "ImageIcon"
  },
  {
    "id": "heic-to-png",
    "name": "HEIC to PNG",
    "slug": "heic-to-png",
    "path": "/heic-to-png",
    "category": "images",
    "shortDesc": "Convert Apple iPhone HEIC photos to lossless PNG format with transparent background support.",
    "iconName": "ImageIcon"
  },
  {
    "id": "svg-to-png",
    "name": "SVG to PNG",
    "slug": "svg-to-png",
    "path": "/svg-to-png",
    "category": "images",
    "shortDesc": "Convert vector SVG graphics into high-resolution transparent PNG images.",
    "iconName": "ImageIcon"
  },
  {
    "id": "avif-to-jpg",
    "name": "AVIF to JPG",
    "slug": "avif-to-jpg",
    "path": "/avif-to-jpg",
    "category": "images",
    "shortDesc": "Convert next-generation AVIF images to standard universal JPG format.",
    "iconName": "ImageIcon"
  },
  {
    "id": "avif-to-png",
    "name": "AVIF to PNG",
    "slug": "avif-to-png",
    "path": "/avif-to-png",
    "category": "images",
    "shortDesc": "Convert next-gen AVIF images to lossless PNG with transparent background support.",
    "iconName": "ImageIcon"
  },
  {
    "id": "gif-to-png",
    "name": "GIF to PNG",
    "slug": "gif-to-png",
    "path": "/gif-to-png",
    "category": "images",
    "shortDesc": "Convert GIF images and animations into high-quality PNG pictures.",
    "iconName": "ImageIcon"
  },
  {
    "id": "bmp-to-jpg",
    "name": "BMP to JPG",
    "slug": "bmp-to-jpg",
    "path": "/bmp-to-jpg",
    "category": "images",
    "shortDesc": "Convert uncompressed Windows Bitmap BMP files to lightweight JPG format.",
    "iconName": "ImageIcon"
  },
  {
    "id": "tiff-to-jpg",
    "name": "TIFF to JPG",
    "slug": "tiff-to-jpg",
    "path": "/tiff-to-jpg",
    "category": "images",
    "shortDesc": "Convert large scanner and photography TIFF/TIF files to standard JPG photos.",
    "iconName": "ImageIcon"
  },
  {
    "id": "mp4-to-mp3",
    "name": "MP4 to MP3",
    "slug": "mp4-to-mp3",
    "path": "/mp4-to-mp3",
    "category": "video",
    "shortDesc": "Extract high-quality audio tracks from MP4 video files and save as 320kbps MP3.",
    "iconName": "FileVideo"
  },
  {
    "id": "mp4-to-gif",
    "name": "MP4 to GIF",
    "slug": "mp4-to-gif",
    "path": "/mp4-to-gif",
    "category": "video",
    "shortDesc": "Convert video clips into animated GIF memes and lightweight reaction animations.",
    "iconName": "FileVideo"
  },
  {
    "id": "mov-to-mp4",
    "name": "MOV to MP4",
    "slug": "mov-to-mp4",
    "path": "/mov-to-mp4",
    "category": "video",
    "shortDesc": "Convert Apple QuickTime MOV videos to universal H.264 MP4 format online for free.",
    "iconName": "FileVideo"
  },
  {
    "id": "webm-to-mp4",
    "name": "WebM to MP4",
    "slug": "webm-to-mp4",
    "path": "/webm-to-mp4",
    "category": "video",
    "shortDesc": "Convert HTML5 WebM browser screen recordings to standard MP4 video format.",
    "iconName": "FileVideo"
  },
  {
    "id": "avi-to-mp4",
    "name": "AVI to MP4",
    "slug": "avi-to-mp4",
    "path": "/avi-to-mp4",
    "category": "video",
    "shortDesc": "Convert legacy AVI video files into universal H.264 MP4 format with high clarity.",
    "iconName": "FileVideo"
  },
  {
    "id": "mkv-to-mp4",
    "name": "MKV to MP4",
    "slug": "mkv-to-mp4",
    "path": "/mkv-to-mp4",
    "category": "video",
    "shortDesc": "Convert Matroska MKV videos into universal MP4 files for editing and streaming.",
    "iconName": "FileVideo"
  },
  {
    "id": "mp4-to-webm",
    "name": "MP4 to WebM",
    "slug": "mp4-to-webm",
    "path": "/mp4-to-webm",
    "category": "video",
    "shortDesc": "Convert MP4 videos into lightweight HTML5 WebM videos using VP9 and Opus audio.",
    "iconName": "FileVideo"
  },
  {
    "id": "mp4-to-mov",
    "name": "MP4 to MOV",
    "slug": "mp4-to-mov",
    "path": "/mp4-to-mov",
    "category": "video",
    "shortDesc": "Convert MP4 videos to Apple QuickTime MOV format for Final Cut Pro and Mac editing.",
    "iconName": "FileVideo"
  },
  {
    "id": "mp4-to-avi",
    "name": "MP4 to AVI",
    "slug": "mp4-to-avi",
    "path": "/mp4-to-avi",
    "category": "video",
    "shortDesc": "Convert modern MP4 files into legacy AVI container format with XviD/MPEG-4 encoding.",
    "iconName": "FileVideo"
  },
  {
    "id": "mute-video",
    "name": "Mute Video",
    "slug": "mute-video",
    "path": "/mute-video",
    "category": "video",
    "shortDesc": "Remove soundtrack, background noise, and speech from any video clip instantly.",
    "iconName": "FileVideo"
  }
];

export const FAQS = [
  {
    "question": "Is PDFora completely free to use?",
    "answer": "Yes! PDFora offers free access to all core PDF conversion, compression, merging, and splitting tools with no hidden subscriptions or watermarks."
  },
  {
    "question": "Are my uploaded files private and secure?",
    "answer": "Security and privacy are our foundational principles. PDFora runs document transformations natively in your web browser memory using client-side WebAssembly. Your files are not stored on remote servers."
  },
  {
    "question": "Do I need to install any software or browser extensions?",
    "answer": "No installation required! PDFora is a 100% web-based platform that works seamlessly in modern browsers across Windows, macOS, Linux, iOS, and Android."
  },
  {
    "question": "Can I use PDFora on mobile devices?",
    "answer": "Yes! PDFora is fully responsive and optimized for touch interactions on smartphones and tablets, allowing you to convert and organize documents on the go."
  }
];
