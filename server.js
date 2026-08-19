import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

dotenv.config();

if (ffmpegInstaller && ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller && ffprobeInstaller.path) {
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

// Media temporary directory
const mediaTempDir = path.join(os.tmpdir(), 'pdfora_media_temp');
if (!fs.existsSync(mediaTempDir)) {
  fs.mkdirSync(mediaTempDir, { recursive: true });
}

// Memory upload for small images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/tiff', 'image/gif', 'image/bmp', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload a valid image file.'));
    }
  }
});

// Disk upload for larger media (video / audio up to 200MB)
const mediaUpload = multer({
  dest: mediaTempDir,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security & CORS Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Image Compression API (Sharp)
app.post('/api/image/compress', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
      const { preset = 'balanced', quality, format = 'original', maxWidth } = req.body;
      let qualityNum = 75;

      if (preset === 'high') qualityNum = 88;
      else if (preset === 'balanced') qualityNum = 72;
      else if (preset === 'max') qualityNum = 42;
      else if (quality) qualityNum = Math.max(10, Math.min(100, parseInt(quality, 10) || 75));

      let pipeline = sharp(req.file.buffer);
      const metadata = await pipeline.metadata();

      if (maxWidth && parseInt(maxWidth, 10) > 0 && metadata.width > parseInt(maxWidth, 10)) {
        pipeline = pipeline.resize({ width: parseInt(maxWidth, 10), withoutEnlargement: true });
      }

      let targetMime = req.file.mimetype;
      let targetExt = 'jpg';

      if (format === 'image/webp' || format === 'webp') {
        pipeline = pipeline.webp({ quality: qualityNum, effort: 4 });
        targetMime = 'image/webp';
        targetExt = 'webp';
      } else if (format === 'image/jpeg' || format === 'jpeg' || format === 'jpg') {
        pipeline = pipeline.jpeg({ quality: qualityNum, mozjpeg: true });
        targetMime = 'image/jpeg';
        targetExt = 'jpg';
      } else if (format === 'image/png' || format === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9, quality: qualityNum });
        targetMime = 'image/png';
        targetExt = 'png';
      } else {
        // Keep original
        if (metadata.format === 'png') {
          pipeline = pipeline.png({ compressionLevel: 9 });
          targetMime = 'image/png';
          targetExt = 'png';
        } else if (metadata.format === 'webp') {
          pipeline = pipeline.webp({ quality: qualityNum });
          targetMime = 'image/webp';
          targetExt = 'webp';
        } else {
          pipeline = pipeline.jpeg({ quality: qualityNum, mozjpeg: true });
          targetMime = 'image/jpeg';
          targetExt = 'jpg';
        }
      }

      const outputBuffer = await pipeline.toBuffer();
      const originalSize = req.file.size || req.file.buffer.length;
      const compressedSize = outputBuffer.length;
      const savedBytes = Math.max(0, originalSize - compressedSize);
      const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : '0.0';

      const originalName = req.file.originalname || 'image';
      const baseName = originalName.replace(/\.[^/.]+$/, '');
      const outFilename = `${baseName}_compressed.${targetExt}`;

      res.setHeader('Content-Type', targetMime);
      res.setHeader('Content-Disposition', `attachment; filename="${outFilename}"`);
      res.setHeader('X-Original-Size', originalSize);
      res.setHeader('X-Compressed-Size', compressedSize);
      res.setHeader('X-Saved-Percent', savedPercent);

      return res.send(outputBuffer);
    } catch (processErr) {
      console.error('Image compression error:', processErr);
      return res.status(500).json({ error: 'Failed to compress image file. File may be corrupted.' });
    }
  });
});

