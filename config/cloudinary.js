const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './temp-uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bill-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      // Check if it's one of the allowed formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, JPEG, and PNG images are allowed!'), false);
      }
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to upload file to Cloudinary and clean up
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'orderSplitterBills',
      resource_type: 'image'
    });
    
    // Clean up temporary file
    fs.unlinkSync(filePath);
    
    return result.secure_url;
  } catch (error) {
    // Clean up temporary file even if upload fails
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // File doesn't exist, ignore
    }
    throw error;
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary
};
