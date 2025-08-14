// const multer = require("multer");
// const path = require("path");
// const crypto = require("crypto");

// const storage = multer.memoryStorage();

// const getFileHash = (buffer) => {
//   return crypto.createHash("md5").update(buffer).digest("hex");
// };


// {/*File filter (accept PDF, PNG, JPG, JPEG)*/}
// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|pdf/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   const mime = allowed.test(file.mimetype);
//   if (ext && mime) cb(null, true);
//   else cb(new Error("Only PDF, JPG, and PNG files are allowed"));
// };

// {/*Handle File Upload*/}
// const upload = multer({
//   storage,
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter,
// });

// module.exports = upload;

const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// In-memory storage
const storage = multer.memoryStorage();

// Optional file hash generator (currently unused)
const getFileHash = (buffer) => {
  return crypto.createHash("md5").update(buffer).digest("hex");
};

// Accept only image and PDF types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
  }
};

// Middleware setup
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

module.exports = upload;
