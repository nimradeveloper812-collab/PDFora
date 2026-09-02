# PDFora — Privacy-First In-Browser PDF Utility Suite

PDFora is a fast, 100% free, and private online document and media transformation platform. Unlike traditional document tools that upload files to cloud servers, PDFora executes all conversions, compression, splitting, and merging **locally inside your browser sandbox** using client-side WebAssembly (Wasm) and JavaScript engines.

**Live Application:** [pdfora.nimradev.site](https://pdfora.nimradev.site)

---

## 🔒 Security & Privacy-First Architecture

* **Zero Server Storage:** Files are loaded directly into browser memory (RAM) and processed client-side. No document data is ever sent to or stored on remote servers.
* **Instant Volatile Memory Clearance:** When you close the browser tab or refresh the page, local memory is instantly cleared by the operating system.
* **No Account Required:** Access all features (Word to PDF, Image Compressor, Excel to PDF, video conversions) without email registration, credit cards, or trial limits.
* **GDPR & HIPAA Friendly:** Since data processing is restricted to the local device, PDFora complies fully with strict data residency regulations.

---

## 🚀 Core Features

### 📄 PDF Organization & Conversion
* **Office to PDF:** High-fidelity conversion of `.docx`, `.xlsx`, and `.pptx` documents to PDF in-browser.
* **Image to PDF:** Convert JPG, PNG, WEBP, and BMP files directly into standardized PDF files.
* **Merge & Split:** Combine multiple files or extract custom page ranges locally.
* **PDF Protections:** Encrypt with custom passwords or decrypt/unlock secure PDFs.
* **Edit & Annotate:** Rotate, crop, add page numbers, or watermark documents.

### 🖼️ Image & Media Tools
* **Image Compressor:** Compress JPG/PNG/WEBP files with adjustable quality sliders to save disk space.
* **Background Remover:** Transparent background extraction using in-browser AI segmentation model.
* **Video & Audio Conversion:** Convert video to audio (MP4 to MP3) or compress video sizes.

---

## 🛠️ Tech Stack & Libraries

* **Frontend:** React 19, Vite, Tailwind CSS 4, React Router 7
* **Client-Side Engines:**
  * `pdf-lib` — PDF rendering and metadata modifications.
  * `@imgly/background-removal` — In-browser neural network for background segmentation.
  * `onnxruntime-web` — Machine learning runtime for local AI features.
  * `xlsx` / `mammoth` — Excel and Word document parsing.
* **Backend Redirects & API:** Express.js (supporting 301 root domain redirections and contact routing).

---

## 💻 Local Development

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### Setup & Run
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pdfora.git
   cd pdfora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create a `.env.local` file):
   ```env
   VITE_API_URL=http://localhost:5089
   RESEND_API_KEY=your_resend_api_key
   VITE_AD_SLOT_HEADER=your_adsense_header_slot_id
   VITE_AD_SLOT_TOOL=your_adsense_tool_slot_id
   VITE_AD_SLOT_DOWNLOAD=your_adsense_download_slot_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License & Compliance

* **License:** Distributed under the MIT License. See `LICENSE` for details.
* **Advertising Transparency:** Monitored by Google AdSense. Compliant with IAB TCF framework and standard cookie policies. See our [Privacy Policy](https://pdfora.nimradev.site/privacy-policy) for opt-out details.