// ── 1. Video to Audio API ─────────────────────────────────────────────
app.post('/api/media/video-to-audio', (req, res) => {
  mediaUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded.' });

    const inputPath = req.file.path;
    const { format = 'mp3', bitrate = '192k' } = req.body;
    const targetFormat = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'].includes(format.toLowerCase())
      ? format.toLowerCase()
      : 'mp3';

    const outFilename = `${(req.file.originalname || 'audio').replace(/\.[^/.]+$/, '')}.${targetFormat}`;
    const outputPath = path.join(mediaTempDir, `out_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${targetFormat}`);

    let cmd = ffmpeg(inputPath).noVideo();

    if (targetFormat === 'mp3') {
      cmd = cmd.audioCodec('libmp3lame').audioBitrate(bitrate).toFormat('mp3');
    } else if (targetFormat === 'wav') {
      cmd = cmd.audioCodec('pcm_s16le').toFormat('wav');
    } else if (targetFormat === 'aac') {
      cmd = cmd.audioCodec('aac').audioBitrate(bitrate).toFormat('adts');
    } else if (targetFormat === 'm4a') {
      cmd = cmd.audioCodec('aac').audioBitrate(bitrate).toFormat('ipod');
    } else if (targetFormat === 'ogg') {
      cmd = cmd.audioCodec('libvorbis').audioBitrate(bitrate).toFormat('ogg');
    } else if (targetFormat === 'flac') {
      cmd = cmd.audioCodec('flac').toFormat('flac');
    }

    const mimeMap = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
    };

    cmd
      .on('error', (ffmpegErr) => {
        console.error('FFmpeg extraction error:', ffmpegErr);
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        return res.status(500).json({ error: 'Failed to extract audio track from video file.' });
      })
      .on('end', () => {
        try {
          const stats = fs.statSync(outputPath);
          res.setHeader('Content-Type', mimeMap[targetFormat] || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outFilename)}"`);
          res.setHeader('X-Output-Size', stats.size);

          const readStream = fs.createReadStream(outputPath);
          readStream.pipe(res);
          readStream.on('close', () => {
            try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          });
        } catch (readErr) {
          console.error('File stream error:', readErr);
          try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          return res.status(500).json({ error: 'Failed to deliver converted audio file.' });
        }
      })
      .save(outputPath);
  });
});

// ── 2. Audio Compression API ──────────────────────────────────────────
app.post('/api/media/compress-audio', (req, res) => {
  mediaUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });

    const inputPath = req.file.path;
    const originalSize = req.file.size;
    const { preset = 'balanced', bitrate, format = 'mp3' } = req.body;

    let targetBitrate = '128k';
    if (bitrate) {
      targetBitrate = bitrate.endsWith('k') ? bitrate : `${bitrate}k`;
    } else if (preset === 'high') {
      targetBitrate = '192k';
    } else if (preset === 'balanced') {
      targetBitrate = '128k';
    } else if (preset === 'max') {
      targetBitrate = '64k';
    }

    const targetExt = ['mp3', 'm4a', 'ogg', 'opus'].includes(format.toLowerCase()) ? format.toLowerCase() : 'mp3';
    const outFilename = `${(req.file.originalname || 'audio').replace(/\.[^/.]+$/, '')}_compressed.${targetExt}`;
    const outputPath = path.join(mediaTempDir, `out_audio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${targetExt}`);

    let cmd = ffmpeg(inputPath).noVideo();

    if (targetExt === 'm4a') {
      cmd = cmd.audioCodec('aac').audioBitrate(targetBitrate).toFormat('ipod');
    } else if (targetExt === 'ogg') {
      cmd = cmd.audioCodec('libvorbis').audioBitrate(targetBitrate).toFormat('ogg');
    } else if (targetExt === 'opus') {
      cmd = cmd.audioCodec('libopus').audioBitrate(targetBitrate).toFormat('ogg');
    } else {
      cmd = cmd.audioCodec('libmp3lame').audioBitrate(targetBitrate).toFormat('mp3');
    }

    cmd
      .on('error', (ffmpegErr) => {
        console.error('Audio compression error:', ffmpegErr);
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        return res.status(500).json({ error: 'Failed to compress audio file.' });
      })
      .on('end', () => {
        try {
          const stats = fs.statSync(outputPath);
          const compressedSize = stats.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : '0.0';

          res.setHeader('Content-Type', targetExt === 'm4a' ? 'audio/mp4' : (targetExt === 'ogg' ? 'audio/ogg' : 'audio/mpeg'));
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outFilename)}"`);
          res.setHeader('X-Original-Size', originalSize);
          res.setHeader('X-Compressed-Size', compressedSize);
          res.setHeader('X-Saved-Percent', savedPercent);

          const readStream = fs.createReadStream(outputPath);
          readStream.pipe(res);
          readStream.on('close', () => {
            try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          });
        } catch (readErr) {
          console.error('Audio stream read error:', readErr);
          try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          return res.status(500).json({ error: 'Failed to read compressed audio stream.' });
        }
      })
      .save(outputPath);
  });
});

