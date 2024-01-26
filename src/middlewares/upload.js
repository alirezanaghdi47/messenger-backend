// libraries
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadsPath = path.join(process.cwd(), 'uploads');
            const avatarPath = path.join(process.cwd(), 'uploads', 'avatar');
            const imagePath = path.join(process.cwd(), 'uploads', 'image');
            const filePath = path.join(process.cwd(), 'uploads', 'file');
            const musicPath = path.join(process.cwd(), 'uploads', 'music');
            const videoPath = path.join(process.cwd(), 'uploads', 'video');
            const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnail');

            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath, {recursive: true});
            }

            if (!fs.existsSync(avatarPath)) {
                fs.mkdirSync(avatarPath, {recursive: true});
            }

            if (!fs.existsSync(imagePath)) {
                fs.mkdirSync(imagePath, {recursive: true});
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

            if (!fs.existsSync(thumbnailPath)) {
                fs.mkdirSync(thumbnailPath, {recursive: true});
            }

            cb(null, uploadsPath);
        },
        filename: (req, file, cb) => {
            const extArray = file.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            const time = Date.now();
            const filePath = path.parse(file.originalname).name + '-' + time + '.' + extension;

            cb(null, filePath);

            req.on("aborted" , () => {
                file.stream.on('end', () => {
                    fs.unlink(path.join("uploads" , filePath), (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                });
                file.stream.emit('end');
            })
        },
    })
});

module.exports = {
    upload
}