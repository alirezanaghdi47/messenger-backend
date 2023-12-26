// libraries
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadsPath = path.join(process.cwd(), 'uploads');
            const imagePath = path.join(process.cwd(), 'uploads', 'image');
            const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnail');
            const avatarPath = path.join(process.cwd(), 'uploads', 'avatar');
            const filePath = path.join(process.cwd(), 'uploads', 'file');
            const musicPath = path.join(process.cwd(), 'uploads', 'music');
            const videoPath = path.join(process.cwd(), 'uploads', 'video');

            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath, {recursive: true});
            }

            if (!fs.existsSync(imagePath)) {
                fs.mkdirSync(imagePath, {recursive: true});
            }

            if (!fs.existsSync(thumbnailPath)) {
                fs.mkdirSync(thumbnailPath, {recursive: true});
            }

            if (!fs.existsSync(avatarPath)) {
                fs.mkdirSync(avatarPath, {recursive: true});
            }

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {recursive: true});
            }

            if (!fs.existsSync(musicPath)) {
                fs.mkdirSync(musicPath, {recursive: true});
            }

            if (!fs.existsSync(videoPath)) {
                fs.mkdirSync(videoPath, {recursive: true});
            }

            cb(null, uploadsPath);
        },
        filename: (req, file, cb) => {
            const extArray = file.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            cb(null, path.parse(file.originalname).name + '-' + Date.now() + '.' + extension);
        }
    })
});

module.exports = {
    upload
}