// ── 3. Image Conversion API (Sharp) ──────────────────────────────────
app.post('/api/media/convert-image', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed.' });
    if (!req.file || !req.file.buffer) return res.status(400).json({ error: 'No image uploaded.' });

    try {
      const { format = 'webp', quality = 80, lossless = 'false' } = req.body;
      const qualityNum = Math.max(10, Math.min(100, parseInt(quality, 10) || 80));
      const isLossless = lossless === 'true' || lossless === true;

      let pipeline = sharp(req.file.buffer);
      const targetExt = (format || 'webp').toLowerCase();
      let targetMime = 'image/webp';

      if (targetExt === 'jpg' || targetExt === 'jpeg') {
        pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: qualityNum, mozjpeg: true });
        targetMime = 'image/jpeg';
      } else if (targetExt === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9 });
        targetMime = 'image/png';
      } else if (targetExt === 'webp') {
        pipeline = pipeline.webp({ quality: qualityNum, lossless: isLossless });
        targetMime = 'image/webp';
      } else if (targetExt === 'avif') {
        pipeline = pipeline.avif({ quality: qualityNum, lossless: isLossless });
        targetMime = 'image/avif';
      } else if (targetExt === 'tiff' || targetExt === 'tif') {
        pipeline = pipeline.tiff({ quality: qualityNum });
        targetMime = 'image/tiff';
      } else if (targetExt === 'gif') {
        pipeline = pipeline.gif();
        targetMime = 'image/gif';
      } else {
        pipeline = pipeline.png();
        targetMime = 'image/png';
      }

      const outBuffer = await pipeline.toBuffer();
      const baseName = (req.file.originalname || 'image').replace(/\.[^/.]+$/, '');
      const outFilename = `${baseName}.${targetExt}`;

      res.setHeader('Content-Type', targetMime);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outFilename)}"`);
      res.setHeader('X-Output-Size', outBuffer.length);
      return res.send(outBuffer);
    } catch (imgErr) {
      console.error('Image convert error:', imgErr);
      return res.status(500).json({ error: 'Failed to convert image format.' });
    }
  });
});

// ── 4. Video Conversion API (FFmpeg) ──────────────────────────────────
app.post('/api/media/convert-video', (req, res) => {
  mediaUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded.' });

    const inputPath = req.file.path;
    const { format = 'mp4', resolution = 'original', quality = 'balanced' } = req.body;
    const targetFormat = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'ogv'].includes(format.toLowerCase())
      ? format.toLowerCase()
      : 'mp4';

    const outFilename = `${(req.file.originalname || 'video').replace(/\.[^/.]+$/, '')}.${targetFormat}`;
    const outputPath = path.join(mediaTempDir, `out_vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${targetFormat}`);

    let cmd = ffmpeg(inputPath);

    // Resolution scale filter
    if (resolution === '1080p') {
      cmd = cmd.outputOptions(['-vf', 'scale=-2:1080']);
    } else if (resolution === '720p') {
      cmd = cmd.outputOptions(['-vf', 'scale=-2:720']);
    } else if (resolution === '480p') {
      cmd = cmd.outputOptions(['-vf', 'scale=-2:480']);
    } else if (resolution === '360p') {
      cmd = cmd.outputOptions(['-vf', 'scale=-2:360']);
    }

    // Quality CRF
    let crf = '23';
    if (quality === 'high') crf = '20';
    else if (quality === 'fast') crf = '28';

    if (targetFormat === 'mp4') {
      cmd = cmd
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions(['-crf', crf, '-preset', 'medium', '-movflags', '+faststart', '-pix_fmt', 'yuv420p'])
        .toFormat('mp4');
    } else if (targetFormat === 'webm') {
      cmd = cmd
        .videoCodec('libvpx-vp9')
        .audioCodec('libopus')
        .outputOptions(['-crf', crf, '-b:v', '0'])
        .toFormat('webm');
    } else if (targetFormat === 'mkv') {
      cmd = cmd
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions(['-crf', crf, '-preset', 'medium'])
        .toFormat('matroska');
    } else if (targetFormat === 'avi') {
      cmd = cmd
        .videoCodec('mpeg4')
        .audioCodec('libmp3lame')
        .outputOptions(['-q:v', '5'])
        .toFormat('avi');
    } else if (targetFormat === 'mov') {
      cmd = cmd
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions(['-crf', crf, '-pix_fmt', 'yuv420p'])
        .toFormat('mov');
    } else if (targetFormat === 'wmv') {
      cmd = cmd
        .videoCodec('wmv2')
        .audioCodec('wmav2')
        .toFormat('asf');
    } else if (targetFormat === 'flv') {
      cmd = cmd
        .videoCodec('flv')
        .audioCodec('libmp3lame')
        .toFormat('flv');
    } else if (targetFormat === 'ogv') {
      cmd = cmd
        .videoCodec('libtheora')
        .audioCodec('libvorbis')
        .toFormat('ogg');
    }

    const mimeMap = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      ogv: 'video/ogg',
    };

    cmd
      .on('error', (ffmpegErr) => {
        console.error('Video convert error:', ffmpegErr);
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        return res.status(500).json({ error: 'Failed to convert video format.' });
      })
      .on('end', () => {
        try {
          const stats = fs.statSync(outputPath);
          res.setHeader('Content-Type', mimeMap[targetFormat] || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outFilename)}"`);
          res.setHeader('X-Output-Size', stats.size);

          const readStream = fs.createReadStream(outputPath);
          readStream.pipe(res);
          readStream.on('close', () => {
            try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          });
        } catch (readErr) {
          console.error('Video deliver error:', readErr);
          try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          return res.status(500).json({ error: 'Failed to deliver converted video stream.' });
        }
      })
      .save(outputPath);
  });
});

