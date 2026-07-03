import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (req, res, next) => {
  try {
    const { image, filename } = req.body;
    if (!image || !filename) {
      return res.status(400).json({ success: false, message: 'Image and filename are required' });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 string' });
    }

    const type = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const ext = filename.split('.').pop();
    const uniqueFilename = `${crypto.randomBytes(8).toString('hex')}-${Date.now()}.${ext}`;
    
    const uploadDir = path.join(__dirname, '../../../frontend/public/images/products');
    const uploadPath = path.join(uploadDir, uniqueFilename);
    
    // Ensure the uploads directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    await fs.writeFile(uploadPath, buffer);

    const imageUrl = `/images/products/${uniqueFilename}`;

    res.status(200).json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    next(error);
  }
};
