process.env.FFMPEG_PATH = '/path/to/gpu-enabled/ffmpeg';
const express = require('express');
const app = express();
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed

const targetWidth = 1280;
const targetHeight = 720;
app.post('/upload', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `./converted/sd${Math.random()}as.mp4`;

    ffmpeg(inputPath)
    .videoCodec('h264_nvenc')
    .audioCodec('aac')
    .outputOptions(['-preset fast', '-movflags +faststart'])
    .videoBitrate(500)
    .videoFilters(`scale=${targetWidth}:${targetHeight}`)
        .output(outputPath)
        .on('end', () => {
            console.log('Video converted and saved successfully');
            res.send(outputPath);
        })
        .on('error', (error) => {
            console.error(`Error converting video: ${error.message}`);
            res.status(500).send('Error converting video');
        })
        .run();
});


app.listen(3000, () => {
    console.log('mdsjifhb');
})