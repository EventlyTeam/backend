const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const originalName = path.parse(file.originalname).name;
        const extension = path.extname(file.originalname);

        const filePath = `${uniqueSuffix}_${originalName}${extension}`
        cb(null, filePath);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;