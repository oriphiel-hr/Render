import { Router } from 'express';
import { upload, getImageUrl, deleteFile } from '../lib/upload.js';
import { auth } from '../lib/auth.js';

const r = Router();

// Upload single image
r.post('/single', auth(true), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = getImageUrl(req, req.file.filename);
    res.json({
      filename: req.file.filename,
      url: imageUrl,
      size: req.file.size
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Upload multiple images (max 10)
r.post('/multiple', auth(true), upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const images = req.files.map(file => ({
      filename: file.filename,
      url: getImageUrl(req, file.filename),
      size: file.size
    }));
    res.json({ images });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete image
r.delete('/:filename', auth(true), (req, res) => {
  try {
    const { filename } = req.params;
    deleteFile(filename);
    res.json({ message: 'File deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
