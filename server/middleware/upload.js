const multer = require('multer')

// Memory storage only — files are parsed in-request and never written to
// disk, per the project's "no raw file storage" decision (see README).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'].includes(file.mimetype)
    cb(ok ? null : new Error('Only PDF or CSV statements are supported'), ok)
  },
})

module.exports = upload
