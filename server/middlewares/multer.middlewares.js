import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.resolve('./server/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploadSingle = multer({ storage: storage }).single('report');