import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { uploadDocument } from '../lib/upload.js';
import { getImageUrl } from '../lib/upload.js';

const r = Router();

// Upload license document
r.post('/', auth(true, ['PROVIDER', 'ADMIN']), uploadDocument.single('document'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }
    
    const documentUrl = getImageUrl(req, req.file.filename);
    res.json({
      filename: req.file.filename,
      url: documentUrl,
      documentUrl: documentUrl, // Alias for consistency
      size: req.file.size
    });
  } catch (e) {
    next(e);
  }
});

export default r;

