import {
  FileText, ArrowRightLeft, Edit3, ShieldCheck,
  Minimize2, Cpu, Image as ImageIcon, Video, Layers,
  Scissors, Sparkles, Lock, Wrench, Search, Code,
  FileSpreadsheet, Presentation, FileCode, CheckCircle2
} from 'lucide-react';

export const CATEGORIES_DATA = [
  {
    id: 'pdf-organization',
    name: 'PDF Organization',
    iconName: 'Layers',
    desc: 'Organize, merge, split, extract, and rearrange your PDF pages.',
    subcategories: [
      {
        id: 'merge-split',
        name: 'Merge & Split',
        desc: 'Combine multiple files or separate pages.',
        toolIds: ['merge-pdf', 'split-pdf']
      },
      {
        id: 'page-management',
        name: 'Page Management',
        desc: 'Extract, delete, rotate, or crop PDF pages.',
        toolIds: ['extract-pages-pdf', 'remove-pages-pdf', 'rotate-pdf', 'crop-pdf']
      }
    ]
  },
  {
    id: 'pdf-conversion',
    name: 'PDF Conversion',
    iconName: 'ArrowRightLeft',
    desc: 'Convert PDFs to Word, Excel, PPT, Images, or convert files to PDF.',
    subcategories: [
      {
        id: 'pdf-to-other',
        name: 'PDF → Other Formats',
        desc: 'Export PDF documents to editable Office files or images.',
        toolIds: [
          'pdf-to-word', 'pdf-to-excel', 'pdf-to-powerpoint',
          'pdf-to-jpg', 'pdf-to-png', 'pdf-to-text'
        ]
      },
      {
        id: 'other-to-pdf',
        name: 'Other Formats → PDF',
        desc: 'Convert Office documents, web pages, and photos to PDF.',
        toolIds: [
          'word-to-pdf', 'excel-to-pdf', 'powerpoint-to-pdf',
          'jpg-to-pdf', 'png-to-pdf', 'html-to-pdf', 'scan-to-pdf', 'base64-to-pdf'
        ]
      }
    ]
  },
  {
    id: 'pdf-editing',
    name: 'PDF Editing & Annotations',
    iconName: 'Edit3',
    desc: 'Add text, signatures, watermarks, page numbers, and redact content.',
    subcategories: [
      {
        id: 'edit-annotate',
        name: 'Edit & Annotate',
        desc: 'Fill forms, sign contracts, and brand your PDFs.',
        toolIds: [
          'edit-pdf', 'sign-pdf', 'watermark-pdf',
          'add-page-numbers-pdf', 'redact-pdf', 'pdf-forms'
        ]
      }
    ]
  },
  {
    id: 'pdf-security',
    name: 'PDF Security & Maintenance',
    iconName: 'ShieldCheck',
    desc: 'Password protect, unlock, repair, and validate PDF files.',
    subcategories: [
      {
        id: 'protection-passwords',
        name: 'Protection & Passwords',
        desc: 'Encrypt PDFs with passwords or unlock protected files.',
        toolIds: ['protect-pdf', 'unlock-pdf']
      },
      {
        id: 'validation-maintenance',
        name: 'Validation & Maintenance',
        desc: 'Repair damaged PDFs, compare documents, and save as PDF/A.',
        toolIds: ['repair-pdf', 'compare-pdf', 'pdf-to-pdfa']
      }
    ]
  },
  {
    id: 'pdf-compression',
    name: 'PDF Compression & Size Target',
    iconName: 'Minimize2',
    desc: 'Shrink PDF file sizes for email, forms, and passport applications.',
    subcategories: [
      {
        id: 'compression-optimization',
        name: 'Optimization',
        desc: 'Reduce file sizes to under 100KB, 200KB, 500KB, or custom targets.',
        toolIds: ['compress-pdf', 'compress-to-kb']
      }
    ]
  },
  {
    id: 'pdf-ai',
    name: 'AI Intelligence & Review',
    iconName: 'Cpu',
    desc: 'Review resumes and analyze documents with AI.',
    subcategories: [
      {
        id: 'ai-tools',
        name: 'AI Assistants',
        desc: 'Review resumes with AI.',
        toolIds: [
          'ai-resume-reviewer'
        ]
      }
    ]
  },
  {
    id: 'image-tools',
    name: 'Image Editing & Formats',
    iconName: 'ImageIcon',
    desc: 'Remove image backgrounds, compress photos, resize, and convert formats.',
    subcategories: [
      {
        id: 'image-edit',
        name: 'AI Image Editing',
        desc: 'Remove BG, change background color, resize, and crop photos.',
        toolIds: [
          'image-background-remover', 'change-background',
          'image-compressor', 'resize-image', 'crop-image'
        ]
      },
      {
        id: 'image-formats',
        name: 'Format Converters',
        desc: 'Convert HEIC, WebP, SVG, PNG, JPG, BMP, TIFF, and AVIF.',
        toolIds: [
          'image-converter', 'png-to-svg', 'heic-to-jpg', 'heic-to-png',
          'webp-to-png', 'svg-to-png', 'bmp-to-jpg', 'tiff-to-jpg', 'jfif-to-jpeg',
          'jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'jpg-to-webp',
          'png-to-webp', 'avif-to-jpg', 'avif-to-png', 'gif-to-png'
        ]
      }
    ]
  },
  {
    id: 'media-dev-tools',
    name: 'Media & Developer Utilities',
    iconName: 'Video',
    desc: 'Extract audio, compress video, format JSON, and generate QR codes.',
    subcategories: [
      {
        id: 'video-audio',
        name: 'Video & Audio',
        desc: 'Extract MP3, convert video containers, and compress video clips.',
        toolIds: [
          'video-to-audio', 'audio-compressor', 'video-converter', 'video-compressor',
          'mp4-to-mp3', 'mp4-to-gif', 'mov-to-mp4', 'webm-to-mp4', 'avi-to-mp4',
          'mkv-to-mp4', 'mp4-to-webm', 'mp4-to-mov', 'mp4-to-avi', 'mute-video'
        ]
      },
      {
        id: 'dev-utils',
        name: 'Developer Tools',
        desc: 'Validate JSON, convert JSON to CSV, and create custom QR codes.',
        toolIds: [
          'json-formatter', 'json-to-csv', 'excel-to-word', 'word-to-excel', 'qr-generator'
        ]
      }
    ]
  }
];

export function getCategoryBreadcrumb(toolId) {
  for (const cat of CATEGORIES_DATA) {
    for (const sub of cat.subcategories) {
      if (sub.toolIds.includes(toolId)) {
        return {
          category: cat.name,
          subcategory: sub.name,
          fullPath: `${cat.name} → ${sub.name}`
        };
      }
    }
  }
  return { category: 'PDF Tools', subcategory: 'General', fullPath: 'PDF Tools' };
}