// ── 5. Video Compression API (FFmpeg) ─────────────────────────────────
app.post('/api/media/compress-video', (req, res) => {
  mediaUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded.' });

    const inputPath = req.file.path;
    const originalSize = req.file.size;
    const { preset = 'balanced', resolution = 'original' } = req.body;

    let crf = '28';
    let audioBitrate = '128k';
    let scaleOpt = [];

    if (preset === 'high') {
      crf = '23';
      audioBitrate = '128k';
    } else if (preset === 'balanced') {
      crf = '28';
      audioBitrate = '96k';
    } else if (preset === 'max') {
      crf = '33';
      audioBitrate = '64k';
    }

    if (resolution === '1080p') scaleOpt = ['-vf', 'scale=-2:1080'];
    else if (resolution === '720p') scaleOpt = ['-vf', 'scale=-2:720'];
    else if (resolution === '480p') scaleOpt = ['-vf', 'scale=-2:480'];
    else if (resolution === '360p') scaleOpt = ['-vf', 'scale=-2:360'];

    const outFilename = `${(req.file.originalname || 'video').replace(/\.[^/.]+$/, '')}_compressed.mp4`;
    const outputPath = path.join(mediaTempDir, `out_comp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp4`);

    let cmd = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate(audioBitrate)
      .outputOptions([
        '-crf', crf,
        '-preset', 'medium',
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        ...scaleOpt
      ])
      .toFormat('mp4');

    cmd
      .on('error', (ffmpegErr) => {
        console.error('Video compression error:', ffmpegErr);
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        return res.status(500).json({ error: 'Failed to compress video file.' });
      })
      .on('end', () => {
        try {
          const stats = fs.statSync(outputPath);
          const compressedSize = stats.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : '0.0';

          res.setHeader('Content-Type', 'video/mp4');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outFilename)}"`);
          res.setHeader('X-Original-Size', originalSize);
          res.setHeader('X-Compressed-Size', compressedSize);
          res.setHeader('X-Saved-Percent', savedPercent);

          const readStream = fs.createReadStream(outputPath);
          readStream.pipe(res);
          readStream.on('close', () => {
            try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          });
        } catch (readErr) {
          console.error('Video stream deliver error:', readErr);
          try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
          return res.status(500).json({ error: 'Failed to deliver compressed video stream.' });
        }
      })
      .save(outputPath);
  });
});

// Contact Us Form API (Resend)
app.post('/api/contact', async (req, res) => {
  const { name, email, topic, message, _hp, _ts } = req.body || {};

  // Honeypot anti-spam check
  if (_hp) {
    return res.status(200).json({ success: true, message: 'Received' });
  }

  // Submission time check
  if (_ts && typeof _ts === 'number' && Date.now() - _ts < 2000) {
    return res.status(400).json({ error: 'Please submit the form normally.' });
  }

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured in environment variables.');
    return res.status(503).json({ error: 'Email service is currently not configured.' });
  }

  try {
    const resend = new Resend(apiKey);
    const recipient = process.env.TO_EMAIL || 'nimra.developer.8122005@gmail.com';

    const cleanName = String(name).slice(0, 100);
    const cleanEmail = String(email).slice(0, 150);
    const cleanTopic = String(topic).slice(0, 100);
    const cleanMsg = String(message).slice(0, 5000);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb; margin-top: 0;">📩 New Contact Message - PDFora</h2>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
        <p><strong>Topic:</strong> ${cleanTopic}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Message:</strong></p>
        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1; white-space: pre-wrap; line-height: 1.6;">
${cleanMsg}
        </div>
      </div>
    `;

    const sendResult = await resend.emails.send({
      from: 'PDFora Support <contact@nimradev.site>',
      to: [recipient],
      replyTo: cleanEmail,
      subject: `[PDFora Contact] ${cleanTopic} — ${cleanName}`,
      html: emailHtml,
    });

    if (sendResult.error) {
      console.error('Resend error:', sendResult.error);
      return res.status(500).json({ error: sendResult.error.message });
    }

    return res.json({ success: true, id: sendResult.data?.id });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// Serve static frontend assets from dist folder with high-performance caching
const distPath = path.join(__dirname, 'dist');
app.use(
  express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.includes(path.sep + 'assets' + path.sep)) {
        // Vite content-hashed JS & CSS chunks are immutable
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // Standard static files (favicons, manifest, robots, sitemap)
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  })
);

// Fallback to index.html for React Router SPA (never aggressively cache HTML so users always receive fresh builds)
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PDFora server is running on http://0.0.0.0:${PORT}`);
});
