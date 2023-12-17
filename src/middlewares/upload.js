// libraries
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");

const client = new S3Client({
    region: "default",
    endpoint: process.env.ENDPOINT,
        credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    },
});

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(process.cwd(), 'uploads');
            
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
        
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const extArray = file.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            cb(null, path.parse(file.originalname).name + '-' + Date.now() + '.' + extension);
        }
    })
});

module.exports = {
    upload, client
}