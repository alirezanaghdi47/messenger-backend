// libraries
const path = require("path");
const fs = require("fs");
const express = require("express");
const range = require('range-parser');

const router = express.Router();

router.get("/file/:fileName", async (req, res) => {
    try {
        const { fileName } = req.params;

        const filePath = path.resolve("uploads" , "file" , fileName);

        const headers = {
            'Access-Control-Allow-Origin': "*"
        };

        res.writeHead(200 , headers);
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.get("/music/:fileName", async (req, res) => {
    try {
        const { fileName } = req.params;

        const filePath = path.resolve("uploads" , "music" , fileName);
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'audio/mpeg',
            };

            res.writeHead(206, headers);
            file.pipe(res);
        } else {
            const headers = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            };

            res.writeHead(200, headers);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

router.get("/video/:fileName", async (req, res) => {
    try {
        const { fileName } = req.params;
        const filePath = path.resolve("uploads" , "video" , fileName);

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        const rangeRequest = range(fileSize, req.headers.range, { combine: true });

        if (rangeRequest === -1 || rangeRequest === -2) {
            res.status(416).send('Range Not Satisfiable');
            return;
        }

        const start = rangeRequest[0].start;
        const end = rangeRequest[0].end;

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(filePath, { start, end });
        videoStream.pipe(res);

    } catch (err) {
        res.status(200).json({message: res.__("serverError"), status: "failure"});
    }
});

module.exports = router;
